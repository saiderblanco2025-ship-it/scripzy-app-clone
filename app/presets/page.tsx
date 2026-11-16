"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Vault,
  Trash2,
  Wand2,
  Circle,
  CheckCircle2,
  ClipboardList,
  Minus,
  Plus,
  ChevronRight,
  Download,
  Upload,
  Search,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/componentsui/ui/button";
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

const STEPS = [
  "Análisis del canal",
  "Análisis de vídeo",
  "Extrayendo estructura del guión",
  "Extrayendo estilo narrativo",
];

const TONE_LABELS: Record<string, string> = {
  engaging: "Entretenido",
  educational: "Educacional",
  persuasive: "Persuasivo",
  entertaining: "Divertido",
};

const PACING_LABELS: Record<string, string> = {
  slow: "Tranquilo",
  medium: "Medio",
  fast: "Rápido",
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
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [canal, setCanal] = useState<Canal | null>(null);
  const [monetization, setMonetization] = useState<Monetization | null>(null);
  const [videosTop, setVideosTop] = useState<VideoTop[]>([]);
  const [presetIA, setPresetIA] = useState<PresetIA | null>(null);
  const [presetName, setPresetName] = useState("");
  const [presetDesc, setPresetDesc] = useState("");
  const [durationMin, setDurationMin] = useState(26);
  const [durationMode, setDurationMode] = useState<"min" | "chars" | "words">("min");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [maxPresets, setMaxPresets] = useState(3);
  const [usedPresets, setUsedPresets] = useState(0);
  const [presetQuery, setPresetQuery] = useState("");
  const [presetTab, setPresetTab] = useState<"all" | "copies">("all");
  const [importNote, setImportNote] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!saved) return;
    const t = window.setTimeout(() => setSaved(false), 4000);
    return () => window.clearTimeout(t);
  }, [saved]);

  // Animación del stepper mientras corre el análisis (1 paso cada temp.entre 3 y 6s)
  useEffect(() => {
    if (!analyzing) return;
    setStepIdx(0);
    const t = window.setInterval(() => {
      setStepIdx((s) => (s < STEPS.length ? s + 1 : s));
    }, 3500);
    return () => window.clearInterval(t);
  }, [analyzing]);

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
      const p: PresetIA | null = data.preset ?? null;
      if (p) {
        setPresetIA(p);
        setPresetName(p.preset_name ?? "");
        const desc = [p.por_que_funciona, p.recipe_script]
          .filter(Boolean)
          .join(" ")
          .slice(0, 280);
        setPresetDesc(desc);
        setStepIdx(STEPS.length);
      }
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
          preset: { ...presetIA, preset_name: presetName },
          channelName: canal?.name,
          channelUrl,
          monetization,
          targetMinutes: durationMin,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data?.message ?? data?.error ?? "Error guardando");
        return;
      }
      setSaved(true);
      setShowCloneModal(false);
      setPresetIA(null);
      loadPresets();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e));
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

  // ===== Exportar / Importar / Duplicar =====
  async function exportPresets() {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch("/api/presets", {
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token ?? ""}`,
        },
      });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data.presets ?? [], null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "scripzy-presets.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* sin acceso */
    }
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const items: Array<Record<string, unknown>> = Array.isArray(parsed)
        ? parsed
        : (parsed?.presets ?? []);
      if (items.length === 0) {
        setImportNote("El archivo no contiene presets");
        return;
      }
      const { data: sessionData } = await supabase.auth.getSession();
      let imported = 0;
      for (const raw of items) {
        const rules = (raw?.narrative_structure_rules ?? {}) as Record<string, unknown>;
        const preset = {
          preset_name: String(raw?.name ?? "Preset importado").slice(0, 120),
          tone: raw?.tone,
          pacing: raw?.pacing,
          audience_profile: raw?.audience_profile,
          target_niche: raw?.target_niche,
          forbidden_words: raw?.forbidden_words ?? [],
          formula_virales: rules.formula_virales ?? [],
          gancho_tipo: rules.gancho_tipo ?? "",
          retention_tactics: rules.retention_tactics ?? [],
          narrativa_estructura: rules.narrativa_estructura ?? "",
          palabras_firma: rules.palabras_firma ?? [],
          recipe_script: rules.recipe_script ?? "",
          por_que_funciona: rules.por_que_funciona ?? "",
          ideas_video: rules.ideas_video ?? [],
          verdict: rules.verdict ?? "",
        };
        const res = await fetch("/api/presets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData.session?.access_token ?? ""}`,
          },
          body: JSON.stringify({ action: "save", preset, targetMinutes: rules.target_minutes }),
        });
        if (res.ok) imported++;
      }
      setImportNote(`Importados: ${imported}/${items.length} preset(s)`);
      loadPresets();
    } catch {
      setImportNote("Archivo inválido (JSON esperado)");
    }
  }

  async function duplicatePreset(p: SavedPreset) {
    const rules = (p.narrative_structure_rules ?? {}) as Record<string, unknown>;
    const preset = {
      preset_name: `${p.name} (copia)`.slice(0, 120),
      tone: p.tone,
      pacing: p.pacing,
      audience_profile: p.audience_profile,
      target_niche: p.target_niche,
      forbidden_words: p.forbidden_words ?? [],
      formula_virales: rules.formula_virales ?? [],
      gancho_tipo: rules.gancho_tipo ?? "",
      retention_tactics: rules.retention_tactics ?? [],
      narrativa_estructura: rules.narrativa_estructura ?? "",
      palabras_firma: rules.palabras_firma ?? [],
      recipe_script: rules.recipe_script ?? "",
      por_que_funciona: rules.por_que_funciona ?? "",
      ideas_video: rules.ideas_video ?? [],
      verdict: rules.verdict ?? "",
    };
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      await fetch("/api/presets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ action: "save", preset, targetMinutes: rules.target_minutes }),
      });
      loadPresets();
    } catch {
      /* ignorar */
    }
  }

  // Estimaciones EN vivo (igual que el original: 1 min ≈ 915 caracteres de crédito)
  const approxChars = durationMin * 915;
  const approxWords = Math.round((durationMin * 145));
  const estCredits = approxChars;

  const limitReached = usedPresets >= maxPresets && maxPresets < 900;

  const [showCloneModal, setShowCloneModal] = useState(false);

  const showAnalyzing = analyzing;
  const showReview = !!presetIA && !saved;
  const isDone = stepIdx >= STEPS.length;
  const showModal = showCloneModal || analyzing || !!presetIA;
  const isIdle = showModal && !analyzing && !presetIA;

  return (
    <AppShell active="presets">
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Modal "Clonar Canal con IA" */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => {
                if (showReview || isIdle) {
                  setShowCloneModal(false);
                  setPresetIA(null);
                  setCanal(null);
                  setMonetization(null);
                  setVideosTop([]);
                  setSaved(false);
                }
              }}
            />
            <div
              role="dialog"
              aria-modal="true"
              className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                <h2 className="flex items-center gap-2 text-base font-semibold text-white">
                  <Wand2 className="h-4 w-4 text-violet-400" />
                  {isDone ? "Revisa y guarda tu preset" : "Clonar Canal con IA"}
                </h2>
                <button
                  onClick={() => {
                    setShowCloneModal(false);
                    setPresetIA(null);
                    setCanal(null);
                    setMonetization(null);
                    setVideosTop([]);
                    setSaved(false);
                  }}
                  className="text-xs text-slate-500 transition-colors hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              {/* Body — IDLE (form con URL) */}
              {isIdle && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    analyze();
                  }}
                  className="space-y-5 p-6"
                >
                  <p className="text-sm text-slate-400">
                    Analiza un canal de YouTube.com y clona su estilo
                    automáticamente.
                  </p>
                  <div className="flex items-center overflow-hidden rounded-lg border border-slate-700 bg-slate-950/60 focus-within:border-violet-500">
                    <span className="shrink-0 pl-4 text-sm text-slate-500">
                      https://www.youtube.com/
                    </span>
                    <input
                      value={channelUrl}
                      onChange={(e) => setChannelUrl(e.target.value)}
                      placeholder="@saiderblanco2025..."
                      autoFocus
                      className="min-w-0 flex-1 bg-transparent px-2 py-3.5 text-sm text-white outline-none placeholder:text-slate-600"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!channelUrl.trim()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                  >
                    <Wand2 className="h-4 w-4" />
                    Crear preset
                  </button>
                  {error && (
                    <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs text-rose-300">
                      {error}
                    </p>
                  )}
                  <p className="text-center text-[10px] text-slate-600">
                    DATOS REALES DE YOUTUBE · 10 TOP VÍDEOS · ~25 SEGUNDOS
                  </p>
                </form>
              )}

              {/* Body — ANALYZING */}
              {showAnalyzing && !isDone && (
                <div className="space-y-5 p-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      URL del Canal de YouTube
                    </label>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-400">
                      <span className="shrink-0 text-slate-600">https://www.youtube.com/</span>
                      <span className="truncate text-white">{channelUrl.replace(/^https?:\/\/(www\.)?youtube\.com\/?/, "")}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Analizaremos el canal y clonaremos su estilo automáticamente.
                  </p>
                  <ol className="space-y-2 rounded-xl border border-violet-500/20 bg-violet-950/20 p-4">
                    {STEPS.map((label, i) => {
                      const done = i < stepIdx;
                      const current = i === stepIdx && !isDone;
                      return (
                        <li key={i} className="flex items-center gap-3 text-sm">
                          {done ? (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                          ) : current ? (
                            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-violet-400" />
                          ) : (
                            <Circle className="h-5 w-5 shrink-0 text-slate-700" />
                          )}
                          <span className={done ? "text-slate-300" : current ? "font-semibold text-white" : "text-slate-600"}>
                            {label}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}

              {/* Body — REVIEW */}
              {showReview && (
                <div className="max-h-[75vh] overflow-y-auto p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <span className="inline-flex items-center gap-2 text-xs text-violet-300">
                      <Wand2 className="h-3.5 w-3.5" />
                      Canal detectado: <strong className="text-white">{canal?.name}</strong>
                    </span>
                    <span className="text-[10px] text-slate-500">
                      92 api
                    </span>
                  </div>

                  {/* Nombre del preset */}
                  <div className="mt-4">
                    <label className="mb-1 block text-xs font-semibold text-slate-300">
                      Nombre del Preset
                    </label>
                    <input
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Descripción */}
                  <div className="mt-4">
                    <label className="mb-1 block text-xs font-semibold text-slate-300">
                      Descripción
                    </label>
                    <textarea
                      value={presetDesc}
                      onChange={(e) => setPresetDesc(e.target.value)}
                      rows={3}
                      className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm leading-snug text-slate-200 outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Duración objetivo — segmented control + slider */}
                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <label className="text-xs font-semibold text-slate-300">
                        Duración objetivo
                      </label>
                      <div className="flex rounded-lg border border-slate-700 bg-slate-950/60 p-0.5 text-[10px] font-bold uppercase">
                        {([
                          { key: "min", label: "Minutos" },
                          { key: "chars", label: "Caracteres" },
                          { key: "words", label: "Palabras" },
                        ] as const).map(({ key, label }) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setDurationMode(key)}
                            className={`rounded-md px-3 py-1.5 transition-colors ${
                              durationMode === key
                                ? "bg-emerald-600 text-white"
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setDurationMin((m) => Math.max(1, m - 1))}
                            className="rounded bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-2xl font-black tabular-nums text-white">
                            {durationMode === "min"
                              ? `${durationMin} min`
                              : durationMode === "chars"
                                ? `${fmt(approxChars)} car.`
                                : `${fmt(approxWords)} palabras`}
                          </span>
                          <button
                            type="button"
                            onClick={() => setDurationMin((m) => Math.min(60, m + 1))}
                            className="rounded bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 text-xs font-bold tabular-nums text-emerald-400">
                          +{estCredits.toLocaleString("es")}
                        </div>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={60}
                        value={durationMin}
                        onChange={(e) => setDurationMin(Number(e.target.value))}
                        className="h-1.5 w-full accent-emerald-500"
                        aria-label="Duración objetivo"
                      />
                      <p className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Créditos estimados por guion</span>
                        <span>~{(estCredits / 1000).toFixed(1)}K caracteres</span>
                      </p>
                    </div>
                  </div>

                  {/* Chips rápidos de stats + CTA Guardar */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-slate-400">
                      <span className="rounded-full bg-slate-800 px-2.5 py-1">
                        {fmt(canal?.subscribers ?? 0)} subs
                      </span>
                      <span className="rounded-full bg-slate-800 px-2.5 py-1">
                        {fmt(canal?.totalViews ?? 0)} vistas
                      </span>
                      <span className="rounded-full bg-slate-800 px-2.5 py-1">
                        {monetization?.engagementPct}% engagement
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setPresetIA(null);
                          setSaved(false);
                        }}
                        className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={savePreset}
                        disabled={saving || !presetName.trim() || limitReached}
                        className="rounded-lg bg-violet-600 px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader2 className="mr-1.5 inline h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="mr-1.5 inline h-4 w-4" />
                        )}
                        {limitReached ? "Límite alcanzado" : "Guardar preset"}
                      </button>
                    </div>
                  </div>
                  {saveError && (
                    <p className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs text-rose-300">
                      {saveError}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== HEADER ===== */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold">
              <Vault className="h-7 w-7 text-violet-400" />
              Presets
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Gestiona tus configuraciones guardadas
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 rounded-full bg-slate-800 px-4 py-1.5 text-sm font-semibold text-slate-300">
              {usedPresets}/{maxPresets >= 900 ? "∞" : maxPresets} presets
            </span>
            <button
              onClick={exportPresets}
              title="Descargar todos tus presets (JSON)"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Importar presets desde JSON"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
            >
              <Upload className="h-4 w-4" />
              Importar
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
        </div>

        {/* CTA grande — Crear Preset (análisis de canal) */}
        <button
          onClick={() => {
            setChannelUrl("");
            setShowCloneModal(true);
          }}
          className="group mb-8 flex w-full flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/50 via-slate-900/70 to-slate-950/70 px-6 py-5 text-left transition-all hover:border-emerald-500/60"
        >
          <div className="flex min-w-[260px] items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600/20 text-2xl">
              ✦
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                Crear Preset
              </span>
              <h2 className="mt-0.5 text-lg font-bold text-white group-hover:text-emerald-100">
                Clona el estilo del canal que ya gana
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Análisis profundo de ganchos, estructura y voz en ~25 segundos
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-emerald-500">
            ✦ Crear Preset
            <ChevronRight className="h-4 w-4" />
          </span>
        </button>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {saved && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              Preset guardado correctamente
            </p>
            <Link href="/script-lab" className="text-xs font-semibold text-violet-300 hover:text-white">
              Usar en el Script Lab →
            </Link>
          </div>
        )}

        {/* ===== MIS PRESETS ===== */}
        <div className="mt-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <ClipboardList className="h-5 w-5 text-violet-400" />
              Mis presets guardados
            </h2>
            <Link
              href="/script-lab"
              className="text-xs font-semibold text-violet-400 hover:text-violet-300"
            >
              Usar en Script Lab →
            </Link>
          </div>

          {/* Buscador + tabs */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/60 px-3 focus-within:border-violet-500">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                value={presetQuery}
                onChange={(e) => setPresetQuery(e.target.value)}
                placeholder="Buscar presets…"
                className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-slate-600"
              />
            </div>
            {([
              { key: "all", label: `Todos (${savedPresets.length})` },
              { key: "copies", label: `Copias (${savedPresets.filter((p) => p.name.toLowerCase().includes("copia")).length})` },
            ] as Array<{ key: "all" | "copies"; label: string }>).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPresetTab(key)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  presetTab === key
                    ? "bg-violet-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {importNote && (
            <p className="mb-4 rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-xs text-slate-300">
              {importNote}
            </p>
          )}

          {(() => {
            const q = presetQuery.trim().toLowerCase();
            const visible = savedPresets.filter((p) => {
              if (presetTab === "copies" && !p.name.toLowerCase().includes("copia")) return false;
              if (!q) return true;
              return (
                p.name.toLowerCase().includes(q) ||
                (p.target_niche ?? "").toLowerCase().includes(q) ||
                p.tone.toLowerCase().includes(q)
              );
            });
            if (listLoading) {
              return (
                <div className="flex items-center justify-center py-10 text-slate-400">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Cargando tus presets…
                </div>
              );
            }
            if (visible.length === 0) {
              return (
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-6 py-10 text-center text-sm text-slate-400">
                  {savedPresets.length === 0
                    ? "Aún no tienes presets. Clona tu primer canal arriba."
                    : "Ningún preset coincide con el filtro."}
                </div>
              );
            }
            return (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((p) => {
                  const rules = (p.narrative_structure_rules ?? {}) as Record<string, unknown>;
                  const targetMin = typeof rules.target_minutes === "number" ? rules.target_minutes : null;
                  return (
                    <div
                      key={p.id}
                      className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-colors hover:border-violet-500/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 font-bold text-white">{p.name}</h3>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {p.target_niche ?? "Sin nicho"}
                            {targetMin ? ` · ${targetMin} min` : ""}
                          </p>
                        </div>
                        {targetMin ? (
                          <span className="shrink-0 rounded-md bg-emerald-500/15 px-2 py-1 text-[10px] font-bold text-emerald-400">
                            {targetMin} min
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${toneColors[p.tone] ?? toneColors.engaging}`}>
                          {TONE_LABELS[p.tone] ?? p.tone}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${pacingColors[p.pacing] ?? pacingColors.medium}`}>
                          {PACING_LABELS[p.pacing] ?? p.pacing}
                        </span>
                      </div>
                      {p.forbidden_words?.length > 0 && (
                        <p className="mt-3 text-[10px] text-slate-500">
                          Sin: {p.forbidden_words.slice(0, 4).join(", ")}
                          {p.forbidden_words.length > 4 ? "…" : ""}
                        </p>
                      )}
                      <div className="mt-auto flex items-center gap-1.5 pt-4">
                        <Link
                          href="/script-lab"
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-violet-700"
                        >
                          Usar preset
                        </Link>
                        <button
                          onClick={() => duplicatePreset(p)}
                          className="rounded-md border border-slate-700 p-2 text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
                          title="Duplicar"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deletePreset(p.id)}
                          className="rounded-md border border-slate-700 p-2 text-slate-400 transition-colors hover:border-rose-500/60 hover:text-rose-400"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </main>
    </AppShell>
  );
}
