import Link from "next/link";

export const metadata = { title: "Términos de Servicio" };

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950 px-4 py-16 text-slate-100">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-violet-400 hover:text-violet-300">
          ← Volver a Scripzy
        </Link>
        <h1 className="mt-6 text-3xl font-bold">Términos de Servicio</h1>
        <p className="mt-2 text-xs text-slate-500">Última actualización: noviembre 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-300">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">1. Qué es Scripzy</h2>
            <p>
              Scripzy es una plataforma de creación de contenido para YouTube que
              ofrece generación de guiones con inteligencia artificial,
              generación de miniaturas, búsqueda de nichos con datos reales de
              YouTube y análisis de patrones virales.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">2. Tu cuenta</h2>
            <p>
              Para usar Scripzy necesitas una cuenta. Eres responsable de
              mantener la seguridad de tu acceso. Cada cuenta recibe créditos
              según su plan; los créditos se consumen al usar las funciones de
              generación y se recargan con cada renovación del plan.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">3. Uso aceptable</h2>
            <p>
              Puedes usar todo el contenido generado (guiones, miniaturas,
              investigaciones) comercialmente en tus canales. No está permitido:
              revender el acceso a la plataforma, intentar saturar los motores
              de IA, ni usar el servicio para actividades ilícitas o contenido
              que viole las políticas de YouTube.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">4. Pagos y suscripciones</h2>
            <p>
              Los planes se cobran mensualmente a través de Stripe. Puedes
              cancelar en cualquier momento; mantendrás el acceso hasta el fin
              del período ya pagado. Los créditos no comprados no se acumulan
              entre períodos salvo indicación distinta.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">5. Contenido generado con IA</h2>
            <p>
              El contenido generado por IA puede contener imprecisiones. Te
              corresponde revisarlo antes de publicarlo. Scripzy no garantiza
              resultados de monetización, vistas ni cumplimiento de políticas de
              YouTube derivados del uso del contenido.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">6. Disponibilidad del servicio</h2>
            <p>
              Buscamos mantener los motores disponibles 24/7, pero dependemos de
              servicios de terceros (IA, YouTube API, infraestructura en la
              nube). Los tiempos de generación típicos son de 1 a 3 minutos para
              guiones y hasta 2 minutos para miniaturas.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">7. Contacto</h2>
            <p>
              Dudas sobre estos términos:{" "}
              <a
                href="mailto:saiderblanco2025@gmail.com"
                className="text-violet-400 hover:text-violet-300"
              >
                saiderblanco2025@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
