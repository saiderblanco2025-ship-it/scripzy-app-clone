import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Datos públicos de Supabase (mismos que lib/supabase.ts)
const SUPABASE_URL = "https://mmrdwogxczcrkcyapbkx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_EluJACXjQ_qIjAD-CIRShQ_ulHv7jJD";

// Motor de nichos en n8n (usa la YouTube Data API con la credencial del usuario).
// La URL del webhook es pública por diseño; se puede sobrescribir con env var.
const N8N_NICHOS_URL =
  process.env.N8N_NICHOS_URL ??
  "https://n8n.automatizacionses.online/webhook/scripzy-nichos";

/**
 * POST /api/nichos
 * Body: { keyword, maxResults?, recencyDays? }
 * Header: Authorization: Bearer <access_token>
 * Devuelve { summary, videos[] } con RPM/demanda/competencia/faceless calculados.
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

    // Verificar la sesión del usuario (protege la cuota de la YouTube API)
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

    const res = await fetch(N8N_NICHOS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keyword: keyword.trim().slice(0, 100),
        maxResults: Math.min(50, Math.max(1, Number(body?.maxResults) || 12)),
        recencyDays: Math.min(365, Math.max(1, Number(body?.recencyDays) || 90)),
      }),
      signal: AbortSignal.timeout(50_000),
    });

    if (!res.ok) {
      console.error("[n8n nichos] HTTP", res.status, await res.text().catch(() => ""));
      return NextResponse.json(
        { error: "El motor de nichos no respondió correctamente. Intenta de nuevo." },
        { status: 502 }
      );
    }

    const data = await res.json();
    if (!data || !Array.isArray(data.videos)) {
      console.error("[n8n nichos] Respuesta sin videos");
      return NextResponse.json(
        { error: "Respuesta inválida del motor de nichos" },
        { status: 502 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error buscando nichos:", error);
    return NextResponse.json(
      {
        error: "Error al buscar nichos",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/nichos - Health check
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "niche-finder",
    engine: "ai-n8n",
    version: "0.1.0",
  });
}
