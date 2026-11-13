"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  LifeBuoy,
  GraduationCap,
  Sparkles,
  Compass,
  ImageIcon,
  LayoutDashboard,
  Crown,
  Mail,
  ChevronDown,
} from "lucide-react";
import { useUser } from "@/lib/supabase";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/componentsui/ui/button";

const TUTORIAL_STEPS = [
  {
    icon: Sparkles,
    title: "1. Crea tu primer guion en Script Lab",
    body: "Elige tema, idioma, duración y tono. El motor IA (con tu cerebro de estilo) escribe un guion largo con gancho, CTA, tomas visuales y SEO. Se guarda solo en tu historial.",
    link: { href: "/script-lab", label: "Ir a Script Lab" },
  },
  {
    icon: Compass,
    title: "2. Encuentra nichos rentables",
    body: "Escribe un tema y el Buscador de Nichos consulta YouTube real: te muestra videos con RPM estimado, demanda, competencia y si son Faceless Friendly.",
    link: { href: "/nichos", label: "Buscar nichos" },
  },
  {
    icon: ImageIcon,
    title: "3. Genera tu miniatura 16:9",
    body: "Describe tu video, añade un texto para la miniatura y elige el estilo. La IA crea una miniatura de alto CTR y la guarda en tu historial. Cuesta 1 crédito.",
    link: { href: "/miniaturas", label: "Crear miniatura" },
  },
  {
    icon: LayoutDashboard,
    title: "4. Controla todo desde el Dashboard",
    body: "Tu plan, fecha de renovación, créditos restantes, guiones escritos y tus últimos guiones siempre a la vista.",
    link: { href: "/dashboard", label: "Abrir Dashboard" },
  },
];

const RECURSOS = [
  {
    icon: Sparkles,
    title: "Anatomía de un guion que retiene",
    body: "Gancho en los primeros 15 segundos, promesa clara, bloques de 2-3 minutos con mini-cliffhangers, y CTA al final. Nuestro motor ya aplica esta estructura — úsala como checklist al editar.",
  },
  {
    icon: Compass,
    title: "Cómo leer las métricas de nicho",
    body: "RPM = ingresos por 1,000 views (finanzas/IA pagan más que entretenimiento). Demanda Alta = el video crece rápido. Competencia Baja + Faceless Friendly = oportunidad perfecta para canales sin rostro.",
  },
  {
    icon: ImageIcon,
    title: "Fórmulas de miniaturas con CTR alto",
    body: "1 sujeto + 1 emoción + 3-4 palabras de texto + colores contrastantes. Menos elementos = más clics. El estilo Viral sigue esta fórmula automáticamente.",
  },
  {
    icon: Crown,
    title: "Créditos y planes explicados",
    body: "Los guiones consumen créditos de caracteres (por longitud del guion). Las miniaturas consumen 1 crédito por imagen. Cada plan recarga créditos al renovarse.",
    link: { href: "/pricing", label: "Ver planes" },
  },
];

const FAQS = [
  {
    q: "¿Cuánto tarda un guion?",
    a: "Entre 1 y 3 minutos. El motor consulta tu memoria de estilo (cerebro) antes de escribir para que cada guion suene cada vez más a ti. No cierres la página mientras genera.",
  },
  {
    q: "¿Se guardan mis guiones y miniaturas?",
    a: "Sí. Cada guion se guarda automáticamente en tu historial de Script Lab y cada miniatura en el historial del Generador. También aparecen en tu Dashboard.",
  },
  {
    q: "¿Qué pasa si se me acaban los créditos?",
    a: "Puedes mejorar de plan en cualquier momento desde la página de Planes. Los créditos se recargan en cada renovación mensual.",
  },
  {
    q: "¿Puedo usar los guiones y miniaturas comercialmente?",
    a: "Sí. Todo lo que generes con tu cuenta es tuyo y puedes publicarlo en tu canal sin restricciones.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-white"
      >
        {q}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <p className="border-t border-slate-800 px-4 py-3 text-sm text-slate-400">
          {a}
        </p>
      )}
    </div>
  );
}

export default function RecursosPage() {
  const { user, loading: authLoading } = useUser();

  useEffect(() => {
    // La página es pública-ish, pero mostramos el shell igual; no forzamos login.
    void authLoading;
    void user;
  }, [authLoading, user]);

  return (
    <AppShell active="recursos">
      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Encabezado */}
        <div className="mb-10">
          <h1 className="flex items-center gap-3 text-3xl font-bold">
            <BookOpen className="h-7 w-7 text-violet-400" />
            Recursos
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Aprende a exprimir Scripzy: tutorial paso a paso, guías de
            crecimiento y soporte cuando lo necesites.
          </p>
          <a
            href="/empezando"
            className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-500/40 bg-gradient-to-r from-violet-950/60 to-fuchsia-950/40 px-5 py-4 transition-colors hover:border-violet-500"
          >
            <span>
              <span className="block text-sm font-bold text-white">
                🗺️ De cero a tu primer video en 8 pasos
              </span>
              <span className="mt-0.5 block text-xs text-slate-400">
                La secuencia exacta + checklist interactivo de 4 fases
              </span>
            </span>
            <span className="rounded-md bg-violet-600 px-4 py-2 text-xs font-semibold text-white">
              Ver el mapa →
            </span>
          </a>
        </div>

        {/* Tutorial */}
        <section className="mb-12">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold">
            <GraduationCap className="h-5 w-5 text-emerald-400" />
            Tutorial: empieza aquí
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {TUTORIAL_STEPS.map((step) => (
              <div
                key={step.title}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"
              >
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <step.icon className="h-4 w-4 text-violet-400" />
                  {step.title}
                </h3>
                <p className="mt-2 text-xs text-slate-400">{step.body}</p>
                {step.link && (
                  <Link
                    href={step.link.href}
                    className="mt-3 inline-block text-xs font-semibold text-violet-400 hover:text-violet-300"
                  >
                    {step.link.label} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Recursos */}
        <section className="mb-12">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold">
            <BookOpen className="h-5 w-5 text-amber-400" />
            Guías de crecimiento
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {RECURSOS.map((r) => (
              <div
                key={r.title}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"
              >
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <r.icon className="h-4 w-4 text-amber-400" />
                  {r.title}
                </h3>
                <p className="mt-2 text-xs text-slate-400">{r.body}</p>
                {r.link && (
                  <Link
                    href={r.link.href}
                    className="mt-3 inline-block text-xs font-semibold text-amber-400 hover:text-amber-300"
                  >
                    {r.link.label} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="mb-5 text-lg font-bold">Preguntas frecuentes</h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </section>

        {/* Soporte */}
        <section className="rounded-xl border border-violet-500/40 bg-violet-950/30 p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <LifeBuoy className="h-5 w-5 text-violet-400" />
            Soporte
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            ¿Algo no funciona o quieres sugerir una mejora? Escríbenos y te
            respondemos lo antes posible.
          </p>
          <a
            href="mailto:saiderblanco2025@gmail.com?subject=Scripzy%20Soporte"
            className="mt-4 inline-block"
          >
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Mail className="mr-2 h-4 w-4" />
              Escribir a soporte
            </Button>
          </a>
        </section>
      </main>
    </AppShell>
  );
}
