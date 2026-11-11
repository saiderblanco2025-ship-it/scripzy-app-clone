import { NextResponse } from "next/server";
import Stripe from "stripe";

// Inicializar Stripe con la clave secreta del entorno
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Handlers de eventos de Stripe
const eventHandlers: Record<string, (event: Stripe.Event) => Promise<void>> = {
  "checkout.session.completed": async (event: Stripe.Event) => {
    const session = event.data.object as Stripe.Checkout.Session;

    const planTier = session.metadata?.plan_tier;
    const userId = session.metadata?.user_id;
    const credits = session.metadata?.credits_amount;

    if (!userId) {
      throw new Error("Falta user_id en el payload del webhook");
    }

    // TODO: Actualizar balance en Supabase con service_role key
    console.log(
      `💳 Webhook: créditos asignados - usuario ${userId}, plan ${planTier}, créditos ${credits}`
    );
  },

  "invoice.payment_succeeded": async (event: Stripe.Event) => {
    const invoice = event.data.object as Stripe.Invoice;
    console.log(`✅ Pago exitoso para suscripción ${invoice.subscription}`);
  },

  "invoice.payment_failed": async (event: Stripe.Event) => {
    const invoice = event.data.object as Stripe.Invoice;
    console.log(`❌ Pago fallido para suscripción ${invoice.subscription}`);
  },

  "customer.subscription.updated": async (event: Stripe.Event) => {
    const subscription = event.data.object as Stripe.Subscription;
    console.log(`🔄 Suscripción actualizada, estado: ${subscription.status}`);
  },

  "customer.subscription.deleted": async (event: Stripe.Event) => {
    console.log("📛 Suscripción cancelada");
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
    event = stripe.webhooks.constructEvent(
      await request.text(),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`⚠️ Verificación de firma falló: ${message}`);
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
 * GET - Info del endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "webhook-endpoint-active",
    supported_events: Object.keys(eventHandlers),
    version: "0.1.0",
  });
}