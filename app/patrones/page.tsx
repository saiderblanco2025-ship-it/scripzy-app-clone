"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, TrendingUp, Lightbulb, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/componentsui/ui/button";
import { supabase, useUser } from "@/lib/supabase";
import { AppShell } from "@/components/app-shell";

type Pattern = {
  nombre: string;
  formula: string;
  ejemplos: string[];
  metricas: string;
  porque_funciona: string;
  como_aplicar: string;
};

type VideoTop = {
  videoId: string;
  titulo: string;
  canal: string;
  vistas: number;
  subs: number;
  thumbnail: string;
  url: string;
};

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(".0", "") + "K";
  return String(n);
}

export default function PatronesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [videosAnalyzed, setVideosAnalyzed] = useState<number | null>(null);
  const [searchedKeyword, setSearchedKeyword] = useState("");
  const [videos, setVideos] = useState<VideoTop[]>([]);

  async function search(term?: string) {
    const kw = (term ?? keyword).trim();
    if (!kw || loading) return;
    setLoading(true);
    setError(null);
    setPatterns([]);
    setVideosAnalyzed(null);
    setVideos([]);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch("/api/patrones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ keyword: kw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error analizando patrones");
      setPatterns(data.patterns ?? []);
      setVideosAnalyzed(data.videosAnalyzed ?? null);
      setVideos(data.videos ?? []);
      setSearchedKeyword(kw);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell active="patrones">
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold">
            <TrendingUp className="h-7 w-7 text-rose-400" />
            Top Patterns
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Los 15 videos más vistos del nicho (últimos 120 días) analizados con
            IA para descubrir los patrones virales que puedes replicar.
          </p>
        </div>

        {/* Buscador */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            search();
          }}
          className="mb-6 flex flex-wrap gap-3"
        >
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Escribe un nicho: finanzas, historia antigua, IA…"
            className="min-w-[260px] flex-1 rounded-md border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm outline-none placeholder:text-slate-500 focus:border-rose-500"
          />
          <Button type="submit" className="bg-rose-600 hover:bg-rose-700" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Analizar patrones
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
            Analizando los videos más virales del nicho con IA… (30-60s)
          </div>
        )}

        {/* Estado vacío */}
        {!loading && patterns.length === 0 && !error && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-6 py-16 text-center text-slate-400">
            <TrendingUp className="mx-auto mb-3 h-10 w-10 text-slate-600" />
            Escribe un nicho y presiona{" "}
            <span className="text-rose-400">Analizar patrones</span>.
            <br />
            <span className="text-xs">
              La IA estudia los videos más vistos y te dice exactamente qué
              fórmulas replicar.
            </span>
          </div>
        )}

        {/* Resultados */}
        {!loading && patterns.length > 0 && (
          <>
            <p className="mb-4 text-xs text-slate-500">
              {videosAnalyzed} videos más vistos analizados para{" "}
              <span className="text-slate-300">“{searchedKeyword}”</span> ·{" "}
              {patterns.length} patrones detectados
            </p>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {patterns.map((p, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition-colors hover:border-rose-500/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="flex items-center gap-2 text-base font-bold text-white">
                      <Lightbulb className="h-4 w-4 shrink-0 text-rose-400" />
                      {p.nombre}
                    </h3>
                  </div>
                  <p className="mt-3 rounded-md bg-slate-950/60 px-3 py-2 text-xs font-medium text-rose-300">
                    {p.formula}
                  </p>
                  {p.ejemplos?.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {p.ejemplos.slice(0, 3).map((ej, j) => (
                        <li key={j} className="text-xs text-slate-400">
                          <span className="text-slate-500">→ </span>
                          {ej}
                        </li>
                      ))}
                    </ul>
                  )}
                  {p.metricas && (
                    <p className="mt-3 flex items-start gap-1.5 text-[11px] text-emerald-400">
                      <Eye className="mt-0.5 h-3 w-3 shrink-0" />
                      {p.metricas}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-slate-300">
                    <span className="font-semibold text-slate-400">¿Por qué funciona? </span>
                    {p.porque_funciona}
                  </p>
                  <p className="mt-2 text-xs text-slate-300">
                    <span className="font-semibold text-slate-400">Cómo aplicarlo: </span>
                    {p.como_aplicar}
                  </p>
                </div>
              ))}
            </div>

            {/* Referencias reales de YouTube */}
            {videos.length > 0 && (
              <div className="mt-8">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
                  <ExternalLink className="h-4 w-4 text-violet-400" />
                  Referencias reales de YouTube — estudia a los que ya ganan
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {videos.map((v) => (
                    <a
                      key={v.videoId}
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 transition-colors hover:border-violet-500/50"
                    >
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={v.thumbnail}
                          alt={v.titulo}
                          className="aspect-video w-full object-cover"
                          loading="lazy"
                        />
                        <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                          {fmtCompact(v.vistas)} vistas
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="line-clamp-2 min-h-[2.5rem] text-xs font-semibold text-slate-200 group-hover:text-white">
                          {v.titulo}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {v.canal} · {fmtCompact(v.subs)} subs
                        </p>
                        <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-violet-400 group-hover:text-violet-300">
                          Ver en YouTube <ExternalLink className="h-3 w-3" />
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </AppShell>
  );
}
