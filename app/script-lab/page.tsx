"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, FileText, Tags, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/componentsui/ui/button";
import { Input } from "@/componentsui/ui/input";
import { Select, SelectOption } from "@/componentsui/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/componentsui/ui/alert";
import type { GeneratedScript } from "@/lib/script-engine";
import { useUser } from "@/lib/supabase";
import { UserMenu } from "@/components/user-menu";

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
  const [targetAudience, setTargetAudience] = useState("creadores de contenido");
  const [forbiddenWords, setForbiddenWords] = useState("");

  // Estado de generación
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [script, setScript] = useState<GeneratedScript | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim() || loading) return;

    setLoading(true);
    setError(null);
    setScript(null);

    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          language,
          tone,
          targetAudience,
          forbiddenWords: forbiddenWords
            .split(",")
            .map((w) => w.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Error generando el guion");
      }

      setScript(data.script as GeneratedScript);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">
            ⚡ Script Lab
          </h1>
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-sm text-slate-400 transition-colors hover:text-slate-200"
            >
              ← Inicio
            </a>
            <UserMenu />
          </div>
        </div>
      </header>

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
                    Error
                  </AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </section>

          {/* Resultado */}
          <section className="lg:col-span-3">
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
                    Ejecutando pipeline de 4 fases...
                    <br />
                    <span className="text-xs">
                      Outline → SEO → Secciones con cues → Ensamblado
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
                  </div>
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
                        className="rounded border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm"
                      >
                        {t}
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
                  <h3 className="mb-3 font-semibold">Guion completo</h3>
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
    </div>
  );
}