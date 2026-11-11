import Link from "next/link";
import {
  FileText,
  ImageIcon,
  Compass,
  Vault,
  LayoutDashboard,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Script Lab",
    description:
      "Pipeline encadenado de 4 fases que genera guiones largos con gancho, secciones, clímax y CTA, con cues [B-Roll] y [SFX] incluidos.",
  },
  {
    icon: ImageIcon,
    title: "Thumbnail Studio",
    description:
      "Genera miniaturas en 16:9 con modelos de IA y guárdalas automáticamente en tu bucket de Supabase Storage.",
  },
  {
    icon: Compass,
    title: "Niche Finder",
    description:
      "Descubre nichos rentables con RPM estimado ($2 a $35+), dificultad y etiqueta Faceless Friendly.",
  },
  {
    icon: Vault,
    title: "Presets Vault",
    description:
      "Guarda tu tono, audiencia, ritmo y palabras prohibidas para reutilizarlos en cada guion.",
  },
  {
    icon: LayoutDashboard,
    title: "Créditos en vivo",
    description:
      "Control de créditos de caracteres y miniaturas con actualización en tiempo real.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-950 via-blue-950 to-indigo-950 text-white">
      {/* Hero */}
      <header className="px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="mb-4 inline-block rounded-full border border-violet-400/40 bg-violet-500/10 px-4 py-1 text-xs font-medium uppercase tracking-wider text-violet-300">
            AI YouTube Creator CRM
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Desata tu potencial en YouTube
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-300">
            Crea canales faceless con guiones largos generados por IA, miniaturas
            automáticas y research de nichos con datos reales.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/script-lab"
              className="rounded-md bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-violet-700"
            >
              Crear mi primer guion
            </Link>
            <Link
              href="/script-lab"
              className="rounded-md border border-slate-600 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800"
            >
              Ver planes
            </Link>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <h2 className="mb-10 text-center text-3xl font-bold">Módulos del sistema</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-slate-700 bg-slate-900/50 p-6 backdrop-blur-sm"
            >
              <feature.icon className="mb-4 h-8 w-8 text-violet-400" />
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-800 bg-slate-950/60 px-4 py-16 text-center">
        <h2 className="text-3xl font-bold">¿Listo para crecer tu canal?</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-300">
          Únete a los creadores que automatizan su producción con Scripzy.
        </p>
        <Link
          href="/script-lab"
          className="mt-8 inline-block rounded-md bg-amber-500 px-8 py-3 text-sm font-semibold text-violet-950 transition-colors hover:bg-amber-600"
        >
          Empezar gratis
        </Link>
      </section>

      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        Scripzy.app — Clone build · Next.js · Supabase · Stripe · IA
      </footer>
    </div>
  );
}