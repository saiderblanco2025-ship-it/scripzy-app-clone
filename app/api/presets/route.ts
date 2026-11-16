import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ENGINE_SECRET, ENGINE_SECRET_HEADER } from "@/lib/engine-secret";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const SUPABASE_URL = "https://mmrdwogxczcrkcyapbkx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_EluJACXjQ_qIjAD-CIRShQ_ulHv7jJD";
const OWNER_ID = "77190e6b-75f1-4ebb-b417-5396b654191e";

const N8N_PRESETS_URL =
  process.env.N8N_PRESETS_URL ??
  "https://n8n.automatizacionses.online/webhook/scripzy-presets";

function getAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Verifica el Bearer token y devuelve el userId, o null. */
async function verifyToken(token: string): Promise<string | null> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

function authHeader(request: Request) {
  const h = request.headers.get("authorization") || "";
  return h.replace("Bearer ", "").trim();
}

const VALID_TONES = ["engaging", "educational", "persuasive", "entertaining"];
const VALID_PACING = ["slow", "medium", "fast"];

/**
 * POST /api/presets
 * Body: { action: "analyze", channelUrl }  → pide el análisis a n8n
 *       { action: "save",    preset,      }  → guarda el preset en la tabla `presets`
 * Header: Authorization: Bearer <access_token>
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body?.action ?? "analyze";
    const token = authHeader(request);
    if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    const userId = await verifyToken(token);
    if (!userId) return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });

    // ===== ANALIZAR: proxy al motor n8n =====
    if (action === "analyze") {
      const channelUrl =
        typeof body?.channelUrl === "string" ? body.channelUrl.trim() : "";
      if (!channelUrl || channelUrl.length < 6) {
        return NextResponse.json(
          { error: "Ingresa una URL de canal (ej: youtube.com/@NASA)" },
          { status: 400 }
        );
      }
      const res = await fetch(N8N_PRESETS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [ENGINE_SECRET_HEADER]: ENGINE_SECRET,
        },
        body: JSON.stringify({ channelUrl }),
        signal: AbortSignal.timeout(110_000),
      });
      if (!res.ok) {
        console.error("[presets n8n] HTTP", res.status);
        return NextResponse.json(
          { error: "El motor de análisis no respondió. Intenta de nuevo." },
          { status: 502 }
        );
      }
      const data = await res.json();
      return NextResponse.json(data);
    }

    // ===== GUARDAR preset =====
    if (action === "save") {
      const p = body?.preset ?? {};
      const name = typeof p?.preset_name === "string" ? p.preset_name.trim().slice(0, 120) : "";
      if (!name) {
        return NextResponse.json({ error: "El preset no tiene nombre" }, { status: 400 });
      }

      const admin = getAdmin();
      if (!admin) {
        return NextResponse.json(
          { error: "Configuración del servidor incompleta (SUPABASE_SERVICE_ROLE_KEY)" },
          { status: 500 }
        );
      }

      // Límite de presets del plan (solo los usuarios normales; dueño sin límite)
      if (userId !== OWNER_ID) {
        const [balanceRes, countRes] = await Promise.all([
          admin.from("user_balances").select("max_presets_allowed").eq("user_id", userId).maybeSingle(),
          admin.from("presets").select("id", { count: "exact", head: true }).eq("user_id", userId),
        ]);
        const max = Number(balanceRes?.data?.max_presets_allowed ?? 3);
        const used = countRes.count ?? 0;
        if (used >= max) {
          return NextResponse.json(
            {
              error: "Llegaste al límite de presets de tu plan",
              code: "PRESET_LIMIT",
              message: `Tu plan permite ${max} presets. Sube de plan para guardar más.`,
              used,
              max,
            },
            { status: 402 }
          );
        }
      }

      const tone = VALID_TONES.includes(p?.tone) ? p.tone : "engaging";
      const pacing = VALID_PACING.includes(p?.pacing) ? p.pacing : "medium";
      const forbidden = Array.isArray(p?.forbidden_words)
        ? p.forbidden_words.map((w: unknown) => String(w).slice(0, 40)).slice(0, 24)
        : [];

      const narrativeRules = {
        formula_virales: Array.isArray(p?.formula_virales) ? p.formula_virales : [],
        gancho_tipo: p?.gancho_tipo ?? "",
        retention_tactics: Array.isArray(p?.retention_tactics) ? p.retention_tactics : [],
        narrativa_estructura: p?.narrativa_estructura ?? "",
        palabras_firma: Array.isArray(p?.palabras_firma) ? p.palabras_firma : [],
        recipe_script: p?.recipe_script ?? "",
        por_que_funciona: p?.por_que_funciona ?? "",
        ideas_video: Array.isArray(p?.ideas_video) ? p.ideas_video : [],
        verdict: p?.verdict ?? "",
        analyzed_channel: body?.channelName ?? null,
        analyzed_url: body?.channelUrl ?? null,
        monetization: body?.monetization ?? null,
      };

      const { data: inserted, error } = await admin
        .from("presets")
        .insert({
          user_id: userId,
          name,
          target_niche: p?.target_niche ? String(p.target_niche) : null,
          tone,
          audience_profile: p?.audience_profile ? String(p.audience_profile) : null,
          pacing,
          narrative_structure_rules: narrativeRules,
          forbidden_words: forbidden,
          updated_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (error) {
        console.error("[presets] Error guardando:", error.message);
        return NextResponse.json(
          { error: "No se pudo guardar el preset. Intenta de nuevo." },
          { status: 500 }
        );
      }
      return NextResponse.json({ preset: inserted });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (error) {
    console.error("Error en /api/presets:", error);
    return NextResponse.json(
      {
        error: "Error en el módulo de presets",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/** GET /api/presets - Lista los presets del usuario (y cuántos le quedan). */
export async function GET(request: Request) {
  try {
    const token = authHeader(request);
    if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    const userId = await verifyToken(token);
    if (!userId) return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });

    const admin = getAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Configuración del servidor incompleta" },
        { status: 500 }
      );
    }

    const [presetsRes, balanceRes] = await Promise.all([
      admin
        .from("presets")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      admin
        .from("user_balances")
        .select("max_presets_allowed")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

    if (presetsRes.error) {
      console.error("[presets] Error listando:", presetsRes.error.message);
      return NextResponse.json({ error: "No se pudieron cargar tus presets" }, { status: 500 });
    }

    const max = userId === OWNER_ID ? 999 : Number(balanceRes?.data?.max_presets_allowed ?? 3);

    return NextResponse.json({
      presets: presetsRes.data ?? [],
      used: presetsRes.data?.length ?? 0,
      max,
    });
  } catch (error) {
    console.error("Error listando presets:", error);
    return NextResponse.json({ error: "Error listando presets" }, { status: 500 });
  }
}

/** DELETE /api/presets  Body: { id } */
export async function DELETE(request: Request) {
  try {
    const token = authHeader(request);
    if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    const userId = await verifyToken(token);
    if (!userId) return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const id = typeof body?.id === "string" ? body.id : "";
    if (!id) return NextResponse.json({ error: "Falta el id" }, { status: 400 });

    const admin = getAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Configuración del servidor incompleta" },
        { status: 500 }
      );
    }
    const { error } = await admin
      .from("presets")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) {
      console.error("[presets] Error borrando:", error.message);
      return NextResponse.json({ error: "No se pudo eliminar" }, { status: 500 });
    }
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Error borrando preset:", error);
    return NextResponse.json({ error: "Error borrando preset" }, { status: 500 });
  }
}
