import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ENGINE_SECRET, ENGINE_SECRET_HEADER } from "@/lib/engine-secret";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Datos públicos de Supabase (mismos que lib/supabase.ts)
const SUPABASE_URL = "https://mmrdwogxczcrkcyapbkx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_EluJACXjQ_qIjAD-CIRShQ_ulHv7jJD";

// Motor de research en n8n (YouTube Data API + GPT-5.4). URL pública por diseño.
const N8N_RESEARCH_URL =
  process.env.N8N_RESEARCH_URL ??
  "https://n8n.automatizacionses.online/webhook/scripzy-research";

const MERCADOS = [
  "Global (hispano)",
  "USA",
  "México",
  "España",
  "Colombia",
  "Argentina",
];

/**
 * POST /api/research
 * Body: { tema, mercado? }
 * Header: Authorization: Bearer <access_token>
 * Devuelve { tema, mercado, metricas, videosTop, estudio }.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tema = body?.tema;
    const mercado =
      typeof body?.mercado === "string" && MERCADOS.includes(body.mercado)
        ? body.mercado
        : "Global (hispano)";
    const recencyDays =
      typeof body?.recencyDays === "number" &&
      body.recencyDays >= 30 &&
      body.recencyDays <= 365
        ? Math.round(body.recencyDays)
        : 180;

    if (!tema || typeof tema !== "string" || tema.trim().length < 3) {
      return NextResponse.json(
        { error: "El campo 'tema' es obligatorio (mínimo 3 caracteres)" },
        { status: 400 }
      );
    }

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

    const res = await fetch(N8N_RESEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [ENGINE_SECRET_HEADER]: ENGINE_SECRET,
      },
      body: JSON.stringify({
        tema: tema.trim().slice(0, 120),
        mercado,
        recencyDays,
      }),
      signal: AbortSignal.timeout(115_000),
    });

    if (!res.ok) {
      console.error("[n8n research] HTTP", res.status);
      return NextResponse.json(
        { error: "El motor de research no respondió. Intenta de nuevo." },
        { status: 502 }
      );
    }

    const data = await res.json();
    if (!data || !data.metricas || !data.estudio) {
      console.error("[n8n research] Respuesta sin estudio");
      return NextResponse.json(
        { error: "Respuesta inválida del motor de research" },
        { status: 502 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en research:", error);
    return NextResponse.json(
      {
        error: "Error al generar el estudio de mercado",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/** GET /api/research - Health check */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "research",
    engine: "ai-n8n",
    version: "0.1.0",
  });
}
