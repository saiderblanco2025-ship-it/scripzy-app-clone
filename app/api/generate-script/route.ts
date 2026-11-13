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

/** Dueño de la app: nunca se le descuenta ni se le bloquea. */
const OWNER_ID = "77190e6b-75f1-4ebb-b417-5396b654191e";

function getAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Total de caracteres facturables de un guion generado. */
function countScriptChars(script: GeneratedScript): number {
  if (script.character_count && script.character_count > 0) {
    return Math.round(script.character_count);
  }
  let n = 0;
  n += script.title?.length ?? 0;
  n += script.body?.length ?? 0;
  const o = script.outline;
  if (o) {
    n += o.hook?.length ?? 0;
    n += (o.retention_points ?? []).join(" ").length;
    n += o.climax?.length ?? 0;
    n += o.cta?.length ?? 0;
    for (const s of o.sections ?? []) {
      n += (s.title?.length ?? 0) + (s.main_point?.length ?? 0) + (s.duration_estimate?.length ?? 0);
    }
  }
  const seo = script.seo;
  if (seo) {
    for (const t of seo.titles ?? []) n += t.length;
    n += seo.description?.length ?? 0;
    n += (seo.tags ?? []).join(" ").length;
  }
  return n;
}

/** Cobra caracteres del saldo del usuario. Nunca deja el saldo en negativo. */
async function chargeScriptCredits(
  admin: NonNullable<ReturnType<typeof getAdminClient>>,
  userId: string,
  charsUsed: number
): Promise<number | null> {
  const { data: bal, error } = await admin
    .from("user_balances")
    .select("script_character_credits")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !bal) {
    console.error("[créditos] No se pudo leer balance:", error?.message);
    return null;
  }
  const current = Number(bal.script_character_credits ?? 0);
  const next = Math.max(0, current - charsUsed);
  const { error: updErr } = await admin
    .from("user_balances")
    .update({ script_character_credits: next, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (updErr) {
    console.error("[créditos] Error descontando:", updErr.message);
    return null;
  }
  return next;
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

    // ===== Cobro de créditos de guion =====
    // El dueño nunca paga. El resto necesita saldo (>0) antes de generar.
    const isOwner = userId === OWNER_ID;
    const admin = getAdminClient();

    if (!isOwner && admin) {
      const { data: bal, error: balErr } = await admin
        .from("user_balances")
        .select("script_character_credits")
        .eq("user_id", userId)
        .maybeSingle();

      if (balErr) {
        console.error("[créditos] Error leyendo balance (fail-open):", balErr.message);
      } else {
        const credits = Number(bal?.script_character_credits ?? 0);
        if (credits <= 0) {
          return NextResponse.json(
            {
              error: "Te quedaste sin caracteres",
              code: "INSUFFICIENT_CREDITS",
              message:
                "Tu plan se quedó sin caracteres de guion. Sube de plan o compra un pack de recarga para seguir generando.",
            },
            { status: 402 }
          );
        }
      }
    } else if (!isOwner && !admin) {
      // Sin service role no se puede cobrar: solo registrar.
      console.warn("[créditos] SUPABASE_SERVICE_ROLE_KEY no configurada — no se cobra");
    }

    // Respuesta con cobro aplicado (deduplicado entre los dos motores)
    const respondWithCharge = async (
      script: GeneratedScript,
      engine: string,
      message: string
    ) => {
      const charsUsed = countScriptChars(script);
      let balanceAfter: number | null = null;
      if (!isOwner && admin) {
        balanceAfter = await chargeScriptCredits(admin, userId, charsUsed);
      }
      return NextResponse.json({
        script,
        progress: 100,
        engine,
        message,
        charsUsed: isOwner ? 0 : charsUsed,
        balanceAfter,
        charged: !isOwner && admin !== null,
      });
    };

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
      return respondWithCharge(
        aiScript,
        "ai-n8n",
        "Guion generado con IA real"
      );
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

    return respondWithCharge(
      script,
      "local-demo",
      "Guion generado con el motor local (IA de n8n no disponible)"
    );
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
