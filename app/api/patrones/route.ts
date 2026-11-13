import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ENGINE_SECRET, ENGINE_SECRET_HEADER } from "@/lib/engine-secret";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Datos públicos de Supabase (mismos que lib/supabase.ts)
const SUPABASE_URL = "https://mmrdwogxczcrkcyapbkx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_EluJACXjQ_qIjAD-CIRShQ_ulHv7jJD";

// Motor de patrones en n8n (YouTube + GPT-5.4). URL pública por diseño.
const N8N_PATTERNS_URL =
  process.env.N8N_PATTERNS_URL ??
  "https://n8n.automatizacionses.online/webhook/scripzy-patrones";

/**
 * POST /api/patrones
 * Body: { keyword }
 * Header: Authorization: Bearer <access_token>
 * Devuelve { patterns[], videosAnalyzed, keyword }.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const keyword = body?.keyword;

    if (!keyword || typeof keyword !== "string" || keyword.trim().length < 2) {
      return NextResponse.json(
        { error: "El campo 'keyword' es obligatorio (mínimo 2 caracteres)" },
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

    const res = await fetch(N8N_PATTERNS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [ENGINE_SECRET_HEADER]: ENGINE_SECRET,
      },
      body: JSON.stringify({ keyword: keyword.trim().slice(0, 100) }),
      signal: AbortSignal.timeout(110_000),
    });

    if (!res.ok) {
      console.error("[n8n patrones] HTTP", res.status);
      return NextResponse.json(
        { error: "El motor de patrones no respondió. Intenta de nuevo." },
        { status: 502 }
      );
    }

    const data = await res.json();
    if (!data || !Array.isArray(data.patterns)) {
      console.error("[n8n patrones] Respuesta sin patrones");
      return NextResponse.json(
        { error: "Respuesta inválida del motor de patrones" },
        { status: 502 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error buscando patrones:", error);
    return NextResponse.json(
      {
        error: "Error al analizar patrones",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/** GET /api/patrones - Health check */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "top-patterns",
    engine: "ai-n8n",
    version: "0.1.0",
  });
}
