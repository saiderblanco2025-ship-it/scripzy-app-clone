"use client";

import { supabase, useUser } from "@/lib/supabase";
import { Button } from "@/componentsui/ui/button";

/**
 * Menú de usuario: muestra email + cerrar sesión,
 * o el botón de iniciar sesión si no hay sesión.
 */
export function UserMenu() {
  const { user, loading } = useUser();

  if (loading) {
    return <span className="text-xs text-slate-500">…</span>;
  }

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => (window.location.href = "/login")}
      >
        Iniciar sesión
      </Button>
    );
  }

  const email = user.email ?? "usuario";

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-slate-300 sm:inline">{email}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/";
        }}
      >
        Salir
      </Button>
    </div>
  );
}