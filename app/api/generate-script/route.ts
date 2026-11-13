import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateScriptStreaming, type GeneratedScript } from "@/lib/script-engine";
import { ENGINE_SECRET, ENGINE_SECRET_HEADER } from "@/lib/engine-secret";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// El motor IA (n8n + GPT) puede tardar 1-3 minutos en escribir 1.500 palabras.
export const maxDuration = 300;

// Datos públicos de Supabase (mismos que lib/supabase.ts)
const SUPABASE_URL = "https://mmrdwogxczcrkcyapbkx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_EluJACXjQ_qIjAD-CIRShQ_ulHv7jJD";

// Tipos para la petición
interface GenerateScriptRequest {
  topic: string;
  language?: string;
  tone?: string;
  targetAudience?: string;
  forbiddenWords?: string[];
  presetId?: string;
}

/** URL del motor de IA en n8n (configurar en Vercel: N8N_SCRIPT_ENGINE_URL). */
const N8N_ENGINE_URL = process.env.N8N_SCRIPT_ENGINE_URL ?? "";

/**
 * Genera el guion con el motor de IA en n8n (agente GPT + parser estructurado).
 * Devuelve null si no está configurado o si falla (la app usa su motor local).
 */
async function generateWithN8nEngine(params: {
  topic: string;
  language: string;
  tone: string;
  targetAudience: string;
  forbiddenWords: string[];
  userId: string;
}): Promise<GeneratedScript | null> {
  if (!N8N_ENGINE_URL) return null;

  try {
    const res = await fetch(N8N_ENGINE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [ENGINE_SECRET_HEADER]: ENGINE_SECRET,
      },
      body: JSON.stringify({
        topic: params.topic,
        language: params.language,
        tone: params.tone,
        targetAudience: params.targetAudience,
        forbiddenWords: params.forbiddenWords,
        userId: params.userId,
      }),
      signal: AbortSignal.timeout(280_000),
    });

    if (!res.ok) {
      console.error("[n8n engine] HTTP", res.status, await res.text().catch(() => ""));
      return null;
    }

    const data = await res.json();
    const script = data?.script ?? data;
    if (!script || !script.body || !script.outline) {
      console.error("[n8n engine] Respuesta sin campos esperados");
      return null;
    }
    return script as GeneratedScript;
  } catch (error) {
    console.error("[n8n engine] Fallo, usando motor local:", error);
    return null;
  }
}

/**
 * POST /api/generate-script
 *
 * 1) Intenta el motor de IA real en n8n (N8N_SCRIPT_ENGINE_URL).
 * 2) Si no está disponible, usa el motor local de demostración (4 fases).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      topic,
      language = "es",
      tone = "engaging",
      targetAudience = "creadores de contenido",
      forbiddenWords = [],
      presetId,
    } = body as GenerateScriptRequest;

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "El campo 'topic' es obligatorio y debe ser texto" },
        { status: 400 }
      );
    }

    // Verificar la sesión del usuario con su token (el cerebro de n8n es por usuario)
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
    const userId = userData.user.id;

    // Motor de IA real (n8n)
    const aiScript = await generateWithN8nEngine({
      topic,
      language,
      tone,
      targetAudience,
      forbiddenWords,
      userId,
    });

    if (aiScript) {
      return NextResponse.json({
        script: aiScript,
        progress: 100,
        engine: "ai-n8n",
        message: "Guion generado con IA real",
      });
    }

    // Motor local de demostración (fallback)
    const onChunk = (chunk: string, phase: number) => {
      console.log(`[Fase ${phase}] ${chunk.trim()}`);
    };

    const script = await generateScriptStreaming(
      topic,
      language,
      tone,
      targetAudience,
      forbiddenWords,
      onChunk
    );

    return NextResponse.json({
      script,
      progress: 100,
      engine: "local-demo",
      message: "Guion generado con el motor local (IA de n8n no disponible)",
    });
  } catch (error) {
    console.error("Error generando guion:", error);
    return NextResponse.json(
      {
        error: "Error al generar el guion",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/generate-script - Health check
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "script-generation",
    engine: N8N_ENGINE_URL ? "ai-n8n" : "local-demo",
    pipeline: "chained-prompt-runner",
    version: "0.1.0",
  });
}
