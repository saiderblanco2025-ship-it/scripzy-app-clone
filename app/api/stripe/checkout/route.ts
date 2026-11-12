import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { getPriceIdForTier, isPaidTier } from "@/lib/stripe-plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Datos públicos de Supabase (mismos que lib/supabase.ts)
const SUPABASE_URL = "https://mmrdwogxczcrkcyapbkx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_EluJACXjQ_qIjAD-CIRShQ_ulHv7jJD";

/**
 * POST /api/stripe/checkout
 * Body: { plan: "starter" | "pro" | "premium" | "ultra" }
 * Header: Authorization: Bearer <access_token del usuario>
 *
 * Crea una Checkout Session de suscripción y devuelve { url }
 * para redirigir al usuario a la pasarela de pago de Stripe.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tier = body?.plan;

    if (typeof tier !== "string" || !isPaidTier(tier)) {
      return NextResponse.json(
        { error: "Plan inválido. Usa: starter | pro | premium | ultra" },
        { status: 400 }
      );
    }

    const priceId = getPriceIdForTier(tier);
    if (!priceId) {
      return NextResponse.json(
        { error: `El plan ${tier} aún no tiene precio configurado en Stripe` },
        { status: 503 }
      );
    }

    // Verificar la sesión del usuario con su token
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }
    const user = userData.user;

    // Cliente Stripe lazy
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY no está configurada" },
        { status: 503 }
      );
    }
    const stripe = new Stripe(key);

    const origin =
      process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/pricing?success=1`,
      cancel_url: `${origin}/pricing?canceled=1`,
      client_reference_id: user.id,
      customer_email: user.email ?? undefined,
      metadata: {
        user_id: user.id,
        plan_tier: tier,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_tier: tier,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creando checkout:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Error creando la sesión de pago", details: message },
      { status: 500 }
    );
  }
}
