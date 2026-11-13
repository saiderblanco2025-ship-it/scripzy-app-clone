"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Users, DollarSign, FileText, ImageIcon, RefreshCw } from "lucide-react";
import { Button } from "@/componentsui/ui/button";
import { supabase, useUser } from "@/lib/supabase";
import { AppShell } from "@/components/app-shell";

type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  plan: string;
  subStatus: string;
  renewal: string | null;
  scriptCredits: number;
  thumbCredits: number;
  scriptsCount: number;
  thumbsCount: number;
  createdAt: string | null;
};

type Stats = {
  totals: {
    users: number;
    activeSubscriptions: number;
    mrr: number;
    scripts: number;
    thumbnails: number;
    planCounts: Record<string, number>;
  };
  users: AdminUser[];
};

const planColors: Record<string, string> = {
  free: "bg-slate-500/15 text-slate-400",
  starter: "bg-sky-500/15 text-sky-400",
  pro: "bg-violet-500/15 text-violet-400",
  premium: "bg-fuchsia-500/15 text-fuchsia-400",
  ultra: "bg-amber-500/15 text-amber-400",
};

export default function AdminPage() {
  const { user, loading: authLoading } = useUser();
  const [role, setRole] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar rol del perfil
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token ?? ""}`,
        },
      });
      if (res.status === 403) {
        setRole("creator");
        setLoadingData(false);
        return;
      }
      setRole("superadmin");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Error cargando estadísticas");
      }
      setLoadingData(false);
    })();
  }, [user]);

  async function refresh() {
    if (!user) return;
    setLoadingData(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token ?? ""}`,
        },
      });
      if (res.ok) {
        setStats(await res.json());
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Error cargando estadísticas");
      }
    } finally {
      setLoadingData(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!user) return null;

  if (role === "creator") {
    return (
      <AppShell active="admin">
        <main className="mx-auto max-w-3xl px-4 py-20 text-center">
          <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-rose-500" />
          <h1 className="text-2xl font-bold">Acceso restringido</h1>
          <p className="mt-2 text-sm text-slate-400">
            Esta página es solo para administradores de Scripzy.
          </p>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell active="admin">
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Encabezado */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold">
              <ShieldCheck className="h-7 w-7 text-emerald-400" />
              Panel de Administrador
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Vista global de Scripzy: usuarios, planes y uso.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refresh} disabled={loadingData}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loadingData ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {loadingData ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
            Cargando estadísticas globales…
          </div>
        ) : stats ? (
          <>
            {/* Tarjetas de totales */}
            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <Users className="h-3.5 w-3.5" /> Usuarios
                </p>
                <p className="mt-1 text-2xl font-bold">{stats.totals.users}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Suscripciones activas
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-400">
                  {stats.totals.activeSubscriptions}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <DollarSign className="h-3.5 w-3.5" /> MRR mensual
                </p>
                <p className="mt-1 text-2xl font-bold text-amber-400">
                  ${stats.totals.mrr}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <FileText className="h-3.5 w-3.5" /> Guiones totales
                </p>
                <p className="mt-1 text-2xl font-bold">{stats.totals.scripts}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <ImageIcon className="h-3.5 w-3.5" /> Miniaturas totales
                </p>
                <p className="mt-1 text-2xl font-bold">{stats.totals.thumbnails}</p>
              </div>
            </div>

            {/* Distribución de planes */}
            <div className="mb-8 flex flex-wrap gap-2">
              {Object.entries(stats.totals.planCounts).map(([plan, count]) => (
                <span
                  key={plan}
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                    planColors[plan] ?? "bg-slate-500/15 text-slate-400"
                  }`}
                >
                  {plan}: {count}
                </span>
              ))}
            </div>

            {/* Tabla de usuarios */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Créd. guion</th>
                    <th className="px-4 py-3">Miniaturas</th>
                    <th className="px-4 py-3">Guiones</th>
                    <th className="px-4 py-3">Mini. creadas</th>
                    <th className="px-4 py-3">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-800/60 text-slate-300">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{u.email}</p>
                        {u.role === "superadmin" && (
                          <span className="text-[10px] font-bold uppercase text-emerald-400">
                            superadmin
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            planColors[u.plan] ?? "bg-slate-500/15 text-slate-400"
                          }`}
                        >
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {u.subStatus === "active" ? (
                          <span className="text-emerald-400">● activa</span>
                        ) : (
                          <span className="text-slate-500">{u.subStatus}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {u.scriptCredits >= 1_000_000
                          ? (u.scriptCredits / 1_000_000).toFixed(1).replace(".0", "") + "M"
                          : u.scriptCredits.toLocaleString("es")}
                      </td>
                      <td className="px-4 py-3">{u.thumbCredits}</td>
                      <td className="px-4 py-3">{u.scriptsCount}</td>
                      <td className="px-4 py-3">{u.thumbsCount}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("es") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </main>
    </AppShell>
  );
}
