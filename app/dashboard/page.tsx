"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  FileText,
  Coins,
  ImageIcon,
  CreditCard,
  Sparkles,
  RefreshCw,
  CalendarClock,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/componentsui/ui/button";
import {
  useUser,
  getUserBalance,
  listMyScripts,
  supabase,
  type UserBalance,
  type ScriptHistoryItem,
  type Subscription,
} from "@/lib/supabase";
import { PLANS, getPlanConfig, type PlanTier } from "@/lib/stripe-plans";
import { UserMenu } from "@/components/user-menu";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatNumber(n: number): string {
  return n.toLocaleString("es-ES");
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  // Datos del panel
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [scripts, setScripts] = useState<ScriptHistoryItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [totalChars, setTotalChars] = useState(0);

  async function loadAll(userId: string) {
    setLoadingData(true);
    const [bal, scriptItems] = await Promise.all([
      getUserBalance(),
      listMyScripts(userId, 100),
    ]);
    setBalance(bal);
    setScripts(scriptItems);
    setTotalChars(
      scriptItems.reduce((acc, s) => acc + (s.actual_character_count ?? 0), 0)
    );

    const { data: subData } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);
    if (subData && subData.length > 0) setSubscription(subData[0] as Subscription);

    setLoadingData(false);
  }

  useEffect(() => {
    if (user) loadAll(user.id);
  }, [user]);

  const planTier: PlanTier = (subscription?.plan_tier as PlanTier) ?? "free";
  const planConfig = getPlanConfig(planTier);

  // Uso del plan (lo consumido vs. la cuota del plan)
  const usedRatio =
    balance && planConfig.scriptChars > 0
      ? Math.min(1, 1 - balance.script_character_credits / planConfig.scriptChars)
      : 0;
  const usedPct = Math.max(0, Math.min(100, Math.round(usedRatio * 100)));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950 text-slate-100">
      {/* Barra superior */}
      <nav className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-600 text-sm font-bold text-white">
                S
              </span>
              Scripzy
            </Link>
            <div className="hidden items-center gap-4 text-sm text-slate-300 sm:flex">
              <Link href="/dashboard" className="font-semibold text-white">
                Dashboard
              </Link>
              <Link href="/script-lab" className="hover:text-white">
                Script Lab
              </Link>
              <Link href="/nichos" className="hover:text-white">
                Nichos
              </Link>
              <Link href="/pricing" className="hover:text-white">
                Planes
              </Link>
            </div>
          </div>
          <UserMenu />
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Encabezado */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Mi Dashboard</h1>
            <p className="mt-1 text-sm text-slate-400">
              {user?.email ?? "Cargando…"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => user && loadAll(user.id)}
              disabled={loadingData}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loadingData ? "animate-spin" : ""}`}
              />
              Actualizar
            </Button>
            <Link href="/script-lab">
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                <Sparkles className="mr-2 h-4 w-4" />
                Nuevo guion
              </Button>
            </Link>
          </div>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
            Cargando tu panel…
          </div>
        ) : (
          <>
            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Caracteres disponibles
                  </span>
                  <Coins className="h-5 w-5 text-amber-400" />
                </div>
                <p className="mt-3 text-2xl font-bold text-white">
                  {formatNumber(balance?.script_character_credits ?? 0)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  de {formatNumber(planConfig.scriptChars)} del plan
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Miniaturas
                  </span>
                  <ImageIcon className="h-5 w-5 text-fuchsia-400" />
                </div>
                <p className="mt-3 text-2xl font-bold text-white">
                  {formatNumber(balance?.thumbnail_credits ?? 0)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  créditos de miniatura
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Guiones creados
                  </span>
                  <FileText className="h-5 w-5 text-violet-400" />
                </div>
                <p className="mt-3 text-2xl font-bold text-white">
                  {formatNumber(scripts.length)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  en tu historial
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Caracteres escritos
                  </span>
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="mt-3 text-2xl font-bold text-white">
                  {formatNumber(totalChars)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  producción total acumulada
                </p>
              </div>
            </div>

            {/* Plan actual + uso */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-950/60 to-slate-900/60 p-6 lg:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                      Plan actual
                    </p>
                    <h2 className="mt-1 text-2xl font-bold">
                      {planConfig.name}
                      {planTier !== "free" && (
                        <span className="ml-2 text-base font-medium text-slate-400">
                          ${planConfig.priceUSD}/mes
                        </span>
                      )}
                    </h2>
                  </div>
                  <Link href="/pricing">
                    <Button variant="outline" size="sm">
                      {planTier === "free" ? "Mejorar plan" : "Cambiar plan"}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                {/* Barra de uso */}
                <div className="mt-5">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                    <span>Uso del plan</span>
                    <span>{usedPct}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
                      style={{ width: `${usedPct}%` }}
                    />
                  </div>
                </div>

                {subscription?.current_period_end && (
                  <p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                    <CalendarClock className="h-4 w-4" />
                    Renueva el {formatDate(subscription.current_period_end)}
                    {subscription.status === "active" ? (
                      <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-400">
                        activa
                      </span>
                    ) : (
                      <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-400">
                        {subscription.status}
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Acciones rápidas */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Acciones rápidas
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  <Link
                    href="/script-lab"
                    className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950/40 px-4 py-3 text-sm transition-colors hover:border-violet-500/50 hover:bg-violet-950/30"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-violet-400" />
                      Generar un guion
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </Link>
                  <Link
                    href="/pricing"
                    className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950/40 px-4 py-3 text-sm transition-colors hover:border-violet-500/50 hover:bg-violet-950/30"
                  >
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-emerald-400" />
                      Mejorar mi plan
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Guiones recientes */}
            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Guiones recientes</h2>
                <Link
                  href="/script-lab"
                  className="text-xs font-medium text-violet-400 hover:text-violet-300"
                >
                  Ver todos en Script Lab →
                </Link>
              </div>

              {scripts.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">
                  <FileText className="mx-auto mb-3 h-8 w-8 text-slate-600" />
                  Aún no has creado guiones.{" "}
                  <Link href="/script-lab" className="text-violet-400 underline">
                    Crea el primero
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                        <th className="pb-3 pr-4 font-semibold">Título</th>
                        <th className="pb-3 pr-4 font-semibold">Tema</th>
                        <th className="pb-3 pr-4 font-semibold">Caracteres</th>
                        <th className="pb-3 pr-4 font-semibold">Estado</th>
                        <th className="pb-3 font-semibold">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scripts.slice(0, 10).map((s) => (
                        <tr
                          key={s.id}
                          className="border-b border-slate-800/60 last:border-0"
                        >
                          <td className="py-3 pr-4 font-medium text-white">
                            {s.title}
                          </td>
                          <td className="py-3 pr-4 text-slate-400">{s.topic}</td>
                          <td className="py-3 pr-4 text-slate-300">
                            {formatNumber(s.actual_character_count ?? 0)}
                          </td>
                          <td className="py-3 pr-4">
                            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-400">
                              {s.status}
                            </span>
                          </td>
                          <td className="py-3 text-slate-400">
                            {formatDate(s.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Comparativa de planes */}
            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="mb-4 text-lg font-bold">Tu plan vs. otros planes</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {PLANS.map((p) => {
                  const isCurrent = p.tier === planTier;
                  return (
                    <div
                      key={p.tier}
                      className={`rounded-lg border p-4 text-center ${
                        isCurrent
                          ? "border-violet-500 bg-violet-950/40"
                          : "border-slate-700 bg-slate-950/40"
                      }`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {p.name}
                      </p>
                      <p className="mt-1 text-xl font-bold">
                        {p.priceUSD === 0 ? "Gratis" : `$${p.priceUSD}`}
                      </p>
                      <p className="mt-2 text-[11px] text-slate-400">
                        {formatNumber(p.scriptChars)} car.
                      </p>
                      {isCurrent && (
                        <span className="mt-2 inline-block rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-300">
                          tu plan
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-600">
        Scripzy.app — Clone build · Next.js · Supabase · Stripe · IA
      </footer>
    </div>
  );
}
