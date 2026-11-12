-- ============================================================
-- TRIGGER: crear perfil + balance automáticamente al registrarse
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
security definer set search_path = public
language plpgsql
as $$
begin
  -- Crear el perfil del usuario
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;

  -- Crear el balance inicial (plan FREE: 50,000 caracteres + 2 miniaturas)
  insert into public.user_balances (
    user_id,
    script_character_credits,
    thumbnail_credits,
    voice_credits,
    max_presets_allowed
  )
  values (
    new.id,
    50000,
    2,
    0,
    3
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
