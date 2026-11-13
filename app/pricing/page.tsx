"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Check, AlertCircle, PartyPopper } from "lucide-react";
import { Button } from "@/componentsui/ui/button";
import { Alert, AlertDescription } from "@/componentsui/ui/alert";
import { supabase, useUser, getUserBalance } from "@/lib/supabase";
import { PLANS, type PlanTier } from "@/lib/stripe-plans";
import { UserMenu } from "@/components/user-menu";

const TOPUPS = [
  { name: "500K caracteres", price: "8.99", detail: "~14 guiones largos extra · pago único" },
  { name: "1M caracteres", price: "14.99", detail: "~28 guiones largos extra · pago único" },
  { name: "50 miniaturas", price: "4.99", detail: "50 miniaturas IA extra · pago único" },
  { name: "200 miniaturas", price: "19.99", detail: "200 miniaturas IA extra · pago único" },
  { name: "500 miniaturas", price: "44.99", detail: "500 miniaturas IA extra · pago único" },
];

export default function PricingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();

  const [balance, setBalance] = useState<{
    chars: number;
    thumbs: number;
  } | null>(null);
  const [banner, setBanner] = useState<"success" | "canceled" | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<PlanTier | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Banner si volvemos de Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) setBanner("success");
    else if (params.get("canceled")) setBanner("canceled");
  }, []);

  // Balance actual
  useEffect(() => {
    if (!user) return;
    getUserBalance().then((b) => {
      if (b) {
        setBalance({
          chars: b.script_character_credits,
          thumbs: b.thumbnail_credits,
        });
      }
    });
  }, [user, banner]);

  // Si no hay sesión, redirigir al login
  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  async function handleCheckout(tier: PlanTier) {
    if (!user || checkoutLoading) return;
    setCheckoutLoading(tier);
    setCheckoutError(null);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Sesión expirada. Vuelve a iniciar sesión.");

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: tier }),
      });

      const data2 = await res.json();
      if (!res.ok || !data2?.url) {
        throw new Error(data2?.error || "Error iniciando el pago");
      }

      window.location.href = data2.url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Error inesperado");
      setCheckoutLoading(null);
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-950 via-blue-950 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">💎 Planes</h1>
          <div className="flex items-center gap-4">
            <a
              href="/script-lab"
              className="text-sm text-slate-400 transition-colors hover:text-slate-200"
            >
              ← Script Lab
            </a>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">Elige tu plan</h2>
          <p className="mt-2 text-slate-400">
            Créditos mensuales de guion y miniaturas. Cancela cuando quieras.
          </p>
          {balance && (
            <p className="mt-3 inline-block rounded-full bg-slate-800/80 px-4 py-1.5 text-sm text-slate-300">
              Tu saldo actual:{" "}
              <span className="text-violet-300">
                {balance.chars.toLocaleString()} caracteres
              </span>{" "}
              · <span className="text-amber-300">{balance.thumbs} miniaturas</span>
            </p>
          )}
        </div>

        {banner === "success" && (
          <Alert variant="success" className="mx-auto mb-8 max-w-xl">
            <AlertDescription className="flex items-center gap-2">
              <PartyPopper className="h-4 w-4" />
              ¡Pago completado! Tus nuevos créditos llegarán en unos segundos
              (recibirás un email de Stripe con el recibo).
            </AlertDescription>
          </Alert>
        )}

        {banner === "canceled" && (
          <Alert variant="default" className="mx-auto mb-8 max-w-xl">
            <AlertDescription>
              Pago cancelado. No se te cobró nada — puedes intentarlo cuando
              quieras.
            </AlertDescription>
          </Alert>
        )}

        {checkoutError && (
          <Alert variant="destructive" className="mx-auto mb-8 max-w-xl">
            <AlertDescription className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {checkoutError}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {PLANS.map((plan) => {
            const isFree = plan.tier === "free";
            const loading = checkoutLoading === plan.tier;

            return (
              <div
                key={plan.tier}
                className={`relative flex flex-col rounded-lg border p-6 ${
                  plan.popular
                    ? "border-violet-500 bg-slate-900/80 shadow-lg shadow-violet-500/10"
                    : "border-slate-700 bg-slate-900/60"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-0.5 text-xs font-semibold text-white">
                    Más popular
                  </span>
                )}

                <h3 className="text-lg font-bold">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    ${plan.priceUSD}
                  </span>
                  <span className="text-sm text-slate-400">/mes</span>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Perfecto para: {plan.audience}
                </p>

                <ul className="mt-6 flex-1 space-y-2.5 text-sm text-slate-300">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  {isFree ? (
                    <a
                      href="/script-lab"
                      className="block w-full rounded-md border border-slate-600 bg-transparent px-4 py-2.5 text-center text-sm font-medium text-slate-100 transition-colors hover:bg-slate-800"
                    >
                      Empezar gratis
                    </a>
                  ) : (
                    <Button
                      variant={plan.popular ? "default" : "secondary"}
                      className="w-full"
                      disabled={checkoutLoading !== null}
                      onClick={() => handleCheckout(plan.tier)}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Conectando con Stripe...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Elegir {plan.name}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== TOP-UPS (recargas de créditos) ===== */}
        <div className="mt-16">
          <div className="mb-8 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Recargas
            </span>
            <h3 className="mt-2 text-2xl font-bold">
              ¿Te quedaste sin créditos a mitad de mes?
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">
              Packs de recarga únicos (pago único, sin suscripción). Comprados
              una vez, no expiran.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {TOPUPS.map((t) => (
              <div
                key={t.name}
                className="relative flex flex-col rounded-lg border border-slate-700 bg-slate-900/60 p-5"
              >
                <span className="absolute -top-3 right-4 rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-950">
                  Próximamente
                </span>
                <p className="text-sm font-semibold text-slate-300">{t.name}</p>
                <p className="mt-1 text-2xl font-bold text-white">${t.price}</p>
                <p className="mt-1 text-xs text-slate-400">{t.detail}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-slate-500">
            Mientras llegan los packs, puedes subir de plan para recibir tus
            créditos mensuales de inmediato.
          </p>
        </div>

        <p className="mt-10 text-center text-xs text-slate-500">
          Pagos procesados de forma segura por Stripe · Modo de prueba: usa la
          tarjeta 4242 4242 4242 4242 con cualquier fecha futura y CVC
        </p>
      </main>
    </div>
  );
}
