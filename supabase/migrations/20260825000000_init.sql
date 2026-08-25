-- Core schema for AI Food Scanner: dishes (saved meals), scans (scan history/audit).
-- Every table is scoped to auth.uid() via RLS so users only ever see their own data.

create table if not exists public.dishes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  source text not null check (source in ('scan', 'manual')),
  photo_url text,
  serving_size_grams numeric not null check (serving_size_grams > 0),
  calories numeric not null check (calories >= 0),
  protein_g numeric not null default 0 check (protein_g >= 0),
  carbs_g numeric not null default 0 check (carbs_g >= 0),
  fat_g numeric not null default 0 check (fat_g >= 0),
  fiber_g numeric not null default 0 check (fiber_g >= 0),
  sodium_mg numeric not null default 0 check (sodium_mg >= 0),
  -- Snapshot of per-100g values so the serving size can be edited/rescaled later
  -- without needing to re-scan or re-query the nutrition database.
  per_100g jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dishes_user_id_idx on public.dishes (user_id);

create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dish_id uuid references public.dishes (id) on delete set null,
  photo_url text not null,
  raw_model_response jsonb,
  created_at timestamptz not null default now()
);

create index if not exists scans_user_id_idx on public.scans (user_id);

-- Keep updated_at current on every edit.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists dishes_set_updated_at on public.dishes;
create trigger dishes_set_updated_at
  before update on public.dishes
  for each row
  execute function public.set_updated_at();

-- Row Level Security: every policy scopes rows to the requesting user.
alter table public.dishes enable row level security;
alter table public.scans enable row level security;

create policy "dishes_select_own" on public.dishes
  for select using (auth.uid() = user_id);
create policy "dishes_insert_own" on public.dishes
  for insert with check (auth.uid() = user_id);
create policy "dishes_update_own" on public.dishes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dishes_delete_own" on public.dishes
  for delete using (auth.uid() = user_id);

create policy "scans_select_own" on public.scans
  for select using (auth.uid() = user_id);
create policy "scans_insert_own" on public.scans
  for insert with check (auth.uid() = user_id);
create policy "scans_update_own" on public.scans
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "scans_delete_own" on public.scans
  for delete using (auth.uid() = user_id);

-- Private storage bucket for meal photos, one folder per user (path: {user_id}/...).
insert into storage.buckets (id, name, public)
values ('meal-photos', 'meal-photos', false)
on conflict (id) do nothing;

create policy "meal_photos_select_own" on storage.objects
  for select using (
    bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "meal_photos_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "meal_photos_delete_own" on storage.objects
  for delete using (
    bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
