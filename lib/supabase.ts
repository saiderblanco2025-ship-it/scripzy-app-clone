"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

// Fijados en código para que el despliegue nunca dependa de la configuración
// de variables en Vercel (la URL y la publishable key son públicas por diseño).
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mmrdwogxczcrkcyapbkx.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_EluJACXjQ_qIjAD-CIRShQ_ulHv7jJD";

/**
 * Cliente Supabase del navegador.
 * - persistSession: guarda la sesión en localStorage
 * - detectSessionInUrl: procesa el hash/tokens al volver de Google
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ============ TIPOS ============

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: "creator" | "admin" | "superadmin";
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan_tier: "free" | "starter" | "pro" | "premium" | "ultra";
  status: "active" | "past_due" | "canceled" | "unpaid";
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};

export type UserBalance = {
  id: string;
  user_id: string;
  script_character_credits: number;
  thumbnail_credits: number;
  voice_credits: number;
  max_presets_allowed: number;
  created_at: string;
  updated_at: string;
};

export type Preset = {
  id: string;
  user_id: string;
  name: string;
  target_niche: string | null;
  tone: "engaging" | "educational" | "persuasive" | "entertaining";
  audience_profile: string | null;
  pacing: "slow" | "medium" | "fast";
  narrative_structure_rules: Record<string, unknown>;
  forbidden_words: string[];
  created_at: string;
  updated_at: string;
};

// ============ HOOK DE SESIÓN ============

/** Devuelve el usuario actual y su estado de carga. Reacciona a cambios de sesión. */
export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      if (session?.user) setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

// ============ HELPERS DE AUTH ============

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export async function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithPassword(
  email: string,
  password: string,
  fullName: string
) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

// ============ HELPERS DE DATOS ============

export async function getProfile(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return null;
  return data as Profile;
}

export async function getUserBalance(): Promise<UserBalance | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_balances")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) return null;
  return data as UserBalance;
}