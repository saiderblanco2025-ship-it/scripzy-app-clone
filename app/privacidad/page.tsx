import Link from "next/link";

export const metadata = { title: "Privacidad" };

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950 px-4 py-16 text-slate-100">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-violet-400 hover:text-violet-300">
          ← Volver a Scripzy
        </Link>
        <h1 className="mt-6 text-3xl font-bold">Política de Privacidad</h1>
        <p className="mt-2 text-xs text-slate-500">Última actualización: noviembre 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-300">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">1. Datos que guardamos</h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong>Cuenta:</strong> tu correo electrónico y nombre (por
                Google o registro con correo).
              </li>
              <li>
                <strong>Tu contenido:</strong> los guiones que generas y las
                miniaturas que creas, para que estén en tu historial.
              </li>
              <li>
                <strong>Uso:</strong> créditos consumidos y planes activos, para
                gestionar tu suscripción.
              </li>
            </ul>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">2. Con quién compartimos tus datos</h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong>Supabase:</strong> almacena tu cuenta, guiones y
                miniaturas de forma segura.
              </li>
              <li>
                <strong>Stripe:</strong> procesa los pagos de las
                suscripciones. Scripzy nunca ve ni guarda el número de tu
                tarjeta.
              </li>
              <li>
                <strong>Motores de IA (OpenAI vía n8n):</strong> reciben el
                tema/título de tu solicitud para generar el contenido. No se
                envían tus datos personales de facturación.
              </li>
              <li>
                <strong>YouTube Data API:</strong> usamos tu acceso para leer
                datos públicos (estadísticas de videos y canales). No
                publicamos nada en tu nombre.
              </li>
            </ul>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">3. Tus derechos</h2>
            <p>
              Puedes solicitar en cualquier momento la eliminación de tu cuenta
              y de todo tu contenido escribiendo a{" "}
              <a
                href="mailto:saiderblanco2025@gmail.com"
                className="text-violet-400 hover:text-violet-300"
              >
                saiderblanco2025@gmail.com
              </a>
              . Tu contenido solo es visible para ti (protegido con políticas de
              seguridad a nivel de fila).
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">4. Cookies</h2>
            <p>
              Usamos almacenamiento local del navegador únicamente para mantener
              tu sesión iniciada. No usamos cookies publicitarias ni de
              rastreo de terceros.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
