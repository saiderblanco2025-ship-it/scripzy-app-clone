"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ImageIcon,
  Sparkles,
  Download,
  Coins,
  History,
} from "lucide-react";
import { Button } from "@/componentsui/ui/button";
import { supabase, useUser, getUserBalance } from "@/lib/supabase";
import { AppShell } from "@/components/app-shell";

type ThumbnailJob = {
  id: string;
  prompt_used: string;
  generated_image_urls: string[] | null;
  created_at: string;
};

const STYLES = [
  { key: "viral", label: "🔥 Viral" },
  { key: "minimalista", label: "⚪ Minimalista" },
  { key: "cinematico", label: "🎬 Cinemático" },
  { key: "neon", label: "💜 Neón" },
  { key: "realista", label: "📷 Realista" },
];

export default function MiniaturasPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const [prompt, setPrompt] = useState("");
  const [overlayText, setOverlayText] = useState("");
  const [style, setStyle] = useState("viral");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [lastImage, setLastImage] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [history, setHistory] = useState<ThumbnailJob[]>([]);

  // Cargar créditos e historial al entrar
  useEffect(() => {
    if (!user) return;
    (async () => {
      const balance = await getUserBalance();
      if (balance) setCredits(balance.thumbnail_credits);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const res = await fetch("/api/thumbnails", {
          headers: {
            Authorization: `Bearer ${sessionData.session?.access_token ?? ""}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setHistory(data.thumbnails ?? []);
        }
      } catch {
        /* historial opcional */
      }
    })();
  }, [user]);

  async function generate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch("/api/thumbnails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ prompt: prompt.trim(), style, text: overlayText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error generando miniatura");
      setLastImage(data.imageUrl);
      setLastPrompt(prompt.trim());
      setCredits(data.creditsLeft);
      // Refrescar historial
      const resHist = await fetch("/api/thumbnails", {
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token ?? ""}`,
        },
      });
      if (resHist.ok) {
        const dataHist = await resHist.json();
        setHistory(dataHist.thumbnails ?? []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell active="miniaturas">
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Encabezado */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold">
              <ImageIcon className="h-7 w-7 text-fuchsia-400" />
              Generador de Miniaturas
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Miniaturas 16:9 de alto CTR con IA. Describe tu video, añade un
              texto y deja que el motor de arte haga el resto.
            </p>
          </div>
          <div className="rounded-xl border border-fuchsia-500/40 bg-fuchsia-500/10 px-4 py-2 text-center">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-fuchsia-300">
              <Coins className="h-3.5 w-3.5" /> Créditos de miniatura
            </p>
            <p className="text-2xl font-bold text-white">
              {credits === null ? "…" : credits}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Panel izquierdo: formulario */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                ¿De qué va tu video?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej: un astronauta descubriendo una montaña de oro en la luna"
                rows={3}
                className="w-full resize-none rounded-md border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-fuchsia-500"
              />

              <label className="mb-2 mt-4 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Texto en la miniatura (opcional)
              </label>
              <input
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value)}
                placeholder="Ej: EL ORO DE LA LUNA"
                maxLength={60}
                className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm outline-none placeholder:text-slate-500 focus:border-fuchsia-500"
              />

              <label className="mb-2 mt-4 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Estilo visual
              </label>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setStyle(s.key)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-colors ${
                      style === s.key
                        ? "bg-fuchsia-600 border-fuchsia-500 text-white"
                        : "bg-transparent border-slate-600 text-slate-300 hover:border-fuchsia-500/60"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <Button
                type="button"
                onClick={generate}
                disabled={loading || !prompt.trim() || credits === 0}
                className="mt-5 w-full bg-fuchsia-600 hover:bg-fuchsia-700"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {credits === 0
                  ? "Sin créditos — mejora tu plan"
                  : "Generar miniatura (1 crédito)"}
              </Button>

              {loading && (
                <p className="mt-3 text-center text-xs text-slate-400">
                  El director de arte IA está diseñando tu miniatura…
                  <br />
                  Puede tardar <span className="text-fuchsia-300">1-2 minutos</span>. No cierres la página.
                </p>
              )}

              {error && (
                <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Panel derecho: resultado + historial */}
          <div className="lg:col-span-3">
            {/* Resultado */}
            {loading && (
              <div className="mb-6 flex aspect-video w-full animate-pulse items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 text-slate-500">
                <div className="text-center">
                  <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin text-fuchsia-400" />
                  Creando magia visual…
                </div>
              </div>
            )}

            {!loading && lastImage && (
              <div className="mb-6 overflow-hidden rounded-xl border border-fuchsia-500/40 bg-slate-900/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={lastImage} alt="Miniatura generada" className="w-full" />
                <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <p className="text-xs text-slate-400">
                    <Sparkles className="mr-1 inline h-3 w-3 text-fuchsia-400" />
                    {lastPrompt}
                  </p>
                  <a
                    href={lastImage}
                    download="miniatura-scripzy.png"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-fuchsia-600 px-4 py-2 text-xs font-semibold text-white hover:bg-fuchsia-700"
                  >
                    <Download className="h-3.5 w-3.5" /> Descargar PNG
                  </a>
                </div>
              </div>
            )}

            {/* Estado vacío */}
            {!loading && !lastImage && (
              <div className="mb-6 flex aspect-video w-full items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 text-center text-slate-500">
                <div>
                  <ImageIcon className="mx-auto mb-3 h-10 w-10 text-slate-700" />
                  Tu miniatura aparecerá aquí
                  <br />
                  <span className="text-xs">
                    16:9 · alta calidad · lista para YouTube
                  </span>
                </div>
              </div>
            )}

            {/* Historial */}
            {history.length > 0 && (
              <div>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
                  <History className="h-4 w-4" /> Historial
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {history.map((t) => {
                    const url = t.generated_image_urls?.[0];
                    if (!url) return null;
                    return (
                      <div
                        key={t.id}
                        className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={t.prompt_used}
                          className="h-28 w-full object-cover"
                          loading="lazy"
                        />
                        <p className="line-clamp-2 px-2 py-1.5 text-[10px] text-slate-400">
                          {t.prompt_used}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
