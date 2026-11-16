"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Search,
  Vault,
  Save,
  Trash2,
  Check,
  ExternalLink,
  Copy,
  Sparkles,
  TrendingUp,
  Users,
  Eye,
  Flame,
  AlertCircle,
  Crown,
  Video,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/componentsui/ui/button";
import { Alert, AlertDescription } from "@/componentsui/ui/alert";
import { supabase, useUser } from "@/lib/supabase";
import { AppShell } from "@/components/app-shell";

type Canal = {
  name: string;
  subscribers: number;
  videoCount: number;
  totalViews: number;
  channelId: string;
};

type Monetization = {
  subscribers: number;
  avgViewsTop10: number;
  engagementPct: number;
  strong: boolean;
};

type VideoTop = {
  videoId: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  videoUrl: string;
};

type PresetIA = {
  preset_name: string;
  tone: string;
  pacing: string;
  audience_profile: string;
  target_niche: string;
  formula_virales: string[];
  gancho_tipo: string;
  retention_tactics: string[];
  narrativa_estructura: string;
  palabras_firma: string[];
  forbidden_words: string[];
  recipe_script: string;
  por_que_funciona: string;
  ideas_video: string[];
  verdict: string;
};

type SavedPreset = {
  id: string;
  name: string;
  target_niche: string | null;
  tone: string;
  pacing: string;
  audience_profile: string | null;
  forbidden_words: string[];
  narrative_structure_rules: Record<string, unknown>;
  created_at: string;
};

const toneColors: Record<string, string> = {
  engaging: "bg-violet-500/15 text-violet-300",
  educational: "bg-sky-500/15 text-sky-300",
  persuasive: "bg-amber-500/15 text-amber-300",
  entertaining: "bg-fuchsia-500/15 text-fuchsia-300",
};

const pacingColors: Record<string, string> = {
  slow: "bg-slate-500/15 text-slate-300",
  medium: "bg-teal-500/15 text-teal-300",
  fast: "bg-rose-500/15 text-rose-300",
};

function fmt(n: number): string {
  if (n >= 1_000_000_000) return (n / 1e9).toFixed(1).replace(".0", "") + "B";
  if (n >= 1_000_000) return (n / 1e6).toFixed(1).replace(".0", "") + "M";
  if (n >= 1_000) return (n / 1e3).toFixed(1).replace(".0", "") + "K";
  return String(n);
}

export default function PresetsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const [channelUrl, setChannelUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canal, setCanal] = useState<Canal | null>(null);
  const [monetization, setMonetization] = useState<Monetization | null>(null);
  const [videosTop, setVideosTop] = useState<VideoTop[]>([]);
  const [presetIA, setPresetIA] = useState<PresetIA | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<{ code?: string; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [maxPresets, setMaxPresets] = useState(3);
  const [usedPresets, setUsedPresets] = useState(0);

  const loadPresets = useCallback(async () => {
    if (!user) return;
    setListLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch("/api/presets", {
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token ?? ""}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedPresets(data.presets ?? []);
        setMaxPresets(data.max ?? 3);
        setUsedPresets(data.used ?? 0);
      }
    } finally {
      setListLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  async function analyze() {
    const url = channelUrl.trim();
    if (!url || analyzing) return;
    setAnalyzing(true);
    setError(null);
    setCanal(null);
    setMonetization(null);
    setVideosTop([]);
    setPresetIA(null);
    setSaved(false);
    setSaveError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch("/api/presets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ action: "analyze", channelUrl: url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error analizando el canal");
      setCanal(data.canal ?? null);
      setMonetization(data.monetization ?? null);
      setVideosTop(data.videosTop ?? []);
      setPresetIA(data.preset ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setAnalyzing(false);
    }
  }

  async function savePreset() {
    if (!presetIA || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch("/api/presets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({
          action: "save",
          preset: presetIA,
          channelName: canal?.name,
          channelUrl,
          monetization,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError({ code: data?.code, message: data?.message ?? data?.error });
        return;
      }
      setSaved(true);
      loadPresets();
    } catch (e) {
      setSaveError({ message: e instanceof Error ? e.message : String(e) });
    } finally {
      setSaving(false);
    }
  }

  async function deletePreset(id: string) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      await fetch("/api/presets", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ id }),
      });
      setSavedPresets((prev) => prev.filter((p) => p.id !== id));
      setUsedPresets((prev) => Math.max(0, prev - 1));
    } catch {
      /* ignorar */
    }
  }

  async function copyPreset() {
    if (!presetIA) return;
    const text = [
      `PRESET: ${presetIA.preset_name}`,
      `Nicha: ${presetIA.target_niche}`,
      `Tono: ${presetIA.tone} · Pacing: ${presetIA.pacing}`,
      `Audiencia: ${presetIA.audience_profile}`,
      ``,
      `Recetario de guion:`,
      presetIA.recipe_script,
      ``,
      `Palabras firma: ${presetIA.palabras_firma.join(", ")}`,
      `Palabras prohibidas: ${presetIA.forbidden_words.join(", ")}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* sin permiso */
    }
  }

  const limitReached = usedPresets >= maxPresets && maxPresets < 900;

  return (
    <AppShell active="presets">
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Encabezado */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold">
              <Vault className="h-7 w-7 text-amber-400" />
              Presets IA
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Analiza el canal completo de la competencia (los que ya monetizan)
              y extrae un preset profesional: estilo, fórmulas y recetas para
              escribir guiones con su voz ganadora.
            </p>
          </div>
          <span className="rounded-full bg-slate-800 px-4 py-1.5 text-sm font-semibold text-slate-300">
            {usedPresets}/{maxPresets >= 900 ? "∞" : maxPresets} presets
          </span>
        </div>

        {/* Buscador de canal */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            URL del canal competidor
          </label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              analyze();
            }}
            className="flex flex-wrap gap-3"
          >
            <input
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              placeholder="https://www.youtube.com/@NASA  o  @CanalPerez"
              className="min-w-[260px] flex-1 rounded-md border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm outline-none placeholder:text-slate-600 focus:border-amber-500"
            />
            <Button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700"
              disabled={analyzing || !channelUrl.trim()}
            >
              {analyzing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Analizar
            </Button>
          </form>
          <p className="mt-2 text-[11px] text-slate-500">
            YouTube Data API + GPT-5.4 · Estudio completo en ~20 segundos
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* Cargando */}
        {analyzing && (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
            Estudiando el canal a fondo… (20-30s)
          </div>
        )}

        {/* Resultado del análisis */}
        {!analyzing && presetIA && canal && monetization && (
          <div className="mt-6 space-y-6">
            {/* Tarjeta del canal */}
            <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-slate-900/70 to-slate-950/80 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-amber-400">
                    Canal analizado {monetization.strong && "★ fuerte"}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">{canal.name}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {canal.channelId}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
                    <Users className="mx-auto mb-1 h-4 w-4 text-amber-400" />
                    <p className="font-bold text-white">{fmt(canal.subscribers)}</p>
                    <p className="text-slate-500">subs</p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
                    <Eye className="mx-auto mb-1 h-4 w-4 text-violet-400" />
                    <p className="font-bold text-white">{fmt(canal.totalViews)}</p>
                    <p className="text-slate-500">vistas</p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
                    <TrendingUp className="mx-auto mb-1 h-4 w-4 text-emerald-400" />
                    <p className="font-bold text-white">{monetization.engagementPct}%</p>
                    <p className="text-slate-500">engagement</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                <Flame className="h-3 w-3" /> Avg views top 10: {fmt(monetization.avgViewsTop10)}
              </p>
            </div>

            {/* Top videos de referencia */}
            {videosTop.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Video className="h-4 w-4 text-rose-400" />
                  Los que ya funcionan (10 más vistos)
                </h3>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {videosTop.slice(0, 10).map((v) => (
                    <a
                      key={v.videoId}
                      href={v.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded-lg border border-slate-800 bg-slate-950/60 p-3 transition-colors hover:border-amber-500/50"
                    >
                      <p className="line-clamp-2 min-h-[2.5rem] text-[11px] font-medium text-slate-300 group-hover:text-white">
                        {v.title}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        {fmt(v.views)} vistas · {fmt(v.likes)} ❤
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Preset del canal */}
            <div className="rounded-xl border border-amber-500/30 bg-slate-900/60 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="rounded-full bg-amber-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Preset del canal
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-white">
                    {presetIA.preset_name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Nicho: {presetIA.target_niche}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${toneColors[presetIA.tone] ?? toneColors.engaging}`}>
                    {presetIA.tone}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${pacingColors[presetIA.pacing] ?? pacingColors.medium}`}>
                    {presetIA.pacing}
                  </span>
                  <button
                    onClick={copyPreset}
                    className="flex items-center gap-1.5 rounded-md border border-slate-700 px-3 py-1 text-[10px] font-semibold text-slate-300 transition-colors hover:border-amber-500/50 hover:text-white"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Ganchos + fórmulas */}
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Su gancho
                  </p>
                  <p className="mt-1.5 text-sm text-slate-200">{presetIA.gancho_tipo}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Fórmulas que le funcionan
                  </p>
                  <ul className="mt-1.5 space-y-1.5">
                    {presetIA.formula_virales.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Audiencia + retención */}
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Su audiencia
                  </p>
                  <p className="mt-1.5 text-sm text-slate-200">{presetIA.audience_profile}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Tácticas de retención
                  </p>
                  <ul className="mt-1.5 space-y-1.5">
                    {presetIA.retention_tactics?.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Palabras firma / prohibidas */}
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 md:col-span-2">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                        Palabras firma
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {presetIA.palabras_firma?.map((w) => (
                          <span key={w} className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] text-emerald-300">
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-rose-500">
                        Palabras prohibidas
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {presetIA.forbidden_words?.map((w) => (
                          <span key={w} className="rounded-full bg-rose-500/10 px-2.5 py-1 text-[10px] text-rose-300 line-through">
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Receta del guion
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                    {presetIA.recipe_script}
                  </p>
                </div>

                {/* Veredicto + ideas */}
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Veredicto
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                    {presetIA.verdict}
                  </p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    3 ideas de video en su estilo
                  </p>
                  <ol className="mt-1.5 space-y-1.5">
                    {presetIA.ideas_video?.map((idea, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-amber-400">{i + 1}.</span>
                        {idea}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Guardar */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                {!saved ? (
                  <>
                    <p className="text-xs text-slate-400">
                      Esto se guarda como tu preset y lo puedes aplicar en el
                      Script Lab.
                    </p>
                    <Button
                      onClick={savePreset}
                      disabled={saving || !!saveError || limitReached}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      {limitReached ? "Límite de presets alcanzado" : "Guardar mi preset"}
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                      <Check className="h-5 w-5" /> Preset guardado en tu cuenta
                    </p>
                    <Link href="/script-lab">
                      <Button className="bg-violet-600 hover:bg-violet-700">
                        Usarlo en el Script Lab
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
              {saveError && (
                <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-950/30 px-4 py-3">
                  <p className="flex items-start gap-2 text-xs text-amber-300">
                    <Crown className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{saveError.message}</span>
                  </p>
                  {saveError.code === "PRESET_LIMIT" && (
                    <Link href="/pricing">
                      <Button size="sm" className="mt-2 bg-amber-600 hover:bg-amber-700">
                        Subir de plan
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mis presets guardados */}
        <div className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Vault className="h-5 w-5 text-amber-400" />
            Mis presets guardados
            <span className="text-xs font-normal text-slate-500">
              ({savedPresets.length}/{maxPresets >= 900 ? "∞" : maxPresets})
            </span>
          </h2>
          {listLoading ? (
            <div className="flex items-center justify-center py-10 text-slate-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Cargando tus presets…
            </div>
          ) : savedPresets.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-6 py-10 text-center text-sm text-slate-400">
              Aún no tienes presets. Analiza un canal fuerte y guarda su
              preset para escribir con su estilo.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedPresets.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-4"
                >
                  <h3 className="font-bold text-white">{p.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {p.target_niche ?? "Sin nicho definido"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${toneColors[p.tone] ?? toneColors.engaging}`}>
                      {p.tone}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${pacingColors[p.pacing] ?? pacingColors.medium}`}>
                      {p.pacing}
                    </span>
                  </div>
                  {p.forbidden_words?.length > 0 && (
                    <p className="mt-3 text-[10px] text-slate-500">
                      Sin: {p.forbidden_words.slice(0, 4).join(", ")}
                      {p.forbidden_words.length > 4 ? "…" : ""}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                    <Link
                      href="/script-lab"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
                    >
                      Usar en Script Lab <ChevronRight className="h-3 w-3" />
                    </Link>
                    <button
                      onClick={() => deletePreset(p.id)}
                      className="rounded p-1.5 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
