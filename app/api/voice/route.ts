import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ENGINE_SECRET, ENGINE_SECRET_HEADER } from "@/lib/engine-secret";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const SUPABASE_URL = "https://mmrdwogxczcrkcyapbkx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_EluJACXjQ_qIjAD-CIRShQ_ulHv7jJD";
const OWNER_ID = "77190e6b-75f1-4ebb-b417-5396b654191e";

// Motor de voz en n8n (OpenAI TTS). URL pública por diseño.
const N8N_VOICE_URL =
  process.env.N8N_VOICE_URL ??
  "https://n8n.automatizacionses.online/webhook/scripzy-voice";

const VOICES = ["onyx", "nova", "alloy", "echo", "fable", "shimmer"];
const CHUNK = 3800;
const MAX_TEXT = 20000;

function getAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Divide el texto en partes ≤CHUNK, cortando por oraciones. */
function splitVoiceText(text: string): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let cur = "";
  for (const s of sentences) {
    const next = (cur + " " + s).trim();
    if (next.length <= CHUNK) {
      cur = next;
    } else {
      if (cur) chunks.push(cur);
      cur = s.trim();
    }
  }
  if (cur) chunks.push(cur);
  const finalChunks: string[] = [];
  for (const c of chunks) {
    if (c.length <= CHUNK) {
      finalChunks.push(c);
      continue;
    }
    for (let i = 0; i < c.length; i += CHUNK) finalChunks.push(c.slice(i, i + CHUNK));
  }
  return finalChunks;
}

async function verifyUser(token: string): Promise<string | null> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

/** Crea el bucket público "voces" si no existe (lazy). */
async function ensureBucket(admin: NonNullable<ReturnType<typeof getAdmin>>) {
  const headers = {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  };
  const bucketRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket/voces`, { headers });
  if (bucketRes.status === 404) {
    await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ id: "voces", name: "voces", public: true }),
    });
  }
  void admin;
}

/**
 * POST /api/voice
 * Body: { text, voice? }
 * Header: Authorization: Bearer <access_token>
 * Genera la narración MP3 y la sube a Storage. Cobra 1 crédito de voz (dueño gratis).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    const voice =
      typeof body?.voice === "string" && VOICES.includes(body.voice)
        ? body.voice
        : "onyx";
    const speed =
      typeof body?.speed === "number" && Number.isFinite(body.speed)
        ? Math.min(2.0, Math.max(0.5, body.speed))
        : 1.0;

    if (text.length < 10) {
      return NextResponse.json(
        { error: "Escribe al menos 10 caracteres para narrar" },
        { status: 400 }
      );
    }
    if (text.length > MAX_TEXT) {
      return NextResponse.json(
        { error: `Máximo ${MAX_TEXT.toLocaleString()} caracteres por narración` },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const userId = await verifyUser(token);
    if (!userId) {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }

    const admin = getAdmin();
    const isOwner = userId === OWNER_ID;

    // ===== Cobro de crédito de voz =====
    if (!isOwner && admin) {
      const { data: bal, error: balErr } = await admin
        .from("user_balances")
        .select("voice_credits")
        .eq("user_id", userId)
        .maybeSingle();
      if (balErr) {
        console.error("[voces] Error leyendo balance (fail-open):", balErr.message);
      } else if (Number(bal?.voice_credits ?? 0) <= 0) {
        return NextResponse.json(
          {
            error: "Sin créditos de voz",
            code: "VOICE_CREDITS_EMPTY",
            message:
              "No te quedan créditos de narración. Sube de plan para seguir narrando tus guiones.",
          },
          { status: 402 }
        );
      }
    }

    // ===== Dividir y generar cada parte =====
    const chunks = splitVoiceText(text);
    const buffers: Buffer[] = [];

    for (const chunk of chunks) {
      const res = await fetch(N8N_VOICE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [ENGINE_SECRET_HEADER]: ENGINE_SECRET,
        },
        body: JSON.stringify({ text: chunk, voice, speed }),
        signal: AbortSignal.timeout(58_000),
      });
      if (!res.ok) {
        console.error("[voces] Motor de voz HTTP", res.status);
        return NextResponse.json(
          { error: "El motor de voz no respondió. Intenta de nuevo." },
          { status: 502 }
        );
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 512) {
        console.error("[voces] Audio sospechosamente pequeño:", buf.length);
        return NextResponse.json(
          { error: "El audio generado llegó incompleto. Intenta de nuevo." },
          { status: 502 }
        );
      }
      buffers.push(buf);
    }

    const mp3 = Buffer.concat(buffers);

    // ===== Subir a Storage =====
    if (!admin) {
      return NextResponse.json(
        { error: "Configuración del servidor incompleta (SUPABASE_SERVICE_ROLE_KEY)" },
        { status: 500 }
      );
    }
    await ensureBucket(admin);

    const objectPath = `${userId}/${Date.now()}-${voice}.mp3`;
    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/voces/${objectPath}`,
      {
        method: "POST",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "audio/mpeg",
          "x-upsert": "true",
        },
        body: mp3,
      }
    );
    if (!uploadRes.ok) {
      console.error("[voces] Storage upload", uploadRes.status, await uploadRes.text());
      return NextResponse.json(
        { error: "El audio se generó pero no pudo guardarse en la biblioteca" },
        { status: 502 }
      );
    }

    const url = `${SUPABASE_URL}/storage/v1/object/public/voces/${objectPath}`;

    // ===== Descontar 1 crédito de voz =====
    if (!isOwner) {
      const { data: bal } = await admin
        .from("user_balances")
        .select("voice_credits")
        .eq("user_id", userId)
        .maybeSingle();
      const current = Number(bal?.voice_credits ?? 0);
      await admin
        .from("user_balances")
        .update({
          voice_credits: Math.max(0, current - 1),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
    }

    return NextResponse.json({
      url,
      path: objectPath,
      voice,
      speed,
      parts: chunks.length,
      sizeBytes: mp3.length,
    });
  } catch (error) {
    console.error("Error en /api/voice:", error);
    return NextResponse.json(
      {
        error: "Error al generar la narración",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/** GET /api/voice - Lista las narraciones del usuario (últimas 24). */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const userId = await verifyUser(token);
    if (!userId) {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return NextResponse.json(
        { error: "Configuración del servidor incompleta" },
        { status: 500 }
      );
    }

    const listRes = await fetch(`${SUPABASE_URL}/storage/v1/object/list/voces`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prefix: `${userId}/`,
        limit: 24,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      }),
    });
    if (!listRes.ok && listRes.status !== 404) {
      return NextResponse.json(
        { error: "No se pudo leer la biblioteca de narraciones" },
        { status: 502 }
      );
    }
    const files = listRes.status === 404 ? [] : await listRes.json();
    const voices = (Array.isArray(files) ? files : []).map((f: { name: string; created_at?: string }) => ({
      name: f.name,
      url: `${SUPABASE_URL}/storage/v1/object/public/voces/${userId}/${f.name}`,
      created_at: f.created_at ?? null,
    }));

    return NextResponse.json({ voices });
  } catch (error) {
    console.error("Error listando voces:", error);
    return NextResponse.json({ error: "Error listando narraciones" }, { status: 500 });
  }
}

/** DELETE /api/voice  Body: { path }  Elimina una narración del usuario. */
export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const userId = await verifyUser(token);
    if (!userId) {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const path = typeof body?.path === "string" ? body.path : "";
    if (!path.startsWith(`${userId}/`) || path.includes("..")) {
      return NextResponse.json({ error: "Ruta inválida" }, { status: 400 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const delRes = await fetch(`${SUPABASE_URL}/storage/v1/object/voces/${path}`, {
      method: "DELETE",
      headers: {
        apikey: serviceKey as string,
        Authorization: `Bearer ${serviceKey}`,
      },
    });
    if (!delRes.ok && delRes.status !== 404) {
      return NextResponse.json({ error: "No se pudo eliminar" }, { status: 502 });
    }
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Error borrando voz:", error);
    return NextResponse.json({ error: "Error borrando narración" }, { status: 500 });
  }
}
