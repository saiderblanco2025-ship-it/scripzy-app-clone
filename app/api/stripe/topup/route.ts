import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { getTopupPack } from "@/lib/stripe-plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Datos públicos de Supabase (mismos que lib/supabase.ts)
const SUPABASE_URL = "https://mmrdwogxczcrkcyapbkx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_EluJACXjQ_qIjAD-CIRShQ_ulHv7jJD";

/**
 * POST /api/stripe/topup
 * Body: { pack: "chars_500k" | "chars_1m" | "thumbs_50" | "thumbs_200" | "thumbs_500" }
 * Header: Authorization: Bearer <access_token>
 *
 * Crea una Checkout Session de PAGO ÚNICO (sin suscripción) con price_data
 * inline — no requiere pre-crear productos en Stripe.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const packKey = body?.pack;

    const pack = typeof packKey === "string" ? getTopupPack(packKey) : null;
    if (!pack) {
      return NextResponse.json(
        { error: "Paquete inválido. Opciones: chars_500k, chars_1m, thumbs_50, thumbs_200, thumbs_500" },
        { status: 400 }
      );
    }

    // Verificar la sesión del usuario
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
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(pack.amountUSD * 100),
            product_data: {
              name: `Scripzy — ${pack.name}`,
              description: pack.detail,
            },
          },
        },
      ],
      success_url: `${origin}/pricing?topup=success`,
      cancel_url: `${origin}/pricing?topup=canceled`,
      client_reference_id: user.id,
      customer_email: user.email ?? undefined,
      metadata: {
        user_id: user.id,
        pack: pack.key,
        pack_name: pack.name,
        kind: pack.kind,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creando checkout top-up:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Error creando la sesión de pago", details: message },
      { status: 500 }
    );
  }
}

/** GET /api/stripe/topup - Health check */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "topup-checkout",
    stripe_configured: Boolean(process.env.STRIPE_SECRET_KEY),
  });
}
