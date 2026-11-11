-- Create profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text default 'creator' check (role in ('creator', 'admin', 'superadmin')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create profiles policies
create policy "Public read access on profiles" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Create subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  plan_tier text not null check (plan_tier in ('free', 'starter', 'pro', 'premium', 'ultra')),
  status text not null default 'active' check (status in ('active', 'past_due', 'canceled', 'unpaid')),
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can read own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "Users can insert own subscription" on public.subscriptions
  for insert with check (auth.uid() = user_id);

-- Create user_balances table
create table if not exists public.user_balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null unique,
  script_character_credits integer default 0 not null,
  thumbnail_credits integer default 0 not null,
  voice_credits integer default 0 not null,
  max_presets_allowed integer default 3 not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.user_balances enable row level security;

create policy "Users can read own balance" on public.user_balances
  for select using (auth.uid() = user_id);

create policy "Users can update own balance" on public.user_balances
  for update using (auth.uid() = user_id);

-- Create presets table
create table if not exists public.presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  target_niche text,
  tone text not null default 'engaging' check (tone in ('engaging', 'educational', 'persuasive', 'entertaining')),
  audience_profile text,
  pacing text not null default 'medium' check (pacing in ('slow', 'medium', 'fast')),
  narrative_structure_rules jsonb default '{}'::jsonb,
  forbidden_words text[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.presets enable row level security;

create policy "Users can read own presets" on public.presets
  for select using (auth.uid() = user_id);

create policy "Users can create own presets" on public.presets
  for insert with check (auth.uid() = user_id);

create policy "Users can update own presets" on public.presets
  for update using (auth.uid() = user_id);

create policy "Users can delete own presets" on public.presets
  for delete using (auth.uid() = user_id);

-- Create niche_database table
create table if not exists public.niche_database (
  id uuid primary key default gen_random_uuid(),
  niche_name text not null unique,
  category text not null check (category in ('gaming', 'education', 'tech', 'lifestyle', 'business', 'faceless')),
  estimated_rpm_min integer default 2 not null,
  estimated_rpm_max integer default 35 not null,
  difficulty_score integer default 5 check (difficulty_score >= 1 and difficulty_score <= 10),
  is_faceless_friendly boolean default true,
  example_channels text default '',
  viral_hooks_library jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now()
);

alter table public.niche_database enable row level security;

create policy "Public read access on niche_database" on public.niche_database
  for select using (true);

-- Create scripts table
create table if not exists public.scripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  preset_id uuid references public.presets set null on delete set null,
  title text not null,
  topic text not null,
  language text not null default 'en' check (language in ('en', 'es', 'fr', 'de', 'pt', 'hi')),
  target_character_count integer not null default 0,
  actual_character_count integer default 0,
  hook_text text,
  body_text text,
  cta_text text,
  full_content_markdown text,
  visual_cues_json jsonb default '{}'::jsonb,
  seo_metadata jsonb default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'generating', 'completed', 'failed')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.scripts enable row level security;

create policy "Users can read own scripts" on public.scripts
  for select using (auth.uid() = user_id);

create policy "Users can create own scripts" on public.scripts
  for insert with check (auth.uid() = user_id);

create policy "Users can update own scripts" on public.scripts
  for update using (auth.uid() = user_id);

create policy "Users can delete own scripts" on public.scripts
  for delete using (auth.uid() = user_id);

-- Create thumbnail_jobs table
create table if not exists public.thumbnail_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  script_id uuid references public.scripts on delete cascade,
  prompt_used text not null,
  reference_type text not null default 'manual' check (reference_type in ('channel', 'video', 'manual')),
  reference_url text,
  generated_image_urls text[] default '{}',
  aspect_ratio text not null default '16:9' check (aspect_ratio in ('16:9', '21:9', '4:3')),
  created_at timestamp with time zone default now()
);

alter table public.thumbnail_jobs enable row level security;

create policy "Users can read own thumbnail jobs" on public.thumbnail_jobs
  for select using (auth.uid() = user_id);

create policy "Users can create own thumbnail jobs" on public.thumbnail_jobs
  for insert with check (auth.uid() = user_id);

-- Create indexes for performance
create index idx_profiles_user_id on public.profiles(user_id);
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_stripe_id on public.subscriptions(stripe_subscription_id);
create index idx_user_balances_user_id on public.user_balances(user_id);
create index idx_presets_user_id on public.presets(user_id);
create index idx_niche_name on public.niche_database(niche_name);
create index idx_scripts_user_id on public.scripts(user_id);
create index idx_scripts_status on public.scripts(status);
create index idx_scripts_preset_id on public.scripts(preset_id);
create index idx_thumbnail_jobs_user_id on public.thumbnail_jobs(user_id);
create index idx_thumbnail_jobs_script_id on public.thumbnail_jobs(script_id);