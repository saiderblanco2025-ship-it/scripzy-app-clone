import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950 px-4 text-center text-slate-100">
      <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-600 text-2xl font-bold text-white">
        S
      </span>
      <h1 className="mt-6 text-5xl font-bold">404</h1>
      <p className="mt-3 max-w-md text-slate-400">
        Esta página no existe — como un guion sin gancho, nadie se queda
        aquí. 🎬
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-md bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
        >
          Volver al inicio
        </Link>
        <Link
          href="/dashboard"
          className="rounded-md border border-slate-600 px-6 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800"
        >
          Ir a mi Dashboard
        </Link>
      </div>
    </div>
  );
}
