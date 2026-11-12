// ============================================================
// CONFIGURACIÓN DE LOS 5 PLANES DE SUSCRIPCIÓN
// Los price_id se rellenan cuando se crean los precios en Stripe
// (o se pueden sobrescribir con las variables de entorno
//  STRIPE_PRICE_STARTER / PRO / PREMIUM / ULTRA).
// ============================================================

export type PlanTier = "free" | "starter" | "pro" | "premium" | "ultra";

export type PlanConfig = {
  tier: PlanTier;
  name: string;
  priceUSD: number;
  scriptChars: number;
  thumbnailCredits: number;
  maxPresets: number;
  features: string[];
  popular?: boolean;
  priceIdEnv?: "STRIPE_PRICE_STARTER" | "STRIPE_PRICE_PRO" | "STRIPE_PRICE_PREMIUM" | "STRIPE_PRICE_ULTRA";
};

/** IDs de precio de Stripe (creados en modo prueba 2026-11-12). */
export const PRICE_IDS: Record<Exclude<PlanTier, "free">, string | null> = {
  starter: "price_1UayzSFN2iTFJizI8910kt86",
  pro: "price_1UayzSFN2iTFJizIPqwe8Vja",
  premium: "price_1UayzTFN2iTFJizIG2mvg1kk",
  ultra: "price_1UayzTFN2iTFJizIWDZ1W8D1",
};

export const PLANS: PlanConfig[] = [
  {
    tier: "free",
    name: "Free",
    priceUSD: 0,
    scriptChars: 50000,
    thumbnailCredits: 2,
    maxPresets: 3,
    features: [
      "50,000 caracteres de guion",
      "2 miniaturas",
      "3 presets",
      "Script Lab con pipeline de 4 fases",
    ],
  },
  {
    tier: "starter",
    name: "Starter",
    priceUSD: 9,
    scriptChars: 150000,
    thumbnailCredits: 5,
    maxPresets: 5,
    priceIdEnv: "STRIPE_PRICE_STARTER",
    features: [
      "150,000 caracteres de guion",
      "5 miniaturas",
      "5 presets",
      "Historial completo de guiones",
    ],
  },
  {
    tier: "pro",
    name: "Pro",
    priceUSD: 19,
    scriptChars: 400000,
    thumbnailCredits: 15,
    maxPresets: 10,
    priceIdEnv: "STRIPE_PRICE_PRO",
    popular: true,
    features: [
      "400,000 caracteres de guion",
      "15 miniaturas",
      "10 presets",
      "Niche Finder completo",
    ],
  },
  {
    tier: "premium",
    name: "Premium",
    priceUSD: 49,
    scriptChars: 1000000,
    thumbnailCredits: 40,
    maxPresets: 25,
    priceIdEnv: "STRIPE_PRICE_PREMIUM",
    features: [
      "1,000,000 caracteres de guion",
      "40 miniaturas",
      "25 presets",
      "Pipeline con IA real (LLM)",
    ],
  },
  {
    tier: "ultra",
    name: "Ultra",
    priceUSD: 99,
    scriptChars: 3000000,
    thumbnailCredits: 100,
    maxPresets: 100,
    priceIdEnv: "STRIPE_PRICE_ULTRA",
    features: [
      "3,000,000 caracteres de guion",
      "100 miniaturas",
      "Presets ilimitados",
      "Soporte prioritario",
    ],
  },
];

export function getPlanConfig(tier: PlanTier): PlanConfig {
  const plan = PLANS.find((p) => p.tier === tier);
  if (!plan) throw new Error(`Plan desconocido: ${tier}`);
  return plan;
}

/** Devuelve el price_id de Stripe para un plan de pago (env tiene prioridad). */
export function getPriceIdForTier(tier: Exclude<PlanTier, "free">): string | null {
  const plan = PLANS.find((p) => p.tier === tier);
  const fromEnv = plan?.priceIdEnv ? process.env[plan.priceIdEnv] : undefined;
  return fromEnv || PRICE_IDS[tier];
}

export function isPaidTier(tier: string): tier is Exclude<PlanTier, "free"> {
  return ["starter", "pro", "premium", "ultra"].includes(tier);
}
