"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { supabase, signInWithGoogle, signInWithPassword, signUpWithPassword, useUser } from "@/lib/supabase";
import { Button } from "@/componentsui/ui/button";
import { Input } from "@/componentsui/ui/input";
import { Alert, AlertDescription } from "@/componentsui/ui/alert";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.25-4.53 6.16-4.53z"
      />
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09L2.18 7.07C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.86-3c-1.02.68-2.34 1.09-3.42 1.09-2.9 0-5.29-1.93-6.16-4.53l-3.66 2.84C3.99 20.53 7.7 23 12 23z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Si ya hay sesión, mandar al Script Lab
  useEffect(() => {
    if (!authLoading && user) router.replace("/script-lab");
  }, [authLoading, user, router]);

  async function handleGoogle() {
    setError(null);
    setNotice(null);
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await signInWithPassword(email, password);
        if (error) {
          setError(error.message);
          return;
        }
        router.replace("/script-lab");
      } else {
        const { error, data } = await signUpWithPassword(email, password, fullName);
        if (error) {
          setError(error.message);
          return;
        }
        if (data.session) {
          // Sin confirmación de email activada → sesión inmediata
          router.replace("/script-lab");
        } else {
          setNotice(
            "Cuenta creada. Revisa tu correo para confirmar (si la confirmación está activada en Supabase)."
          );
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-950 via-blue-950 to-indigo-950 p-4 text-slate-100">
      <div className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900/70 p-8 shadow-xl backdrop-blur-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-violet-600 text-lg font-bold text-white">
            S
          </div>
          <h1 className="text-xl font-bold">Scripzy.app</h1>
          <p className="mt-1 text-sm text-slate-400">
            {mode === "signin" ? "Entra a tu estudio de guiones" : "Crea tu cuenta gratis"}
          </p>
        </div>

        {/* Google */}
        <Button
          type="button"
          variant="outline"
          className="w-full bg-white text-slate-900 hover:bg-slate-200"
          onClick={handleGoogle}
          disabled={loading}
        >
          <GoogleIcon />
          Continuar con Google
        </Button>

        {/* Divisor */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-700" />
          <span className="text-xs text-slate-500">o con tu email</span>
          <div className="h-px flex-1 bg-slate-700" />
        </div>

        {/* Email / Password */}
        <form onSubmit={handleEmail} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="mb-1 block text-sm text-slate-300">Nombre</label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre"
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm text-slate-300">Email</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Contraseña</label>
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {notice && (
            <Alert variant="success">
              <AlertDescription>{notice}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : mode === "signin" ? (
              <>
                <Mail className="h-4 w-4" />
                Iniciar sesión
              </>
            ) : (
              "Crear cuenta"
            )}
          </Button>
        </form>

        {/* Toggle modo */}
        <p className="mt-6 text-center text-sm text-slate-400">
          {mode === "signin" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setNotice(null);
            }}
            className="font-medium text-violet-400 hover:text-violet-300"
          >
            {mode === "signin" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>

        <p className="mt-4 text-center">
          <a href="/" className="text-xs text-slate-500 hover:text-slate-300">
            ← Volver al inicio
          </a>
        </p>
      </div>
    </div>
  );
}