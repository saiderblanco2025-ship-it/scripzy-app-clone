"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Mic,
  Download,
  Trash2,
  AlertCircle,
  DownloadCloud,
  Volume2,
} from "lucide-react";
import { Button } from "@/componentsui/ui/button";
import { Alert, AlertDescription } from "@/componentsui/ui/alert";
import { supabase, useUser } from "@/lib/supabase";
import { AppShell } from "@/components/app-shell";

const VOICES = [
  { id: "onyx", name: "Onyx", desc: "Narrador grave y potente — documentales", tag: "Más usado" },
  { id: "nova", name: "Nova", desc: "Femenina enérgica y cálida — vlogs", tag: "" },
  { id: "alloy", name: "Alloy", desc: "Neutro y equilibrado — tutoriales", tag: "" },
  { id: "echo", name: "Echo", desc: "Masculina profunda y relajada", tag: "" },
  { id: "fable", name: "Fable", desc: "Narrativa elegante — historias", tag: "Especial" },
  { id: "shimmer", name: "Shimmer", desc: "Suave y amable — bienestar", tag: "" },
];

type VoiceFile = { name: string; url: string; created_at: string | null };

export default function VocesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const [text, setText] = useState("");
  const [voice, setVoice] = useState("onyx");
  const [speed, setSpeed] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creditsEmpty, setCreditsEmpty] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultParts, setResultParts] = useState<number | null>(null);
  const [voices, setVoices] = useState<VoiceFile[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadVoices = useCallback(async () => {
    if (!user) return;
    setListLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch("/api/voice", {
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token ?? ""}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setVoices(data.voices ?? []);
      }
    } finally {
      setListLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadVoices();
  }, [loadVoices]);

  async function generate() {
    const t = text.trim();
    if (!t || loading) return;
    setLoading(true);
    setError(null);
    setCreditsEmpty(false);
    setResultUrl(null);
    setResultParts(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ text: t, voice, speed }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.code === "VOICE_CREDITS_EMPTY") {
          setCreditsEmpty(true);
          throw new Error(
            data?.message ?? "No te quedan créditos de voz. Sube de plan."
          );
        }
        throw new Error(data?.error || "Error al narrar");
      }
      setResultUrl(data.url);
      setResultParts(data.parts ?? null);
      loadVoices();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function deleteVoice(path: string) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      await fetch("/api/voice", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ path }),
      });
      loadVoices();
    } catch {
      /* ignorar */
    }
  }

  const charCount = text.trim().length;
  const approxMinutes =
    charCount > 0 ? Math.max(1, Math.round(charCount / (780 * speed))) : 0;

  return (
    <AppShell active="voces">
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold">
            <Mic className="h-7 w-7 text-violet-400" />
            Voces IA
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Pega tu guion y escúchalo narrado con voz natural en segundos.
            Ideal para pre-visualizar antes de grabar… o para tu canal de voz en off.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Columna de configuración */}
          <div className="lg:col-span-3">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-200">
                  Tu guion
                </label>
                <span
                  className={`text-xs ${charCount > 20000 ? "text-rose-400" : "text-slate-500"}`}
                >
                  {charCount.toLocaleString("es")} / 20,000 · ~{approxMinutes} min de audio
                </span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Pega aquí el guion que generaste en el Script Lab, o escribe cualquier texto…"
                rows={12}
                className="w-full resize-y rounded-md border border-slate-700 bg-slate-950/60 p-4 text-sm leading-relaxed text-slate-200 outline-none placeholder:text-slate-600 focus:border-violet-500"
              />

              {/* Velocidad de narración */}
              <p className="mt-5 mb-2 text-sm font-semibold text-slate-200">
                Velocidad
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { v: 0.75, label: "0.75x", hint: "Lento" },
                  { v: 1.0, label: "1.0x", hint: "Normal" },
                  { v: 1.25, label: "1.25x", hint: "Rápido" },
                  { v: 1.5, label: "1.5x", hint: "Muy rápido" },
                ].map(({ v, label, hint }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSpeed(v)}
                    className={`rounded-lg border px-4 py-2 text-center transition-all ${
                      speed === v
                        ? "border-violet-500 bg-violet-950/40 ring-1 ring-violet-500/40"
                        : "border-slate-700 bg-slate-950/40 hover:border-slate-600"
                    }`}
                  >
                    <span className="block text-sm font-bold text-white">{label}</span>
                    <span className="block text-[10px] text-slate-400">{hint}</span>
                  </button>
                ))}
              </div>

              {/* Selector de voz */}
              <p className="mt-5 mb-2 text-sm font-semibold text-slate-200">
                Voz
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {VOICES.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVoice(v.id)}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      voice === v.id
                        ? "border-violet-500 bg-violet-950/40 ring-1 ring-violet-500/40"
                        : "border-slate-700 bg-slate-950/40 hover:border-slate-600"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                      {v.name}
                      {v.tag && (
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[8px] font-bold uppercase text-amber-400">
                          {v.tag}
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-[10px] leading-snug text-slate-400">
                      {v.desc}
                    </span>
                  </button>
                ))}
              </div>

              <Button
                className="mt-5 w-full bg-violet-600 hover:bg-violet-700"
                size="lg"
                onClick={generate}
                disabled={loading || charCount < 10 || charCount > 20000}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Narrando tu guion… (30-60s)
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-5 w-5" />
                    Narrar mi guion
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                  {creditsEmpty && (
                    <a
                      href="/pricing"
                      className="mt-2 block text-center text-xs font-semibold text-violet-300 underline hover:text-white"
                    >
                      Ver planes y recargas →
                    </a>
                  )}
                </Alert>
              )}
            </div>
          </div>

          {/* Columna de resultado + biblioteca */}
          <div className="lg:col-span-2">
            {/* Resultado */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="flex items-center gap-2 font-semibold">
                <Volume2 className="h-4 w-4 text-violet-400" />
                Resultado
              </h2>
              {resultUrl ? (
                <div className="mt-4">
                  <audio controls src={resultUrl} className="w-full" />
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">
                      {resultParts ? `${resultParts} parte(s) unidas · Voz ${voice}` : "Lista"}
                    </span>
                    <a
                      href={resultUrl}
                      download="narracion-scripzy.mp3"
                      className="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-700"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Descargar MP3
                    </a>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-500">
                  Aquí aparecerá tu audio. Los textos largos se narran en partes
                  y se unen en un solo MP3 descargable.
                </p>
              )}
            </div>

            {/* Biblioteca */}
            <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold">
                  <DownloadCloud className="h-4 w-4 text-amber-400" />
                  Mis narraciones
                </h2>
                <button
                  onClick={loadVoices}
                  className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-300"
                >
                  Actualizar
                </button>
              </div>
              <div className="mt-4 max-h-[340px] space-y-2 overflow-y-auto">
                {listLoading ? (
                  <p className="flex items-center justify-center gap-2 py-6 text-xs text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando…
                  </p>
                ) : voices.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-500">
                    Aún no has generado narraciones.
                  </p>
                ) : (
                  voices.map((v) => {
                    const match = v.name.match(/^\d+-([a-z]+)\.mp3$/);
                    const date = /^\d+/.exec(v.name)
                      ? new Date(Number(/^\d+/.exec(v.name)![0])).toLocaleString("es", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : v.name;
                    return (
                      <div
                        key={v.name}
                        className="flex items-center justify-between gap-2 rounded border border-slate-800 bg-slate-950/60 px-3 py-2"
                      >
                        <a
                          href={v.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-w-0"
                        >
                          <p className="truncate text-xs font-medium text-slate-200 hover:text-white">
                            🎙️ {date} {match ? `· ${match[1]}` : ""}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {v.created_at
                              ? new Date(v.created_at).toLocaleDateString("es")
                              : "MP3"}
                          </p>
                        </a>
                        <button
                          onClick={() => deleteVoice(`${user?.id}/${v.name}`)}
                          className="shrink-0 rounded p-1.5 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Nota de créditos */}
        <Alert variant="default" className="mt-6">
          <AlertDescription className="text-xs text-slate-400">
            Cada narración consume <strong>1 crédito de voz</strong> · Tu cuenta
            de dueño no gasta créditos · Los textos de hasta 20,000 caracteres se
            narran con calidad natural de OpenAI
          </AlertDescription>
        </Alert>
      </main>
    </AppShell>
  );
}
