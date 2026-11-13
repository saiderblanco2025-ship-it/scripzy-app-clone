import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ENGINE_SECRET, ENGINE_SECRET_HEADER } from "@/lib/engine-secret";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Datos públicos de Supabase (mismos que lib/supabase.ts)
const SUPABASE_URL = "https://mmrdwogxczcrkcyapbkx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_EluJACXjQ_qIjAD-CIRShQ_ulHv7jJD";

// Motor de miniaturas en n8n (GPT-5.4-mini diseña el prompt + gpt-image-2 genera).
// URL pública por diseño; sobrescribible con env var.
const N8N_THUMBNAILS_URL =
  process.env.N8N_THUMBNAILS_URL ??
  "https://n8n.automatizacionses.online/webhook/scripzy-miniaturas";

// Cliente admin (service role) para Storage, thumbnail_jobs y cobro de créditos.
// El service role NUNCA va al navegador; solo corre en el servidor (Vercel).
function adminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Verifica el Bearer token y devuelve el userId, o null si la sesión es inválida. */
async function verifyToken(
  token: string
): Promise<string | null> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

/**
 * POST /api/thumbnails
 * Body: { prompt, style?, text?, scriptId? }
 * Header: Authorization: Bearer <access_token>
 * Genera una miniatura 16:9 con IA, la guarda en Supabase Storage,
 * registra el job y descuenta 1 crédito de miniatura.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt: string = body?.prompt;
    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: "Describe la miniatura (mínimo 3 caracteres)" },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }

    const admin = adminClient();
    if (!admin) {
      return NextResponse.json(
        { error: "Configuración del servidor incompleta (SUPABASE_SERVICE_ROLE_KEY)" },
        { status: 500 }
      );
    }

    // 1) Verificar saldo de créditos de miniatura
    const { data: balanceRow } = await admin
      .from("user_balances")
      .select("thumbnail_credits")
      .eq("user_id", userId)
      .single();

    // Cuenta del propietario: créditos ilimitados (nunca se bloquea ni se descuenta)
    const OWNER_ID = "77190e6b-75f1-4ebb-b417-5396b654191e";
    const isOwner = userId === OWNER_ID;

    const currentCredits = Number(balanceRow?.thumbnail_credits ?? 0);
    if (currentCredits < 1 && !isOwner) {
      return NextResponse.json(
        {
          error:
            "No tienes créditos de miniatura. Mejora tu plan para generar más.",
          creditsLeft: 0,
        },
        { status: 402 }
      );
    }

    // 2) Llamar al motor de n8n (GPT diseña el prompt y gpt-image-2 genera)
    const engineRes = await fetch(N8N_THUMBNAILS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [ENGINE_SECRET_HEADER]: ENGINE_SECRET,
      },
      body: JSON.stringify({
        prompt: prompt.trim().slice(0, 1000),
        style: typeof body?.style === "string" ? body.style : "viral",
        text: typeof body?.text === "string" ? body.text.slice(0, 60) : "",
      }),
      signal: AbortSignal.timeout(280_000),
    });

    if (!engineRes.ok) {
      console.error("[n8n miniaturas] HTTP", engineRes.status);
      return NextResponse.json(
        { error: "El motor de miniaturas no respondió. Intenta de nuevo." },
        { status: 502 }
      );
    }

    const imageBytes = Buffer.from(await engineRes.arrayBuffer());
    // Validar que sea un PNG real (magic bytes 89 50 4E 47)
    const isPng =
      imageBytes.length > 8 &&
      imageBytes[0] === 0x89 &&
      imageBytes[1] === 0x50 &&
      imageBytes[2] === 0x4e &&
      imageBytes[3] === 0x47;
    if (imageBytes.length < 1000 || !isPng) {
      console.error("[n8n miniaturas] Respuesta no es un PNG válido");
      return NextResponse.json(
        { error: "La IA no devolvió una imagen válida. Intenta de nuevo." },
        { status: 502 }
      );
    }

    // 3) Subir a Supabase Storage (bucket público 'miniaturas'; se crea si falta)
    const storageHeaders = {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    };
    const bucketRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket/miniaturas`, {
      headers: storageHeaders,
    });
    if (!bucketRes.ok) {
      await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
        method: "POST",
        headers: { ...storageHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "miniaturas", public: true }),
      });
    }

    const objectPath = `${userId}/${Date.now()}.png`;
    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/miniaturas/${objectPath}`,
      {
        method: "POST",
        headers: { ...storageHeaders, "Content-Type": "image/png" },
        body: new Uint8Array(imageBytes),
      }
    );
    if (!uploadRes.ok) {
      console.error("[storage] upload", uploadRes.status, await uploadRes.text().catch(() => ""));
      return NextResponse.json(
        { error: "No se pudo guardar la miniatura. Intenta de nuevo." },
        { status: 502 }
      );
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/miniaturas/${objectPath}`;

    // 4) Registrar el job en thumbnail_jobs
    await admin.from("thumbnail_jobs").insert({
      user_id: userId,
      script_id: typeof body?.scriptId === "string" && body.scriptId ? body.scriptId : null,
      prompt_used: prompt.trim(),
      reference_type: "manual",
      generated_image_urls: [publicUrl],
      aspect_ratio: "16:9",
    });

    // 5) Descontar 1 crédito de miniatura (el propietario no paga)
    if (!isOwner) {
      await admin
        .from("user_balances")
        .update({ thumbnail_credits: Math.max(0, currentCredits - 1) })
        .eq("user_id", userId);
    }

    return NextResponse.json({
      imageUrl: publicUrl,
      creditsLeft: isOwner ? currentCredits : Math.max(0, currentCredits - 1),
    });
  } catch (error) {
    console.error("Error generando miniatura:", error);
    return NextResponse.json(
      {
        error: "Error al generar la miniatura",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/thumbnails
 * Header: Authorization: Bearer <access_token>
 * Devuelve el historial de miniaturas del usuario (últimas 24).
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }

    const admin = adminClient();
    if (!admin) {
      return NextResponse.json(
        { error: "Configuración del servidor incompleta (SUPABASE_SERVICE_ROLE_KEY)" },
        { status: 500 }
      );
    }

    const { data, error } = await admin
      .from("thumbnail_jobs")
      .select("id, prompt_used, generated_image_urls, aspect_ratio, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(24);

    if (error) {
      console.error("[thumbnail_jobs]", error.message);
      return NextResponse.json({ error: "No se pudo leer el historial" }, { status: 500 });
    }

    return NextResponse.json({ thumbnails: data ?? [] });
  } catch (error) {
    console.error("Error listando miniaturas:", error);
    return NextResponse.json(
      { error: "Error al listar miniaturas" },
      { status: 500 }
    );
  }
}
