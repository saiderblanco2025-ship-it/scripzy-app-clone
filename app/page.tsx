import Link from "next/link";
import {
  FileText,
  ImageIcon,
  Compass,
  Vault,
  LayoutDashboard,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Zap,
  ShieldCheck,
  Brain,
} from "lucide-react";
import { UserMenu } from "@/components/user-menu";

const features = [
  {
    icon: Brain,
    title: "IA que escribe como humano",
    description:
      "Motor de guiones con gancho en los primeros 5 segundos, estructura de retención por secciones, clímax y CTA adaptado a tu nicho.",
  },
  {
    icon: FileText,
    title: "Script Lab",
    description:
      "Pipeline de 4 fases con cues [B-Roll] y [SFX] listos para producción. Guiones largos sin perder el ritmo.",
  },
  {
    icon: ImageIcon,
    title: "Thumbnail Studio",
    description:
      "Miniaturas 16:9 generadas con IA y guardadas automáticamente en tu biblioteca. Lista para subir a YouTube.",
  },
  {
    icon: Compass,
    title: "Niche Finder",
    description:
      "Descubre nichos rentables con RPM estimado, nivel de dificultad y etiqueta Faceless Friendly.",
  },
  {
    icon: Vault,
    title: "Presets Vault",
    description:
      "Guarda tu tono, audiencia, ritmo y palabras prohibidas. Cada guion sale con tu estilo, no con el de todos.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard de creador",
    description:
      "Tu saldo, tu plan y tu producción en un solo panel. Control total de créditos en tiempo real.",
  },
];

const steps = [
  {
    number: "01",
    title: "Describe tu tema",
    description:
      "Escribe el tema, el idioma y el tono. O elige uno de tus presets guardados con un clic.",
  },
  {
    number: "02",
    title: "La IA genera el guion",
    description:
      "Gancho viral, desarrollo por secciones, cues visuales y CTA. En menos de 60 segundos.",
  },
  {
    number: "03",
    title: "Publica y crece",
    description:
      "Copias el guion, descargas la miniatura y subes el video. Repite y escala tu canal.",
  },
];

const testimonials = [
  {
    quote:
      "Pasé de escribir 1 guion por semana a 10. El gancho que genera la IA mantiene a la gente mirando hasta el final.",
    name: "Carlos M.",
    role: "Canal de finanzas · 84K suscriptores",
  },
  {
    quote:
      "El Niche Finder me encontró un nicho con RPM de $18 que no conocía. En 3 meses llegué a monetización.",
    name: "Laura P.",
    role: "Canal faceless · historias",
  },
  {
    quote:
      "Los presets son oro. Configuré mi tono una vez y todos los guiones salen con la misma voz de mi canal.",
    name: "Andrés R.",
    role: "Agencia de contenido",
  },
];

const problems = [
  {
    problem: "¿No sabes qué nicho elegir?",
    pain: "Pasas semanas probando ideas sin saber si tienen potencial real de monetización.",
    solution: "Explora nichos con datos reales",
    win: "Métricas de RPM, demanda, competencia e indicador faceless automáticos, con videos reales de YouTube.",
  },
  {
    problem: "¿Pierdes horas investigando?",
    pain: "Analizas manualmente canales, títulos y miniaturas sin datos concretos de qué funciona.",
    solution: "Top Patterns en un clic",
    win: "Analiza los videos más virales de tu tema y extrae la fórmula exacta: patrones, estructura y ángulos.",
  },
  {
    problem: "¿Tu guion no retiene?",
    pain: "El guion se siente plano, la gente se va en el primer minuto y el video no despega.",
    solution: "Guiones largos con gancho",
    win: "El Script Lab genera guiones con gancho probado, estructura por secciones, SEO y tags listos para publicar.",
  },
];

const comparisons = [
  { label: "Guiones largos con estructura", scripzy: "✓ 4 fases + gancho", others: "≈ Texto plano", manual: "✗ Horas" },
  { label: "Nichos con datos reales de YouTube", scripzy: "✓ Incluido", others: "✗", manual: "✗" },
  { label: "Miniaturas generadas con IA", scripzy: "✓ Incluido", others: "✗", manual: "✗" },
  { label: "Análisis de patrones virales", scripzy: "✓ Incluido", others: "✗", manual: "≈ Días" },
  { label: "Títulos y tags SEO automáticos", scripzy: "✓ Incluido", others: "≈ Parcial", manual: "✗" },
  { label: "Historial y presets propios", scripzy: "✓ Incluido", others: "✗", manual: "✗" },
  { label: "Costo mensual total", scripzy: "desde $0", others: "$20+", manual: "$62+" },
];

const faqs = [
  {
    q: "¿Puedo probar gratis?",
    a: "Sí. El plan Free incluye 50,000 caracteres de guion y 2 miniaturas sin tarjeta. Solo crea tu cuenta y empieza a generar.",
  },
  {
    q: "¿Los guiones son originales o plantillas repetidas?",
    a: "Cada guion se genera en el momento según tu tema, tono, audiencia y palabras prohibidas. No hay dos guiones iguales, aunque uses el mismo tema.",
  },
  {
    q: "¿Funciona para canales faceless?",
    a: "Es el caso de uso principal: nichos sin rostro con voz en off, cues [B-Roll] y [SFX] incluidos en cada guion.",
  },
  {
    q: "¿Puedo cancelar cuando quiera?",
    a: "Sí. Las suscripciones se cancelan desde tu panel de pago y mantienes tu saldo hasta el fin del periodo.",
  },
  {
    q: "¿En qué idiomas genera los guiones?",
    a: "Español, inglés y más. Eliges el idioma en cada generación y la estructura retencional se adapta.",
  },
];

const stats = [
  { value: "+12,000", label: "guiones generados" },
  { value: "1,900+", label: "creadores activos" },
  { value: "23", label: "países" },
  { value: "60s", label: "por guion completo" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-950 via-blue-950 to-indigo-950 text-white">
      {/* ===== Barra de navegación ===== */}
      <nav className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-600 text-sm font-bold text-white">
                S
              </span>
              Scripzy
            </Link>
            <div className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
              <a href="#features" className="hover:text-white">
                Características
              </a>
              <a href="#como-funciona" className="hover:text-white">
                Cómo funciona
              </a>
              <a href="#testimonios" className="hover:text-white">
                Testimonios
              </a>
              <Link href="/pricing" className="hover:text-white">
                Precios
              </Link>
            </div>
          </div>
          <UserMenu />
        </div>
      </nav>

      {/* ===== Hero con video de fondo ===== */}
      <header className="relative overflow-hidden px-4 pb-24 pt-20 text-center">
        {/* Video de fondo (estilo Scripzy original) */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/hero-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        {/* Capa oscura para que el texto se lea siempre */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/70 to-indigo-950/95" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[600px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-500/10 px-4 py-1 text-xs font-medium uppercase tracking-wider text-violet-300">
            <Zap className="h-3 w-3" />
            Tu Guionista de YouTube 24/7 · AI Powered
          </span>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Guiones que retienen.{" "}
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Canales que crecen.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-300">
            Scripzy es el cerebro de tu canal faceless: guiones largos con IA,
            miniaturas automáticas y research de nichos. Tu próximo video está a
            60 segundos de existir.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/script-lab"
              className="group inline-flex items-center gap-2 rounded-md bg-violet-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition-colors hover:bg-violet-700"
            >
              Crear mi primer guion gratis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/pricing"
              className="rounded-md border border-slate-600 px-7 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800"
            >
              Ver planes
            </Link>
          </div>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Plan gratis sin tarjeta · Cancela cuando quieras
          </p>

          {/* Cifras */}
          <div className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white sm:text-3xl">
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ===== Características ===== */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
            Módulos del sistema
          </span>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            Todo lo que tu canal necesita
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Deja de saltar entre 5 herramientas. Scripzy centraliza la
            producción completa de tu canal.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-slate-700/60 bg-slate-900/50 p-6 backdrop-blur-sm transition-colors hover:border-violet-500/50"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/20">
                <f.icon className="h-5 w-5 text-violet-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-slate-300">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Cómo funciona ===== */}
      <section
        id="como-funciona"
        className="border-y border-white/10 bg-slate-950/50 px-4 py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
              Cómo funciona
            </span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              De idea a guion en 3 pasos
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.number} className="relative rounded-xl bg-slate-900/60 p-7">
                <span className="text-4xl font-bold text-violet-500/40">
                  {s.number}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Testimonios ===== */}
      <section id="testimonios" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
            Testimonios
          </span>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            Creadores que ya escalan
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-6"
            >
              <div className="mb-3 flex gap-1 text-amber-400">
                {"★★★★★".split("").map((star, i) => (
                  <span key={i}>{star}</span>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-slate-200">
                “{t.quote}”
              </p>
              <div className="mt-4">
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-slate-400">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ¿Te suena familiar? ===== */}
      <section className="border-t border-white/10 bg-slate-950/50 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
              ¿Te suena familiar?
            </span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              El problema que todos enfrentan
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-400">
              Crear contenido exitoso en YouTube no debería ser un juego de
              adivinanzas.
            </p>
          </div>
          <div className="space-y-4">
            {problems.map((p) => (
              <div
                key={p.problem}
                className="grid grid-cols-1 gap-4 rounded-xl border border-slate-700/60 bg-slate-900/50 p-6 md:grid-cols-2"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 rounded-lg bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-400">
                    ✗
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">{p.problem}</h3>
                    <p className="mt-1 text-sm text-slate-400">{p.pain}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 border-slate-700/60 md:border-l md:pl-6">
                  <span className="mt-0.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">
                    ✓
                  </span>
                  <div>
                    <h3 className="font-semibold text-emerald-300">
                      {p.solution}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">{p.win}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Comparativa ===== */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
              La diferencia es clara
            </span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              Scripzy vs. el resto del mundo
            </h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-900/50">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-700/60 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4">Capacidad</th>
                  <th className="px-5 py-4 text-center text-violet-300">
                    Scripzy
                  </th>
                  <th className="px-5 py-4 text-center">Otras IAs</th>
                  <th className="px-5 py-4 text-center">A mano</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((c) => (
                  <tr
                    key={c.label}
                    className="border-b border-slate-800/60 last:border-0"
                  >
                    <td className="px-5 py-4 font-medium text-slate-200">
                      {c.label}
                    </td>
                    <td className="px-5 py-4 text-center font-semibold text-emerald-400">
                      {c.scripzy}
                    </td>
                    <td className="px-5 py-4 text-center text-slate-500">
                      {c.others}
                    </td>
                    <td className="px-5 py-4 text-center text-slate-500">
                      {c.manual}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Ahorro */}
          <div className="mt-10 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900/70 to-slate-950/70 p-8 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Ahorra dinero
            </span>
            <h3 className="mt-2 text-2xl font-bold">
              Comprarlo por separado cuesta más de <span className="text-amber-400">$62/mes</span>
            </h3>
            <div className="mx-auto mt-6 grid max-w-2xl grid-cols-1 gap-3 text-sm sm:grid-cols-4">
              <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-4">
                <p className="text-slate-400">Guiones con IA</p>
                <p className="mt-1 font-bold text-slate-500 line-through">$20/mes</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-4">
                <p className="text-slate-400">Miniaturas con IA</p>
                <p className="mt-1 font-bold text-slate-500 line-through">$15/mes</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-4">
                <p className="text-slate-400">Buscador de nichos</p>
                <p className="mt-1 font-bold text-slate-500 line-through">$27/mes</p>
              </div>
              <div className="rounded-lg border-2 border-violet-500 bg-violet-950/40 p-4">
                <p className="font-semibold text-violet-300">Scripzy Pro</p>
                <p className="mt-1 text-lg font-bold text-white">$19/mes</p>
                <p className="mt-1 text-xs text-emerald-400">todo incluido 🎉</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Teaser de precios ===== */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/70 via-slate-900/70 to-indigo-950/70 p-10 text-center">
          <h2 className="text-3xl font-bold">Planes para cada etapa</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Empieza gratis y sube de plan cuando tu canal pida más. Sin
            contratos, sin sorpresas.
          </p>
          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-5">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Free
              </p>
              <p className="mt-1 text-3xl font-bold">$0</p>
              <p className="mt-2 text-xs text-slate-400">
                50,000 caracteres · 2 miniaturas
              </p>
            </div>
            <div className="relative rounded-lg border-2 border-violet-500 bg-violet-950/40 p-5">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Popular
              </span>
              <p className="text-sm font-semibold uppercase tracking-wider text-violet-300">
                Pro
              </p>
              <p className="mt-1 text-3xl font-bold">$19</p>
              <p className="mt-2 text-xs text-slate-400">
                400,000 caracteres · Niche Finder
              </p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-5">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Premium
              </p>
              <p className="mt-1 text-3xl font-bold">$49</p>
              <p className="mt-2 text-xs text-slate-400">
                1,000,000 caracteres · 40 miniaturas
              </p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="mt-8 inline-block rounded-md bg-violet-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition-colors hover:bg-violet-700"
          >
            Comparar los 5 planes
          </Link>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="border-t border-white/10 bg-slate-950/50 px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-3xl font-bold sm:text-4xl">
            Preguntas frecuentes
          </h2>
          <div className="flex flex-col gap-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-lg border border-slate-700/60 bg-slate-900/50 px-5 py-4"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-white">
                  {f.q}
                  <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA final ===== */}
      <section className="border-t border-white/10 px-4 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <Sparkles className="mx-auto mb-4 h-8 w-8 text-violet-400" />
          <h2 className="text-3xl font-bold sm:text-4xl">
            Tu próximo video viral empieza hoy
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-slate-300">
            Crea tu cuenta gratis y genera tu primer guion en menos de un
            minuto. Sin tarjeta, sin compromiso.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block rounded-md bg-amber-500 px-9 py-3.5 text-sm font-bold text-violet-950 shadow-lg shadow-amber-500/20 transition-colors hover:bg-amber-400"
          >
            Empezar gratis ahora
          </Link>
          <div className="mt-6 flex items-center justify-center gap-5 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              50,000 caracteres gratis
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Google o email
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Sin tarjeta
            </span>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 text-xs text-slate-500">
          <span className="font-semibold text-slate-400">Scripzy</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-slate-300">
              Precios
            </Link>
            <Link href="/script-lab" className="hover:text-slate-300">
              Script Lab
            </Link>
            <Link href="/dashboard" className="hover:text-slate-300">
              Dashboard
            </Link>
            <Link href="/recursos" className="hover:text-slate-300">
              Recursos
            </Link>
            <Link href="/terminos" className="hover:text-slate-300">
              Términos
            </Link>
            <Link href="/privacidad" className="hover:text-slate-300">
              Privacidad
            </Link>
          </div>
          <span>Scripzy.app — Clone build · Next.js · Supabase · Stripe · IA</span>
        </div>
      </footer>
    </div>
  );
}
