import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPlanConfig, type PlanTier } from "@/lib/stripe-plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Clientes LAZY (perezosos):
 * Solo se instancian cuando llega un webhook real.
 * Evita que el build falle cuando faltan las variables de entorno.
 */
let stripeClient: Stripe | null = null;
let adminClient: SupabaseClient | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY no está configurada en las variables de entorno"
      );
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

/** Cliente Supabase con service_role: escribe sin restricciones de RLS. */
function getAdmin(): SupabaseClient {
  if (!adminClient) {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY no está configurada en las variables de entorno"
      );
    }
    adminClient = createClient(
      "https://mmrdwogxczcrkcyapbkx.supabase.co",
      key
    );
  }
  return adminClient;
}

function periodEndToDate(seconds: number | null | undefined): string | null {
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString();
}

function customerId(sub: { customer: string | { id: string } | null }): string | null {
  if (!sub.customer) return null;
  return typeof sub.customer === "string" ? sub.customer : sub.customer.id;
}

/** Aplica los créditos del plan al balance del usuario. */
async function applyPlanCredits(userId: string, tier: PlanTier) {
  const plan = getPlanConfig(tier);
  const now = new Date().toISOString();
  const { error } = await getAdmin()
    .from("user_balances")
    .update({
      script_character_credits: plan.scriptChars,
      thumbnail_credits: plan.thumbnailCredits,
      max_presets_allowed: plan.maxPresets,
      updated_at: now,
    })
    .eq("user_id", userId);
  if (error) throw new Error(`Error actualizando balance: ${error.message}`);
}

// Handlers de eventos de Stripe
const eventHandlers: Record<string, (event: Stripe.Event) => Promise<void>> = {
  /**
   * Pago inicial completado: crear suscripción + aplicar créditos del plan.
   */
  "checkout.session.completed": async (event: Stripe.Event) => {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.user_id;
    const planTier = (session.metadata?.plan_tier ?? "free") as PlanTier;
    if (!userId) throw new Error("Falta user_id en el payload del webhook");

    let subscription: Stripe.Subscription | null = null;
    if (typeof session.subscription === "string") {
      subscription = await getStripe().subscriptions.retrieve(session.subscription);
    }

    const now = new Date().toISOString();
    const values = {
      user_id: userId,
      stripe_customer_id:
        customerId({ customer: session.customer }) ?? session.id,
      stripe_subscription_id: subscription?.id ?? session.id,
      plan_tier: planTier,
      status: subscription?.status ?? "active",
      current_period_end: subscription
        ? periodEndToDate(subscription.current_period_end)
        : null,
      updated_at: now,
    };

    const { error } = await getAdmin()
      .from("subscriptions")
      .upsert(values, { onConflict: "stripe_subscription_id" });
    if (error) throw new Error(`Error guardando suscripción: ${error.message}`);

    await applyPlanCredits(userId, planTier);
    console.log(
      `💳 Webhook: suscripción creada - usuario ${userId}, plan ${planTier}`
    );
  },

  /**
   * Pago mensual exitoso: renovar créditos del plan.
   */
  "invoice.payment_succeeded": async (event: Stripe.Event) => {
    const invoice = event.data.object as Stripe.Invoice;
    const subId =
      typeof invoice.subscription === "string"
        ? invoice.subscription
        : invoice.subscription?.id;

    if (!subId) {
      console.log("✅ Pago exitoso sin suscripción asociada, ignorando");
      return;
    }

    const { data: subRow } = await getAdmin()
      .from("subscriptions")
      .select("user_id, plan_tier")
      .eq("stripe_subscription_id", subId)
      .maybeSingle();

    if (subRow?.user_id && subRow.plan_tier) {
      await applyPlanCredits(subRow.user_id, subRow.plan_tier as PlanTier);
      console.log(
        `✅ Webhook: créditos renovados - usuario ${subRow.user_id}, plan ${subRow.plan_tier}`
      );
    }
  },

  /**
   * Pago fallido: marcar la suscripción como past_due.
   */
  "invoice.payment_failed": async (event: Stripe.Event) => {
    const invoice = event.data.object as Stripe.Invoice;
    const subId =
      typeof invoice.subscription === "string"
        ? invoice.subscription
        : invoice.subscription?.id;

    if (!subId) return;

    const now = new Date().toISOString();
    const { error } = await getAdmin()
      .from("subscriptions")
      .update({ status: "past_due", updated_at: now })
      .eq("stripe_subscription_id", subId);
    if (error) throw new Error(`Error actualizando estado: ${error.message}`);
    console.log(`❌ Webhook: pago fallido para suscripción ${subId}`);
  },

  /**
   * Cambios en la suscripción (plan mejorado, pausada, etc.).
   */
  "customer.subscription.updated": async (event: Stripe.Event) => {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.user_id;
    const planTier = (subscription.metadata?.plan_tier ?? "free") as PlanTier;
    const admin = getAdmin();

    const { data: existing } = await admin
      .from("subscriptions")
      .select("id, user_id, plan_tier")
      .eq("stripe_subscription_id", subscription.id)
      .maybeSingle();

    if (!existing && !userId) {
      console.log(
        `⚠️ Suscripción ${subscription.id} sin user_id conocido, ignorando update`
      );
      return;
    }

    const now = new Date().toISOString();
    const values = {
      user_id: existing?.user_id ?? userId,
      stripe_customer_id: customerId(subscription) ?? subscription.id,
      stripe_subscription_id: subscription.id,
      plan_tier: planTier,
      status: subscription.status,
      current_period_end: periodEndToDate(subscription.current_period_end),
      updated_at: now,
    };

    const { error } = await admin
      .from("subscriptions")
      .upsert(values, { onConflict: "stripe_subscription_id" });
    if (error) throw new Error(`Error actualizando suscripción: ${error.message}`);

    // Si el plan cambió (upgrade/downgrade), aplicar nuevos créditos
    if (existing && planTier !== existing.plan_tier) {
      await applyPlanCredits(existing.user_id, planTier);
    }
    console.log(
      `🔄 Webhook: suscripción actualizada - ${subscription.id}, estado ${subscription.status}, plan ${planTier}`
    );
  },

  /**
   * Cancelación: marcar canceled + volver los créditos al plan Free.
   */
  "customer.subscription.deleted": async (event: Stripe.Event) => {
    const subscription = event.data.object as Stripe.Subscription;
    const admin = getAdmin();
    const now = new Date().toISOString();

    const { data: existing } = await admin
      .from("subscriptions")
      .select("id, user_id")
      .eq("stripe_subscription_id", subscription.id)
      .maybeSingle();

    const targetUserId = subscription.metadata?.user_id ?? existing?.user_id;
    if (!targetUserId) {
      console.log(
        `⚠️ Suscripción ${subscription.id} cancelada sin usuario conocido, ignorando`
      );
      return;
    }

    const { error } = await admin
      .from("subscriptions")
      .update({ status: "canceled", plan_tier: "free", updated_at: now })
      .eq("stripe_subscription_id", subscription.id);
    if (error) throw new Error(`Error cancelando suscripción: ${error.message}`);

    await applyPlanCredits(targetUserId, "free");
    console.log(
      `📛 Webhook: suscripción cancelada - usuario ${targetUserId}, créditos devueltos a Free`
    );
  },
};

/**
 * POST /api/webhooks/stripe
 * Verifica la firma y enruta el evento al handler correspondiente
 */
export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      await request.text(),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`⚠️ Webhook rechazado: ${message}`);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  const handler = eventHandlers[event.type];

  try {
    if (handler) {
      await handler(event);
    } else {
      console.log(`📝 Evento no manejado: ${event.type}`);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`❌ Error en handler ${event.type}:`, error);
    return NextResponse.json({ error: "Error interno del webhook" }, { status: 500 });
  }
}

/**
 * GET - Health check del endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "webhook-endpoint-active",
    stripe_configured: Boolean(process.env.STRIPE_SECRET_KEY),
    supabase_admin_configured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    supported_events: Object.keys(eventHandlers),
    version: "0.1.0",
  });
}
