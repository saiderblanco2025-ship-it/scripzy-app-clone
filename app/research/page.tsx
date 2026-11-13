"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Search,
  Radar,
  Check,
  X,
  TrendingUp,
  Users,
  DollarSign,
  Lightbulb,
  AlertTriangle,
  Calendar,
  Eye,
  Target,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/componentsui/ui/button";
import { supabase, useUser } from "@/lib/supabase";
import { AppShell } from "@/components/app-shell";

const MERCADOS = [
  "Global (hispano)",
  "USA",
  "México",
  "España",
  "Colombia",
  "Argentina",
];

type Metricas = {
  tema: string;
  mercado: string;
  totalVideos: number;
  canalesDistintos: number;
  vistasPromedio: number;
  vistasMediana: number;
  vistasTop: number;
  rpmEstimado: number;
  engagementPromedioPct: number;
  saturacionPct: number;
  canalesGrandes500k: number;
  golpesCanalPequeno: number;
  demanda: string;
  competencia: string;
};

type VideoTop = {
  title: string;
  channel: string;
  subscribers: number;
  views: number;
  ageDays: number;
  url: string;
};

type Estudio = {
  veredicto: string;
  score_demanda: number;
  score_competencia: number;
  score_monetizacion: number;
  score_final: number;
  resumen_ejecutivo: string;
  competencia: { canal: string; subs: number; fortaleza: string; debilidad: string }[];
  angulos: { titulo: string; por_que_funciona: string; dificultad: string }[];
  titulos_probados: string[];
  hooks_ganadores: string[];
  ideas_video: { titulo: string; formato: string; potencial: string; estimacion_vistas: string }[];
  riesgos: string[];
  monetizacion: { rpm_estimado: string; fuentes: string[] };
  plan_30_dias: string[];
};

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(".0", "") + "K";
  return String(n);
}

function scoreColor(v: number): string {
  if (v >= 70) return "text-emerald-400";
  if (v >= 40) return "text-amber-400";
  return "text-rose-400";
}

export default function ResearchPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const [tema, setTema] = useState("");
  const [mercado, setMercado] = useState(MERCADOS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [videosTop, setVideosTop] = useState<VideoTop[]>([]);
  const [estudio, setEstudio] = useState<Estudio | null>(null);
  const [searchedTema, setSearchedTema] = useState("");

  async function research() {
    const t = tema.trim();
    if (!t || loading) return;
    setLoading(true);
    setError(null);
    setMetricas(null);
    setVideosTop([]);
    setEstudio(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ tema: t, mercado }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error generando el estudio");
      setMetricas(data.metricas ?? null);
      setVideosTop(data.videosTop ?? []);
      setEstudio(data.estudio ?? null);
      setSearchedTema(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  const veredictoStyle: Record<string, string> = {
    VIABLE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
    "VIABLE CON AJUSTES": "bg-amber-500/15 text-amber-400 border-amber-500/40",
    "MUY COMPETIDO": "bg-orange-500/15 text-orange-400 border-orange-500/40",
    "NO VIABLE": "bg-rose-500/15 text-rose-400 border-rose-500/40",
  };

  return (
    <AppShell active="research">
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold">
            <Radar className="h-7 w-7 text-cyan-400" />
            Research
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Estudio de mercado completo de un tema: los 20 videos recientes más
            relevantes analizados con datos reales de YouTube + IA. Veredicto,
            competencia, ángulos, títulos probados y plan de 30 días.
          </p>
        </div>

        {/* Buscador */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            research();
          }}
          className="mb-6 flex flex-wrap gap-3"
        >
          <input
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            placeholder="Escribe un tema: historia antigua, IA, finanzas personales…"
            className="min-w-[260px] flex-1 rounded-md border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-500"
          />
          <select
            value={mercado}
            onChange={(e) => setMercado(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500"
          >
            {MERCADOS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Generar estudio
          </Button>
        </form>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* Cargando */}
        {loading && (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
            Consultando YouTube + analizando con IA… (1-2 min, vale la espera)
          </div>
        )}

        {/* Estado vacío */}
        {!loading && !estudio && !error && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-6 py-16 text-center text-slate-400">
            <Radar className="mx-auto mb-3 h-10 w-10 text-slate-600" />
            Escribe un tema y presiona{" "}
            <span className="text-cyan-400">Generar estudio</span>.
            <br />
            <span className="text-xs">
              Obtendrás un veredicto con datos reales, la competencia que ya
              existe, ángulos de contenido y un plan de 30 días.
            </span>
          </div>
        )}

        {/* Resultados */}
        {!loading && estudio && metricas && (
          <div className="space-y-6">
            {/* Cabecera: veredicto + scores */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Estudio de mercado · “{searchedTema}” · {metricas.mercado}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">
                    {estudio.veredicto}
                  </h2>
                </div>
                <span
                  className={`rounded-full border px-4 py-1.5 text-sm font-bold ${
                    veredictoStyle[estudio.veredicto] ??
                    "bg-slate-500/15 text-slate-300 border-slate-500/40"
                  }`}
                >
                  Score final: {estudio.score_final}/100
                </span>
              </div>

              {/* Barras de scores */}
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                    <Eye className="h-3.5 w-3.5" /> Demanda
                  </p>
                  <p className={`mt-1 text-xl font-bold ${scoreColor(estudio.score_demanda)}`}>
                    {estudio.score_demanda}/100
                  </p>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-800">
                    <div
                      className="h-1.5 rounded-full bg-emerald-500"
                      style={{ width: `${estudio.score_demanda}%` }}
                    />
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                    <Users className="h-3.5 w-3.5" /> Competencia (dificultad)
                  </p>
                  <p className={`mt-1 text-xl font-bold ${scoreColor(100 - estudio.score_competencia)}`}>
                    {estudio.score_competencia}/100
                  </p>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-800">
                    <div
                      className="h-1.5 rounded-full bg-amber-500"
                      style={{ width: `${estudio.score_competencia}%` }}
                    />
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                    <DollarSign className="h-3.5 w-3.5" /> Monetización
                  </p>
                  <p className={`mt-1 text-xl font-bold ${scoreColor(estudio.score_monetizacion)}`}>
                    {estudio.score_monetizacion}/100
                  </p>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-800">
                    <div
                      className="h-1.5 rounded-full bg-violet-500"
                      style={{ width: `${estudio.score_monetizacion}%` }}
                    />
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                {estudio.resumen_ejecutivo}
              </p>

              {/* Métricas reales */}
              <div className="mt-5 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 lg:grid-cols-7">
                {[
                  ["Videos", String(metricas.totalVideos)],
                  ["Canales", String(metricas.canalesDistintos)],
                  ["Vistas prom.", fmt(metricas.vistasPromedio)],
                  ["Vistas top", fmt(metricas.vistasTop)],
                  ["RPM est.", "$" + metricas.rpmEstimado],
                  ["Demanda", metricas.demanda],
                  ["Competencia", metricas.competencia],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-md border border-slate-800 bg-slate-950/60 px-2.5 py-2"
                  >
                    <p className="text-slate-500">{label}</p>
                    <p className="mt-0.5 font-bold text-slate-200">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Competencia */}
            {estudio.competencia?.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Users className="h-4 w-4 text-amber-400" /> La competencia que
                  ya existe
                </h3>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {estudio.competencia.map((c, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-800 bg-slate-950/60 p-4"
                    >
                      <p className="font-semibold text-white">
                        {c.canal}{" "}
                        <span className="text-xs font-normal text-slate-500">
                          · {fmt(c.subs)} subs
                        </span>
                      </p>
                      <p className="mt-2 text-xs text-emerald-400">
                        <span className="font-bold">✓ Fortaleza: </span>
                        <span className="text-slate-300">{c.fortaleza}</span>
                      </p>
                      <p className="mt-1 text-xs text-rose-400">
                        <span className="font-bold">✗ Hueco: </span>
                        <span className="text-slate-300">{c.debilidad}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ángulos */}
            {estudio.angulos?.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Target className="h-4 w-4 text-cyan-400" /> Ángulos de
                  contenido que funcionan
                </h3>
                <div className="mt-4 space-y-3">
                  {estudio.angulos.map((a, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-800 bg-slate-950/60 p-4"
                    >
                      <p className="flex items-center justify-between gap-3 font-semibold text-white">
                        {a.titulo}
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-400">
                          {a.dificultad}
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {a.por_que_funciona}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Títulos probados + hooks */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {estudio.titulos_probados?.length > 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <TrendingUp className="h-4 w-4 text-violet-400" /> Títulos
                    probados en el nicho
                  </h3>
                  <ul className="mt-4 space-y-2">
                    {estudio.titulos_probados.map((t, i) => (
                      <li
                        key={i}
                        className="rounded border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-300"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {estudio.hooks_ganadores?.length > 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <Lightbulb className="h-4 w-4 text-amber-400" /> Ganchos que
                    retienen
                  </h3>
                  <ul className="mt-4 space-y-2">
                    {estudio.hooks_ganadores.map((h, i) => (
                      <li
                        key={i}
                        className="rounded border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-300"
                      >
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Ideas de video */}
            {estudio.ideas_video?.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Calendar className="h-4 w-4 text-emerald-400" /> Ideas de
                  video listas para producir
                </h3>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {estudio.ideas_video.map((v, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-800 bg-slate-950/60 p-4"
                    >
                      <p className="font-semibold text-white">{v.titulo}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-wider text-slate-500">
                        {v.formato}
                      </p>
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                        <Eye className="h-3 w-3" /> {v.estimacion_vistas} ·
                        potencial {v.potencial}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Riesgos + monetización */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {estudio.riesgos?.length > 0 && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-6">
                  <h3 className="flex items-center gap-2 font-semibold text-rose-300">
                    <AlertTriangle className="h-4 w-4" /> Riesgos honestos
                  </h3>
                  <ul className="mt-3 space-y-1.5">
                    {estudio.riesgos.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <X className="mt-0.5 h-3 w-3 shrink-0 text-rose-400" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {estudio.monetizacion && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-6">
                  <h3 className="flex items-center gap-2 font-semibold text-emerald-300">
                    <DollarSign className="h-4 w-4" /> Cómo se monetiza
                  </h3>
                  <p className="mt-3 text-sm font-bold text-white">
                    RPM estimado: {estudio.monetizacion.rpm_estimado}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {estudio.monetizacion.fuentes?.map((f, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Plan 30 días */}
            {estudio.plan_30_dias?.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Calendar className="h-4 w-4 text-cyan-400" /> Tu plan de 30
                  días
                </h3>
                <ol className="mt-4 space-y-2">
                  {estudio.plan_30_dias.map((p, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-300"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[10px] font-bold text-cyan-400">
                        {i + 1}
                      </span>
                      {p}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Videos top reales */}
            {videosTop.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="font-semibold">
                  Videos reales analizados ({videosTop.length})
                </h3>
                <div className="mt-4 space-y-2">
                  {videosTop.map((v, i) => (
                    <a
                      key={i}
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs transition-colors hover:border-cyan-500/50"
                    >
                      <span className="truncate text-slate-300">{v.title}</span>
                      <span className="shrink-0 text-slate-500">
                        {v.channel} · {fmt(v.views)} vistas ·{" "}
                        <ExternalLink className="inline h-3 w-3" />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* CTA a Script Lab */}
            <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-slate-900/70 to-slate-950/70 p-6 text-center">
              <p className="text-sm text-slate-300">
                ¿Ya sabes qué video hacer?{" "}
                <a
                  href="/script-lab"
                  className="font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  Lleva el tema al Script Lab →
                </a>
              </p>
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}
