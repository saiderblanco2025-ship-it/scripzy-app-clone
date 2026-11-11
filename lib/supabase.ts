import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
// In production, these would come from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for common operations
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
  narrative_structure_rules: any;
  forbidden_words: string[];
  created_at: string;
  updated_at: string;
};

export type NicheDatabase = {
  id: string;
  niche_name: string;
  category: "gaming" | "education" | "tech" | "lifestyle" | "business" | "faceless";
  estimated_rpm_min: number;
  estimated_rpm_max: number;
  difficulty_score: number;
  is_faceless_friendly: boolean;
  example_channels: string;
  viral_hooks_library: any;
  created_at: string;
};

export type Script = {
  id: string;
  user_id: string;
  preset_id: string | null;
  title: string;
  topic: string;
  language: "en" | "es" | "fr" | "de" | "pt" | "hi";
  target_character_count: number;
  actual_character_count: number;
  hook_text: string | null;
  body_text: string | null;
  cta_text: string | null;
  full_content_markdown: string | null;
  visual_cues_json: any;
  seo_metadata: any;
  status: "draft" | "generating" | "completed" | "failed";
  created_at: string;
  updated_at: string;
};

export type ThumbnailJob = {
  id: string;
  user_id: string;
  script_id: string | null;
  prompt_used: string;
  reference_type: "channel" | "video" | "manual";
  reference_url: string | null;
  generated_image_urls: string[];
  aspect_ratio: "16:9" | "21:9" | "4:3";
  created_at: string;
};

/**
 * Auth functions
 */
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  if (error) throw error;
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) throw error;
}

/**
 * Get current user profile
 */
export async function getProfile() {
  const { data: { user} } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  
  if (error) throw error;
  
  return data as Profile;
}

/**
 * Get user's subscription status
 */
export async function getSubscription() {
  const { data: { user} } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();
  
  if (error) throw error;
  
  return data as Subscription;
}

/**
 * Get user's balance/credits
 */
export async function getUserBalance() {
  const { data: { user} } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from("user_balances")
    .select("*")
    .eq("user_id", user.id)
    .single();
  
  if (error) throw error;
  
  return data as UserBalance;
}

/**
 * Save a generated script to Supabase
 */
export async function saveScript(script: {
  title: string;
  topic: string;
  language: string;
  outline: any;
  seo: any;
  body: string;
  visual_cues: any;
  status?: string;
}) {
  const { data: { user} } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  const { error } = await supabase
    .from("scripts")
    .insert({
      user_id: user.id,
      title: script.title,
      topic: script.topic,
      language: script.language,
      outline: script.outline,
      seo: script.seo,
      body: script.body,
      visual_cues_json: script.visual_cues,
      status: script.status || "completed",
    });
  
  if (error) throw error;
  
  return true;
}

/**
 * Update user balance after credit consumption
 */
export async function updateUserCredits(
  userId: string,
  updates: {
    script_character_credits?: number;
    thumbnail_credits?: number;
    voice_credits?: number;
  }
) {
  const { error } = await supabase
    .from("user_balances")
    .update(updates)
    .eq("user_id", userId);
  
  if (error) throw error;
  
  return true;
}

/**
 * Get available niches from the database
 */
export async function getNiches(category?: string) {
  let query = supabase.from("niche_database").select("*");
  
  if (category) {
    query = query.eq("category", category);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  return data as NicheDatabase[];
}

/**
 * Save a preset for future use
 */
export async function savePreset(preset: {
  name: string;
  target_niche: string;
  tone: string;
  audience_profile: string;
  pacing: string;
  narrative_structure_rules: any;
  forbidden_words: string[];
}) {
  const { data: { user} } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  const { error } = await supabase
    .from("presets")
    .insert({
      user_id: user.id,
      name: preset.name,
      target_niche: preset.target_niche,
      tone: preset.tone,
      audience_profile: preset.audience_profile,
      pacing: preset.pacing,
      narrative_structure_rules: preset.narrative_structure_rules,
      forbidden_words: preset.forbidden_words,
    });
  
  if (error) throw error;
  
  return true;
}