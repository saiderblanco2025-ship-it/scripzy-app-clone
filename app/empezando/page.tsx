"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Compass,
  Radar,
  TrendingUp,
  Sparkles,
  Mic,
  ImageIcon,
  Rocket,
  ChevronRight,
  CheckCircle2,
  Circle,
  Map,
  CalendarClock,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/componentsui/ui/button";

type Step = {
  id: number;
  phase: number;
  icon: typeof Compass;
  title: string;
  time: string;
  why: string;
  do: string[];
  outcome: string;
  href: string;
  cta: string;
};

const PHASES = [
  { id: 1, name: "Investigar", desc: "Elige un nicho que paga antes de grabar", color: "text-cyan-400", border: "border-cyan-500/30", bg: "from-cyan-950/50 to-slate-900/40" },
  { id: 2, name: "Crear", desc: "De idea a guion con voz en menos de 1 hora", color: "text-violet-400", border: "border-violet-500/30", bg: "from-violet-950/50 to-slate-900/40" },
  { id: 3, name: "Empacar", desc: "Miniatura + títulos que la gente toca", color: "text-amber-400", border: "border-amber-500/30", bg: "from-amber-950/50 to-slate-900/40" },
  { id: 4, name: "Publicar", desc: "Consistencia > perfección", color: "text-emerald-400", border: "border-emerald-500/30", bg: "from-emerald-950/50 to-slate-900/40" },
];

const STEPS: Step[] = [
  {
    id: 1,
    phase: 1,
    icon: Compass,
    title: "Regístrate gratis",
    time: "1 minuto",
    why: "Scripzy es web — no instalas nada. Entras y tienes créditos gratis para tu primer guion.",
    do: [
      "Entra a scripzy-app-clone-rwg9.vercel.app → Empieza gratis",
      "Regístrate con Google o con tu correo",
      "Entra a tu Dashboard y mira tus créditos iniciales",
    ],
    outcome: "Tienes tu cuenta y tus créditos gratis listos",
    href: "/dashboard",
    cta: "Ir a mi Dashboard",
  },
  {
    id: 2,
    phase: 1,
    icon: Compass,
    title: "Encuentra un nicho que paga",
    time: "5 minutos",
    why: "Un nicho con RPM alto vale más que 10 publicaciones con RPM bajo. Primero plata, después permanencia.",
    do: [
      "Abre Buscador de Nichos (sidebar)",
      "Escribe un tema: 'finanzas personales', 'historia antigua', 'IA'",
      "Filtra por: RPM alto, Demanda alta, Competencia baja, Faceless friendly ✅",
      "Apunta 3 nichos con Score 70+",
    ],
    outcome: "Tienes un nicho validado con datos REALES de YouTube",
    href: "/nichos",
    cta: "Buscar nichos",
  },
  {
    id: 3,
    phase: 1,
    icon: Radar,
    title: "Estúdia el nicho en profundidad (Research)",
    time: "3 minutos",
    why: "Antes de grabar un segundo de video, sabes quién gana, cuánto pagan, qué títulos funcionan y qué huecos atacar.",
    do: [
      "Abre Research (sidebar)",
      "Escribe tu tema e idioma de mercado",
      "Lee el veredicto + los 3 canales que dominan + el hueco que dejan",
      "Guarda: 3 ángulos + 2 títulos tendencia del informe",
    ],
    outcome: "Un veredicto claro (VIABLE o NO) con plan honesto de 30 días",
    href: "/research",
    cta: "Generar estudio",
  },
  {
    id: 4,
    phase: 2,
    icon: TrendingUp,
    title: "Roba las fórmulas ganadoras (Top Patterns)",
    time: "2 minutos",
    why: "La IA de Scripzy detectó por qué los videos más vistos de tu nicho funcionan. Replicar el patrón NO es imitar: es jugar con dados cargados.",
    do: [
      "Abre Top Patterns (sidebar)",
      "Busca tu nicho → la IA detecta 5-7 patrones virales",
      "Elige 1 patrón: estructura de gancho + duración + formato",
    ],
    outcome: "Sabes exactamente qué estructura de video darle",
    href: "/patrones",
    cta: "Ver patrones",
  },
  {
    id: 5,
    phase: 2,
    icon: Sparkles,
    title: "Genera tu guion completo",
    time: "1-3 minutos",
    why: "El motor de 4 fases escribe como un guionista en tu canal: gancho probado → secciones con retención → SEO completo con 5 títulos A/B.",
    do: [
      "Abre Script Lab → elige tu nicho y patrón",
      "Tema = el título ganador del Research",
      "Genera el guion → ¡revisa el gancho primero!",
      "Úsalo tal cual (bueno) o adáptalo 10% a tu voz (mejor)",
      "Descarga el .doc o copia al portapapeles",
    ],
    outcome: "Un guion completo con estructura de alta retención",
    href: "/script-lab",
    cta: "Generar guion",
  },
  {
    id: 6,
    phase: 2,
    icon: Mic,
    title: "Escucha tu guion con voz IA (Voces)",
    time: "1-3 minutos",
    why: "Si no te emociona al escucharlo, no va a retener al espectador. Verifica el ritmo, o úsalo como voz en off de tu video.",
    do: [
      "Abre Voces IA (sidebar)",
      "Pega el guion del Script Lab",
      "Elige voz: Onyx (documental) · Nova (vlogs) · Alloy (tutorial)",
      "Velocidad: 1.0x normal · 1.25x si quieres ritmo rápido",
      "Descarga el MP3 → sube directo a tu editor o canal",
    ],
    outcome: "Tu narración lista en español natural, sin grabar",
    href: "/voces",
    cta: "Narrador IA",
  },
  {
    id: 7,
    phase: 3,
    icon: ImageIcon,
    title: "Crea tu miniatura que se toca",
    time: "1 minuto",
    why: "La miniatura decide el 80% del CTR. Con una imagen fea, el mejor guion del mundo no arranca.",
    do: [
      "Abre Miniaturas (sidebar)",
      "Describe la escena central del video (o un rostro de reacción)",
      "Texto: 3-4 palabras, máximo",
      "Genera 2-3 variantes → quédate con la más clara en móvil",
      "Test A/B: publica 2 títulos con la misma miniatura",
    ],
    outcome: "Tu miniatura 16:9 lista para subir",
    href: "/miniaturas",
    cta: "Crear miniatura",
  },
  {
    id: 8,
    phase: 4,
    icon: Rocket,
    title: "Publica, mide y repite (el sistema real)",
    time: "10 minutos",
    why: "Un video no monetiza. Un sistema sí. Consistency financiera: el mayor mito es el primer video — la verdad es el video 10, 20, 50.",
    do: [
      "Sube el video con título del Research + miniatura + tags del guion",
      "Mira CTR y retención a las 72h",
      "Si CTR < 4% → cambia miniatura (Plantilla 1 de fondos limpios)",
      "Repite: 2 videos por semana mínimo, siempre nicho validado",
    ],
    outcome: "Tu canal en ruta real de monetización",
    href: "/dashboard",
    cta: "Ver mi Dashboard",
  },
];

export default function EmpezandoPage() {
  const [done, setDone] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("scripzy-empezando");
      setDone(stored ? (JSON.parse(stored) as number[]) : []);
    } catch {
      setDone([]);
    }
    setLoaded(true);
  }, []);

  function toggle(id: number) {
    setDone((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem("scripzy-empezando", JSON.stringify(next));
      } catch {
        /* sin storage */
      }
      return next;
    });
  }

  const completedCount = done.length;
  const progressPct = Math.round((completedCount / STEPS.length) * 100);

  return (
    <AppShell active="empezando">
      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Hero */}
        <div className="mb-10 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/60 via-slate-900/70 to-slate-950/80 px-6 py-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-500/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-300">
            <Map className="h-3.5 w-3.5" />
            Mapa de ruta
          </span>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
            De cero a tu primer video:<br />
            <span className="text-violet-400">el Método Scripzy en 8 pasos</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
            Sigue esta secuencia exacta y nunca vuelvas a grabar a ciegas. Cada paso te lleva
            al siguiente. Tiempo total: de cuenta nueva a video publicado, en una tarde.
          </p>

          {/* Barra de progreso */}
          <div className="mx-auto mt-6 max-w-md">
            <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <span>Tu progreso</span>
              <span>{completedCount}/{STEPS.length} pasos</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {progressPct === 100 && (
              <p className="mt-3 text-sm font-semibold text-emerald-400">
                🎉 ¡Mapa completado! Tu canal despega ahora.
              </p>
            )}
          </div>
        </div>

        {/* Fases */}
        {PHASES.map((phase) => (
          <section key={phase.id} className="mb-8">
            <div className={`mb-4 flex items-center gap-3 rounded-xl border ${phase.border} bg-gradient-to-r ${phase.bg} px-5 py-3`}>
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-lg font-black ${phase.color}`}>
                {phase.id}
              </span>
              <div>
                <h2 className={`text-lg font-bold ${phase.color}`}>
                  Fase {phase.id}: {phase.name}
                </h2>
                <p className="text-xs text-slate-400">{phase.desc}</p>
              </div>
            </div>

            <div className="space-y-3">
              {STEPS.filter((s) => s.phase === phase.id).map((step) => {
                const isDone = done.includes(step.id);
                const Icon = step.icon;
                return (
                  <div
                    key={step.id}
                    className={`rounded-xl border p-5 transition-all ${
                      isDone
                        ? "border-emerald-500/30 bg-emerald-950/10"
                        : "border-slate-800 bg-slate-900/60"
                    }`}
                  >
                    <div className="flex flex-wrap items-start gap-4">
                      <button
                        onClick={() => toggle(step.id)}
                        className="mt-0.5 shrink-0"
                        title={isDone ? "Marcar como pendiente" : "Marcar como completado"}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                        ) : (
                          <Circle className="h-7 w-7 text-slate-600 transition-colors hover:text-violet-400" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <Icon className={`h-5 w-5 ${isDone ? "text-emerald-400" : "text-violet-400"}`} />
                          <h3 className={`font-bold ${isDone ? "text-emerald-100" : "text-white"}`}>
                            Paso {step.id} — {step.title}
                          </h3>
                          <span className="flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            <CalendarClock className="h-3 w-3" />
                            {step.time}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-300">
                          <span className="font-semibold text-violet-300">¿Por qué? </span>
                          {step.why}
                        </p>

                        <div className="mt-3 text-sm">
                          <span className="font-semibold text-slate-200">Qué hacer:</span>
                          <ul className="mt-1.5 space-y-1 text-slate-300">
                            {step.do.map((d, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-violet-400">→</span>
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <p className="text-[11px] text-slate-500">
                            <span className="text-emerald-500">Resultado: </span>
                            {step.outcome}
                          </p>
                          <Link href={step.href}>
                            <Button size="sm" variant={isDone ? "outline" : "default"} className="bg-violet-600 hover:bg-violet-700 focus:bg-violet-600">
                              {step.cta}
                              <ChevronRight className="ml-1.5 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* Footer CTA */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 px-6 py-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            La regla de oro
          </p>
          <h3 className="mt-2 text-2xl font-bold text-white">
            2 videos por semana sobre 1 nicho validado.
            <br />
            <span className="text-slate-400">Durante 90 días. Sin dudarlo.</span>
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300">
            Eso es todo el"secreto". El nicho ya lo elegiste con datos, el guion ya lo escribió
            la IA, la miniatura ya la subiste. El algoritmo responde a constancia, no a inspiración.
          </p>
        </div>
      </main>
    </AppShell>
  );
}
