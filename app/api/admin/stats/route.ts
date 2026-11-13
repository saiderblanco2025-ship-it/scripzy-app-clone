import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = "https://mmrdwogxczcrkcyapbkx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_EluJACXjQ_qIjAD-CIRShQ_ulHv7jJD";

// Precio mensual por plan (USD) — debe coincidir con lib/stripe-plans.ts
const PLAN_PRICE: Record<string, number> = {
  free: 0,
  starter: 9,
  pro: 19,
  premium: 49,
  ultra: 99,
};

function adminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * GET /api/admin/stats
 * Header: Authorization: Bearer <access_token>
 * Solo para superadmin. Devuelve usuarios, planes, créditos y totales.
 */
export async function GET(request: Request) {
  try {
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
    const requesterId = userData.user.id;

    const admin = adminClient();
    if (!admin) {
      return NextResponse.json(
        { error: "Configuración del servidor incompleta (SUPABASE_SERVICE_ROLE_KEY)" },
        { status: 500 }
      );
    }

    // Verificar que quien pide sea superadmin (por id o user_id)
    let requesterRole: string | null = null;
    {
      const { data } = await admin
        .from("profiles")
        .select("role")
        .eq("id", requesterId)
        .maybeSingle();
      requesterRole = data?.role ?? null;
      if (!requesterRole) {
        const { data: alt } = await admin
          .from("profiles")
          .select("role")
          .eq("user_id", requesterId)
          .maybeSingle();
        requesterRole = alt?.role ?? null;
      }
    }
    if (requesterRole !== "superadmin") {
      return NextResponse.json(
        { error: "Acceso solo para administradores" },
        { status: 403 }
      );
    }

    // Cargar datos (service role ignora RLS)
    const [profilesRes, balancesRes, subsRes, scriptsRes, thumbsRes] =
      await Promise.all([
        admin.from("profiles").select("id, email, full_name, role, created_at").order("created_at", { ascending: false }).limit(500),
        admin.from("user_balances").select("user_id, script_character_credits, thumbnail_credits").limit(1000),
        admin.from("subscriptions").select("user_id, plan_tier, status, current_period_end").limit(1000),
        admin.from("scripts").select("user_id, id").limit(5000),
        admin.from("thumbnail_jobs").select("user_id, id").limit(5000),
      ]);

    const profiles = profilesRes.data ?? [];
    const balances = balancesRes.data ?? [];
    const subs = subsRes.data ?? [];
    const scripts = scriptsRes.data ?? [];
    const thumbs = thumbsRes.data ?? [];

    // Mapas de apoyo
    const balanceByUser = new Map<string, { sc: number; th: number }>();
    for (const b of balances) {
      balanceByUser.set(String(b.user_id), {
        sc: Number(b.script_character_credits ?? 0),
        th: Number(b.thumbnail_credits ?? 0),
      });
    }
    const subByUser = new Map<string, { plan: string; status: string; renewal: string | null }>();
    for (const s of subs) {
      subByUser.set(String(s.user_id), {
        plan: String(s.plan_tier ?? "free"),
        status: String(s.status ?? "inactive"),
        renewal: s.current_period_end ?? null,
      });
    }
    const scriptsByUser = new Map<string, number>();
    for (const s of scripts) {
      scriptsByUser.set(String(s.user_id), (scriptsByUser.get(String(s.user_id)) ?? 0) + 1);
    }
    const thumbsByUser = new Map<string, number>();
    for (const t of thumbs) {
      thumbsByUser.set(String(t.user_id), (thumbsByUser.get(String(t.user_id)) ?? 0) + 1);
    }

    const users = profiles.map((p) => {
      const uid = String(p.id);
      const sub = subByUser.get(uid);
      const bal = balanceByUser.get(uid);
      return {
        id: uid,
        email: p.email ?? "—",
        fullName: p.full_name ?? "",
        role: p.role ?? "creator",
        plan: sub?.plan ?? "free",
        subStatus: sub?.status ?? "none",
        renewal: sub?.renewal ?? null,
        scriptCredits: bal?.sc ?? 0,
        thumbCredits: bal?.th ?? 0,
        scriptsCount: scriptsByUser.get(uid) ?? 0,
        thumbsCount: thumbsByUser.get(uid) ?? 0,
        createdAt: p.created_at ?? null,
      };
    });

    // Totales
    const activeSubs = subs.filter((s) => s.status === "active");
    const mrr = activeSubs.reduce(
      (acc, s) => acc + (PLAN_PRICE[String(s.plan_tier)] ?? 0),
      0
    );

    const planCounts: Record<string, number> = {};
    for (const u of users) {
      planCounts[u.plan] = (planCounts[u.plan] ?? 0) + 1;
    }

    return NextResponse.json({
      totals: {
        users: users.length,
        activeSubscriptions: activeSubs.length,
        mrr,
        scripts: scripts.length,
        thumbnails: thumbs.length,
        planCounts,
      },
      users,
    });
  } catch (error) {
    console.error("Error admin stats:", error);
    return NextResponse.json(
      { error: "Error al cargar estadísticas" },
      { status: 500 }
    );
  }
}
