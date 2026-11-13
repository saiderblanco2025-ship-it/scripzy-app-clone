"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Search,
  Coins,
  Users,
  Eye,
  Zap,
  Trophy,
  ExternalLink,
  Compass,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/componentsui/ui/button";
import { supabase, useUser } from "@/lib/supabase";
import { UserMenu } from "@/components/user-menu";

type NicheVideo = {
  videoId: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  subscribers: number;
  ageDays: number;
  viewsPerHour: number;
  rpmEstimate: number;
  demand: string;
  competition: string;
  faceless: boolean;
  score: number;
};

type NicheSummary = {
  keyword: string;
  total: number;
  avgRpm: number;
  facelessCount: number;
  lowCompetition: number;
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(".0", "") + "K";
  return String(n);
}

function demandColor(d: string): string {
  if (d === "Alta") return "bg-emerald-500/15 text-emerald-400";
  if (d === "Media") return "bg-amber-500/15 text-amber-400";
  return "bg-slate-500/15 text-slate-400";
}

function competitionColor(c: string): string {
  if (c === "Baja") return "bg-emerald-500/15 text-emerald-400";
  if (c === "Media") return "bg-amber-500/15 text-amber-400";
  return "bg-rose-500/15 text-rose-400";
}

export default function NichosPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const [keyword, setKeyword] = useState("");
  const [recencyDays, setRecencyDays] = useState(90);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<NicheSummary | null>(null);
  const [videos, setVideos] = useState<NicheVideo[]>([]);

  // Filtros activos
  const [fRpm, setFRpm] = useState(false);
  const [fDemand, setFDemand] = useState(false);
  const [fCompetition, setFCompetition] = useState(false);
  const [fFaceless, setFFaceless] = useState(false);

  async function search(term?: string) {
    const kw = (term ?? keyword).trim();
    if (!kw || loading) return;
    setLoading(true);
    setError(null);
    setSummary(null);
    setVideos([]);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch("/api/nichos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ keyword: kw, maxResults: 12, recencyDays }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error buscando nichos");
      setSummary(data.summary ?? null);
      setVideos(data.videos ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  const filtered = videos.filter((v) => {
    if (fRpm && v.rpmEstimate < 8) return false;
    if (fDemand && v.demand !== "Alta") return false;
    if (fCompetition && v.competition !== "Baja") return false;
    if (fFaceless && !v.faceless) return false;
    return true;
  });

  const chip = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-xs font-semibold border transition-colors ${
      active
        ? "bg-violet-600 border-violet-500 text-white"
        : "bg-transparent border-slate-600 text-slate-300 hover:border-violet-500/60"
    }`;

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
              <Link href="/dashboard" className="hover:text-white">
                Dashboard
              </Link>
              <Link href="/script-lab" className="hover:text-white">
                Script Lab
              </Link>
              <Link href="/nichos" className="font-semibold text-white">
                Nichos
              </Link>
              <Link href="/miniaturas" className="hover:text-white">
                Miniaturas
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
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold">
            <Compass className="h-7 w-7 text-violet-400" />
            Buscador de Nichos
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Datos reales de YouTube: RPM estimado, demanda, competencia y
            Faceless Friendly. Actualizado con cada búsqueda.
          </p>
        </div>

        {/* Buscador */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            search();
          }}
          className="mb-5 flex flex-wrap gap-3"
        >
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Escribe un nicho: finanzas, IA, historia, fitness…"
            className="min-w-[260px] flex-1 rounded-md border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm outline-none placeholder:text-slate-500 focus:border-violet-500"
          />
          <select
            value={recencyDays}
            onChange={(e) => setRecencyDays(Number(e.target.value))}
            className="rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-violet-500"
          >
            <option value={30}>Últimos 30 días</option>
            <option value={60}>Últimos 60 días</option>
            <option value={90}>Últimos 90 días</option>
            <option value={180}>Últimos 6 meses</option>
            <option value={365}>Último año</option>
          </select>
          <Button type="submit" className="bg-violet-600 hover:bg-violet-700" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Buscar nichos
          </Button>
        </form>

        {/* Chips de filtros */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button type="button" className={chip(fRpm)} onClick={() => setFRpm(!fRpm)}>
            <span className="inline-flex items-center gap-1.5">
              <Coins className="h-3.5 w-3.5" /> RPM Alto
            </span>
          </button>
          <button type="button" className={chip(fDemand)} onClick={() => setFDemand(!fDemand)}>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" /> Demanda Alta
            </span>
          </button>
          <button type="button" className={chip(fCompetition)} onClick={() => setFCompetition(!fCompetition)}>
            <span className="inline-flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5" /> Baja Competencia
            </span>
          </button>
          <button type="button" className={chip(fFaceless)} onClick={() => setFFaceless(!fFaceless)}>
            <span className="inline-flex items-center gap-1.5">
              😎 Faceless Friendly
            </span>
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* Resumen */}
        {summary && !loading && (
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Videos analizados</p>
              <p className="mt-1 text-2xl font-bold">{summary.total}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">RPM promedio</p>
              <p className="mt-1 text-2xl font-bold text-amber-400">${summary.avgRpm}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Faceless Friendly</p>
              <p className="mt-1 text-2xl font-bold text-emerald-400">{summary.facelessCount}/{summary.total}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Competencia baja</p>
              <p className="mt-1 text-2xl font-bold text-violet-400">{summary.lowCompetition}</p>
            </div>
          </div>
        )}

        {/* Cargando */}
        {loading && (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
            Consultando YouTube y calculando métricas de nicho…
          </div>
        )}

        {/* Estado vacío */}
        {!loading && !summary && !error && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-6 py-16 text-center text-slate-400">
            <Compass className="mx-auto mb-3 h-10 w-10 text-slate-600" />
            Escribe un nicho y presiona <span className="text-violet-400">Buscar nichos</span>.
            <br />
            <span className="text-xs">
              Ej: “historia antigua”, “inteligencia artificial”, “finanzas”, “meditación”…
            </span>
          </div>
        )}

        {/* Resultados */}
        {!loading && filtered.length > 0 && (
          <>
            <p className="mb-3 text-xs text-slate-500">
              Mostrando {filtered.length} de {videos.length} videos
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((v) => (
                <div
                  key={v.videoId}
                  className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 transition-colors hover:border-violet-500/50"
                >
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={v.thumbnail}
                      alt={v.title}
                      className="h-44 w-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute left-2 top-2 rounded-md bg-violet-600/90 px-2 py-0.5 text-[11px] font-bold text-white">
                      Score {v.score}
                    </span>
                    {v.faceless && (
                      <span className="absolute right-2 top-2 rounded-md bg-emerald-600/90 px-2 py-0.5 text-[11px] font-bold text-white">
                        😎 Faceless
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 min-h-[2.6rem] text-sm font-semibold text-white">
                      {v.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {v.channelTitle} · hace {v.ageDays}d
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="rounded-md bg-slate-950/60 px-2 py-1.5">
                        <Eye className="mx-auto mb-0.5 h-3.5 w-3.5 text-slate-400" />
                        {formatNumber(v.views)}
                      </div>
                      <div className="rounded-md bg-slate-950/60 px-2 py-1.5">
                        <Users className="mx-auto mb-0.5 h-3.5 w-3.5 text-slate-400" />
                        {formatNumber(v.subscribers)}
                      </div>
                      <div className="rounded-md bg-slate-950/60 px-2 py-1.5">
                        <Zap className="mx-auto mb-0.5 h-3.5 w-3.5 text-slate-400" />
                        {formatNumber(v.viewsPerHour)}/h
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-400">
                        RPM ~${v.rpmEstimate}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${demandColor(v.demand)}`}>
                        Demanda {v.demand}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${competitionColor(v.competition)}`}>
                        Competencia {v.competition}
                      </span>
                    </div>
                    <a
                      href={`https://youtu.be/${v.videoId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-violet-400 hover:text-violet-300"
                    >
                      Ver en YouTube <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Sin resultados tras filtros */}
        {!loading && summary && filtered.length === 0 && videos.length > 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-6 py-12 text-center text-slate-400">
            <RefreshCw className="mx-auto mb-3 h-8 w-8 text-slate-600" />
            Ningún video cumple los filtros activos. Prueba quitando alguno.
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-600">
        Scripzy.app — Clone build · Next.js · Supabase · Stripe · n8n · YouTube Data API
      </footer>
    </div>
  );
}
