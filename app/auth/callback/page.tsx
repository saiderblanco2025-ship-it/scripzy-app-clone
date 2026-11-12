"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

/**
 * Callback de OAuth:
 * - PKCE: intercambia ?code= por sesión
 * - Implicit: el cliente detecta el #access_token automáticamente
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Completando inicio de sesión...");

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      // PKCE: intercambiar code si viene por query (?code=...)
      const search = new URLSearchParams(window.location.search);
      const code = search.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          if (!cancelled) setStatus(`Error: ${error.message}`);
          return;
        }
      }

      // Esperar hasta ~6s a que la sesión esté disponible
      for (let i = 0; i < 12; i++) {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          router.replace("/script-lab");
          return;
        }
        await new Promise((r) => setTimeout(r, 500));
      }

      if (!cancelled) {
        setStatus("No se detectó sesión. Vuelve a intentar el login.");
      }
    }

    finish();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-violet-500" />
        <p className="text-sm text-slate-400">{status}</p>
      </div>
    </div>
  );
}