"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Sparkles,
  FileText,
  Tags,
  Clock,
  AlertCircle,
  History,
  Copy,
  Download,
  Check,
  Coins,
  Star,
} from "lucide-react";
import { Button } from "@/componentsui/ui/button";
import { Input } from "@/componentsui/ui/input";
import { Select, SelectOption } from "@/componentsui/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/componentsui/ui/alert";
import type { GeneratedScript } from "@/lib/script-engine";
import {
  supabase,
  useUser,
  saveScript as saveScriptToDb,
  listMyScripts,
  getScriptById,
  type ScriptHistoryItem,
} from "@/lib/supabase";
import { AppShell } from "@/components/app-shell";

export default function ScriptLabPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();

  // Redirigir al login si no hay sesión
  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  // Parámetros del formulario
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("es");
  const [tone, setTone] = useState("engaging");
  const [videoLength, setVideoLength] = useState("30");
  const [targetAudience, setTargetAudience] = useState("creadores de contenido");
  const [forbiddenWords, setForbiddenWords] = useState("");

  // Estado de generación
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [script, setScript] = useState<GeneratedScript | null>(null);

  // Guardado en Supabase
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [viewingHistory, setViewingHistory] = useState(false);

  // Historial de guiones
  const [history, setHistory] = useState<ScriptHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyDays, setHistoryDays] = useState<number>(0); // 0 = todos
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [usageNote, setUsageNote] = useState<{
    charsUsed: number;
    balanceAfter: number | null;
  } | null>(null);
  const [insufficientCredits, setInsufficientCredits] = useState(false);

  useEffect(() => {
    if (!user) return;
    setHistoryLoading(true);
    listMyScripts(user.id).then((items) => {
      setHistory(items);
      setHistoryLoading(false);
    });
    try {
      const stored = localStorage.getItem(`scripzy-favorites-${user.id}`);
      setFavorites(stored ? (JSON.parse(stored) as string[]) : []);
    } catch {
      setFavorites([]);
    }
  }, [user]);

  function toggleFavorite(id: string) {
    if (!user) return;
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(`scripzy-favorites-${user.id}`, JSON.stringify(next));
      } catch {
        /* sin storage */
      }
      return next;
    });
  }

  // Filtrado (solo guardo la comparación de texto/fecha, sin mutar `history`)
  const filteredHistory = history.filter((h) => {
    if (showOnlyFavorites && !favorites.includes(h.id)) return false;
    if (historyQuery.trim()) {
      const q = historyQuery.trim().toLowerCase();
      const hay = `${h.title} ${h.topic}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (historyDays > 0) {
      const cutoff = Date.now() - historyDays * 86_400_000;
      if (new Date(h.created_at).getTime() < cutoff) return false;
    }
    return true;
  });
  const historySorted = [...filteredHistory].sort((a, b) => {
    const fa = favorites.includes(a.id) ? 0 : 1;
    const fb = favorites.includes(b.id) ? 0 : 1;
    if (fa !== fb) return fa - fb;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim() || loading) return;

    setLoading(true);
    setError(null);
    setScript(null);
    setSaveStatus("idle");
    setSaveError(null);
    setViewingHistory(false);
    setInsufficientCredits(false);
    setUsageNote(null);

    try {
      // Token de sesión para la API (verifica identidad y habilita el cerebro por usuario)
      const { data: sessionData } = await supabase.auth.getSession();

      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({
          topic: topic.trim(),
          language,
          tone,
          targetAudience,
          videoLength,
          forbiddenWords: forbiddenWords
            .split(",")
            .map((w) => w.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Saldo agotado → aviso especial con enlace a planes
        if (data?.code === "INSUFFICIENT_CREDITS") {
          setInsufficientCredits(true);
          throw new Error(
            data?.message ??
              "Te quedaste sin caracteres. Sube de plan o compra un pack de recarga."
          );
        }
        throw new Error(data?.error || "Error generando el guion");
      }

      setScript(data.script as GeneratedScript);
      // Nota de cobro (tu cuenta de dueño no descuenta)
      if (typeof data?.charsUsed === "number" && data.charsUsed > 0) {
        setUsageNote({
          charsUsed: data.charsUsed,
          balanceAfter: data?.balanceAfter ?? null,
        });
      }

      // Auto-guardado en la tabla scripts de Supabase
      const generated = data.script as GeneratedScript;
      if (user) {
        setSaveStatus("saving");
        const { error: saveErr } = await saveScriptToDb({
          userId: user.id,
          title: generated.title,
          topic: topic.trim(),
          language,
          characterCount: generated.character_count,
          hookText: generated.outline.hook,
          ctaText: generated.outline.cta,
          bodyText: generated.body,
          visualCuesJson: {
            outline: generated.outline,
            visual_cues: generated.visual_cues,
          },
          seoMetadata: generated.seo,
          status: generated.status,
        });

        if (saveErr) {
          setSaveStatus("error");
          setSaveError(saveErr);
        } else {
          setSaveStatus("saved");
          listMyScripts(user.id).then(setHistory);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function loadFromHistory(id: string) {
    if (loading) return;
    const row = await getScriptById(id);
    if (!row) return;

    const json = (row.visual_cues_json ?? {}) as {
      outline?: GeneratedScript["outline"];
      visual_cues?: GeneratedScript["visual_cues"];
    };
    const seo = (row.seo_metadata ?? {
      titles: [],
      description: "",
      tags: [],
    }) as GeneratedScript["seo"];
    const body = row.body_text ?? "";

    const restored: GeneratedScript = {
      id: row.id,
      title: row.title,
      topic: row.topic ?? "",
      language: row.language ?? "es",
      tone: row.tone ?? "engaging",
      outline: json.outline ?? {
        hook: row.hook_text ?? "",
        retention_points: [],
        climax: "",
        cta: row.cta_text ?? "",
        sections: [],
      },
      seo,
      body,
      word_count: body.split(/\s+/).filter(Boolean).length,
      character_count: row.actual_character_count ?? body.length,
      visual_cues: json.visual_cues ?? [],
      status: (row.status as GeneratedScript["status"]) ?? "completed",
      created_at: row.created_at ?? new Date().toISOString(),
    };

    setScript(restored);
    setViewingHistory(true);
    setSaveStatus("saved");
    setSaveError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ===== Exportación del guion (copiar / txt / Word) =====
  const [copied, setCopied] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState<number | null>(null);

  function buildExportText(): string {
    if (!script) return "";
    const title = script.title ?? "Guion Scripzy";
    const parts = [title.toUpperCase(), ""];
    if (script.outline?.hook) {
      parts.push("== GANCHO ==", script.outline.hook, "");
    }
    parts.push("== GUION ==", script.body);
    if (script.seo?.description) {
      parts.push("", "== DESCRIPCIÓN SEO ==", script.seo.description);
    }
    if (script.seo?.tags?.length) {
      parts.push("", "== TAGS ==", script.seo.tags.map((t) => "#" + t).join(" "));
    }
    return parts.join("\n");
  }

  function escapeHtml(s: string): string {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  async function copyScript() {
    if (!script) return;
    try {
      await navigator.clipboard.writeText(buildExportText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* permiso denegado */
    }
  }

  function downloadExport(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadTxt() {
    if (!script) return;
    downloadExport(
      new Blob([buildExportText()], { type: "text/plain;charset=utf-8" }),
      "guion-scripzy.txt"
    );
  }

  function downloadWord() {
    if (!script) return;
    const html =
      '<html><head><meta charset="utf-8"></head><body><div style="font-family:Calibri, sans-serif; font-size:12pt; white-space:pre-wrap;">' +
      escapeHtml(buildExportText()) +
      "</div></body></html>";
    downloadExport(
      new Blob([html], { type: "application/msword;charset=utf-8" }),
      "guion-scripzy.doc"
    );
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <AppShell active="script-lab">
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Formulario */}
          <section className="lg:col-span-2">
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-6">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold">
                <Sparkles className="h-5 w-5 text-violet-400" />
                Parámetros del guion
              </h2>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm text-slate-300">
                    Tema del video
                  </label>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ej: Cómo los piratas modernos ganan millones"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm text-slate-300">Idioma</label>
                    <Select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      disabled={loading}
                    >
                      <SelectOption value="es">Español</SelectOption>
                      <SelectOption value="en">English</SelectOption>
                      <SelectOption value="fr">Français</SelectOption>
                      <SelectOption value="de">Deutsch</SelectOption>
                      <SelectOption value="pt">Português</SelectOption>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-300">Tono</label>
                    <Select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      disabled={loading}
                    >
                      <SelectOption value="engaging">Engaging</SelectOption>
                      <SelectOption value="educational">Educational</SelectOption>
                      <SelectOption value="persuasive">Persuasive</SelectOption>
                      <SelectOption value="entertaining">Entertaining</SelectOption>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-300">
                    Duración del video
                  </label>
                  <Select
                    value={videoLength}
                    onChange={(e) => setVideoLength(e.target.value)}
                    disabled={loading}
                  >
                    <SelectOption value="30">
                      30 min — Documental completo (recomendado)
                    </SelectOption>
                    <SelectOption value="20">20 min — Estándar</SelectOption>
                    <SelectOption value="12">12 min — Rápido</SelectOption>
                  </Select>
                  <p className="mt-1 text-[11px] text-slate-500">
                    El guion se adapta: para 30 min son ~4,300–5,200 palabras
                    con retención cada 2–3 minutos y 8–10 secciones.
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-300">
                    Audiencia objetivo
                  </label>
                  <Input
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Ej: emprendedores, gamers, estudiantes"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-300">
                    Palabras prohibidas (separadas por coma)
                  </label>
                  <Input
                    value={forbiddenWords}
                    onChange={(e) => setForbiddenWords(e.target.value)}
                    placeholder="palabra1, palabra2"
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !topic.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generando guion...
                    </>
                  ) : (
                    "Generar guion"
                  )}
                </Button>
              </form>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {insufficientCredits ? "Sin créditos" : "Error"}
                  </AlertTitle>
                  <AlertDescription>
                    {error}
                    {insufficientCredits && (
                      <a
                        href="/pricing"
                        className="mt-3 block w-full rounded-md bg-violet-600 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-violet-700"
                      >
                        Ver planes y packs de recarga →
                      </a>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Historial de guiones */}
            <div className="mt-6 rounded-lg border border-slate-700 bg-slate-900/60 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <History className="h-5 w-5 text-amber-400" />
                Mis guiones
                <span className="ml-auto text-xs font-normal text-slate-500">
                  {historySorted.length} de {history.length}
                </span>
              </h2>

              {/* Buscador + filtros */}
              {history.length > 0 && (
                <div className="mb-4 space-y-2">
                  <input
                    type="text"
                    value={historyQuery}
                    onChange={(e) => setHistoryQuery(e.target.value)}
                    placeholder="Buscar por título o tema…"
                    className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs outline-none placeholder:text-slate-600 focus:border-violet-500"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { d: 0, label: "Todos" },
                      { d: 7, label: "7 días" },
                      { d: 30, label: "30 días" },
                      { d: 90, label: "90 días" },
                    ].map(({ d, label }) => (
                      <button
                        key={d}
                        onClick={() => setHistoryDays(d)}
                        className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          historyDays === d
                            ? "bg-violet-600 text-white"
                            : "bg-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                    <button
                      onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                      className={`flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        showOnlyFavorites
                          ? "bg-amber-500 text-amber-950"
                          : "bg-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Star
                        className={`h-3 w-3 ${showOnlyFavorites ? "fill-amber-950" : ""}`}
                      />
                      Favoritos
                    </button>
                  </div>
                </div>
              )}

              {historyLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando historial...
                </div>
              ) : historySorted.length === 0 ? (
                history.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Aún no tienes guiones guardados. Genera tu primero y
                    aparecerá aquí automáticamente.
                  </p>
                ) : (
                  <p className="text-sm text-slate-400">
                    Ningún guion coincide con el filtro.{" "}
                    <button
                      onClick={() => {
                        setHistoryQuery("");
                        setHistoryDays(0);
                        setShowOnlyFavorites(false);
                      }}
                      className="text-violet-400 underline hover:text-violet-300"
                    >
                      Limpiar filtros
                    </button>
                  </p>
                )
              ) : (
                <ul className="space-y-2">
                  {historySorted.map((h) => (
                    <li key={h.id} className="flex items-stretch gap-1.5">
                      <button
                        type="button"
                        onClick={() => loadFromHistory(h.id)}
                        className="w-full rounded border border-slate-700 bg-slate-800/60 px-3 py-2 text-left text-sm transition-colors hover:border-violet-500 hover:bg-slate-800"
                      >
                        <span className="block truncate font-medium text-slate-200">
                          {h.title}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(h.created_at).toLocaleString("es", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          · {(h.actual_character_count ?? 0).toLocaleString()} caracteres
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(h.id)}
                        className="shrink-0 rounded border border-slate-700 bg-slate-800/60 px-2 text-slate-500 transition-colors hover:border-amber-500/50 hover:text-amber-400"
                        title={
                          favorites.includes(h.id)
                            ? "Quitar de favoritos"
                            : "Añadir a favoritos"
                        }
                      >
                        <Star
                          className={`h-4 w-4 ${
                            favorites.includes(h.id)
                              ? "fill-amber-400 text-amber-400"
                              : ""
                          }`}
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Resultado */}
          <section className="lg:col-span-3">
            {usageNote && (
              <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-950/30 px-4 py-2.5 text-xs text-violet-300">
                <Coins className="h-4 w-4 shrink-0" />
                <span>
                  <strong>{usageNote.charsUsed.toLocaleString("es")}</strong>{" "}
                  caracteres descontados
                  {usageNote.balanceAfter !== null && (
                    <>
                      {" "}
                      · Te quedan{" "}
                      <strong>
                        {usageNote.balanceAfter.toLocaleString("es")}
                      </strong>
                    </>
                  )}
                </span>
                <a
                  href="/pricing"
                  className="ml-auto font-semibold text-violet-200 underline decoration-violet-400/40 hover:text-white"
                >
                  Recargar →
                </a>
              </div>
            )}
            {!script && !loading && (
              <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center">
                <div>
                  <FileText className="mx-auto mb-4 h-12 w-12 text-slate-600" />
                  <p className="text-slate-400">
                    Tu guion generado aparecerá aquí.
                    <br />
                    Configura los parámetros y presiona{" "}
                    <span className="text-violet-400">Generar guion</span>.
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg border border-slate-700 bg-slate-900/40">
                <div className="text-center">
                  <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-violet-500" />
                  <p className="text-slate-400">
                    🧠 La IA está escribiendo tu guion completo...
                    <br />
                    <span className="text-xs">
                      Gancho → Estructura → Guion largo → SEO. Puede tardar 1 a 3
                      minutos, no cierres la página.
                    </span>
                  </p>
                </div>
              </div>
            )}

            {script && !loading && (
              <div className="space-y-6">
                {/* Título y métricas */}
                <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-6">
                  <h2 className="text-xl font-bold text-white">{script.title}</h2>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                    <span className="rounded bg-slate-800 px-2 py-1">
                      {script.word_count.toLocaleString()} palabras
                    </span>
                    <span className="rounded bg-slate-800 px-2 py-1">
                      {script.character_count.toLocaleString()} caracteres
                    </span>
                    <span className="rounded bg-slate-800 px-2 py-1">
                      Estado: {script.status}
                    </span>
                    {saveStatus === "saving" && (
                      <span className="rounded bg-violet-500/20 px-2 py-1 text-violet-300">
                        Guardando en tu historial…
                      </span>
                    )}
                    {saveStatus === "saved" && (
                      <span className="rounded bg-emerald-500/10 px-2 py-1 text-emerald-300">
                        ✓ Guardado en Supabase
                      </span>
                    )}
                    {saveStatus === "error" && (
                      <span className="rounded bg-red-500/10 px-2 py-1 text-red-300">
                        Error al guardar
                      </span>
                    )}
                    {viewingHistory && (
                      <span className="rounded bg-amber-500/10 px-2 py-1 text-amber-300">
                        Cargado desde tu historial
                      </span>
                    )}
                  </div>
                  {saveStatus === "error" && saveError && (
                    <p className="mt-2 text-xs text-red-400">
                      No se pudo guardar: {saveError}
                    </p>
                  )}
                </div>

                {/* SEO */}
                <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-6">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold">
                    <Tags className="h-4 w-4 text-amber-400" />
                    Variantes SEO (Curiosity Gap)
                  </h3>
                  <ul className="mb-4 space-y-2">
                    {script.seo.titles.map((t, i) => (
                      <li
                        key={i}
                        className="group rounded border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm"
                      >
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-3 text-left"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(t);
                              setCopiedTitle(i);
                              setTimeout(() => setCopiedTitle(null), 2000);
                            } catch {
                              /* sin permiso */
                            }
                          }}
                        >
                          <span className="text-slate-200">{t}</span>
                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition-colors group-hover:text-violet-400">
                            {copiedTitle === i ? (
                              <span className="text-emerald-400">¡Copiado!</span>
                            ) : (
                              <span className="inline-flex items-center gap-1">
                                <Copy className="h-3 w-3" /> A/B · copiar
                              </span>
                            )}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="mb-3 text-sm text-slate-300">
                    {script.seo.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {script.seo.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-violet-500/10 px-3 py-1 text-xs text-violet-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Outline */}
                <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-6">
                  <h3 className="mb-3 font-semibold">Estructura (Outline)</h3>
                  <p className="mb-2 text-sm text-violet-300">
                    <strong>Gancho:</strong> {script.outline.hook}
                  </p>
                  <div className="space-y-2">
                    {script.outline.sections.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm"
                      >
                        <Clock className="h-4 w-4 shrink-0 text-slate-500" />
                        <span className="text-slate-500">{s.duration_estimate}</span>
                        <span className="font-medium">{s.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guion completo */}
                <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-6">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">Guion completo</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={copyScript}>
                        {copied ? (
                          <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        {copied ? "¡Copiado!" : "Copiar"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={downloadTxt}>
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        .txt
                      </Button>
                      <Button size="sm" variant="outline" onClick={downloadWord}>
                        <FileText className="mr-1.5 h-3.5 w-3.5" />
                        Word
                      </Button>
                    </div>
                  </div>
                  <pre className="max-h-[500px] overflow-y-auto whitespace-pre-wrap rounded bg-slate-950 p-4 text-xs leading-relaxed text-slate-300">
                    {script.body}
                  </pre>
                </div>

                {/* Cues audiovisuales */}
                <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-6">
                  <h3 className="mb-3 font-semibold">
                    Cues audiovisuales ({script.visual_cues.length})
                  </h3>
                  <div className="space-y-2 text-sm">
                    {script.visual_cues.map((cue, i) => (
                      <div
                        key={i}
                        className="rounded border border-slate-700 bg-slate-800/60 px-3 py-2"
                      >
                        <span className="mr-2 font-mono text-xs text-amber-400">
                          {cue.timestamp}
                        </span>
                        <span className="text-slate-300">{cue.b_roll}</span>
                        <span className="block text-xs text-slate-500">{cue.sfx}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </AppShell>
  );
}