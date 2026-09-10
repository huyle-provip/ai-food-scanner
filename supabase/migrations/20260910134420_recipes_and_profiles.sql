-- Adds:
--   * `profiles` - one row per auth user, holds the `is_admin` flag (and, later,
--     diet settings). Auto-created on signup via a trigger on auth.users.
--   * `recipes` - admin-curated cooking recipes / meal ideas shown on the public
--     Home feed in both the mobile app and the web app. Published rows are world
--     readable (including anon); only admins can write.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Owner can read their own profile. There is deliberately no UPDATE policy:
-- `is_admin` is toggled manually from the Supabase SQL editor / dashboard for now.
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Backfill profiles for any users that already exist.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- recipes
-- ---------------------------------------------------------------------------
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  image_url text,
  ingredients text[] not null default '{}',
  instructions text not null default '',
  tags text[] not null default '{}',
  is_published boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recipes_published_idx on public.recipes (is_published, created_at desc);

-- Reuse the shared updated_at trigger function from the init migration.
drop trigger if exists recipes_set_updated_at on public.recipes;
create trigger recipes_set_updated_at
  before update on public.recipes
  for each row
  execute function public.set_updated_at();

alter table public.recipes enable row level security;

-- Anyone (including anon) may read published recipes.
create policy "recipes_select_published" on public.recipes
  for select using (is_published);

-- Admins may read everything (drafts included) and write.
create policy "recipes_admin_select_all" on public.recipes
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );
create policy "recipes_admin_insert" on public.recipes
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );
create policy "recipes_admin_update" on public.recipes
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );
create policy "recipes_admin_delete" on public.recipes
  for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ---------------------------------------------------------------------------
-- Data API grants (this project does not auto-expose new tables)
-- ---------------------------------------------------------------------------
grant select on public.recipes to anon, authenticated;
grant insert, update, delete on public.recipes to authenticated;
grant select on public.profiles to authenticated;

-- Make sure the pre-existing tables are reachable too (no-op if already granted).
grant select, insert, update, delete on public.meals to authenticated;
grant select, insert, update, delete on public.scans to authenticated;

-- ---------------------------------------------------------------------------
-- Seed content so the feed isn't empty before the admin UI exists
-- ---------------------------------------------------------------------------
insert into public.recipes (title, description, image_url, ingredients, instructions, tags, is_published)
values
  (
    'Grilled Lemon Herb Chicken',
    'Juicy grilled chicken breast in a bright lemon-garlic-herb marinade. High protein, low carb.',
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800',
    array['2 chicken breasts', '2 tbsp olive oil', '1 lemon (juice + zest)', '3 garlic cloves, minced', '1 tsp dried oregano', 'Salt & pepper'],
    e'1. Whisk oil, lemon juice/zest, garlic, oregano, salt and pepper.\n2. Marinate chicken 30 min.\n3. Grill 5-6 min per side until 74C internal.\n4. Rest 5 min, slice, serve.',
    array['healthy', 'high-protein', 'low-carb'],
    true
  ),
  (
    'Veggie Fried Rice',
    'Fast weeknight fried rice loaded with vegetables. Great use of day-old rice.',
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800',
    array['3 cups cooked cold rice', '2 eggs', '1 cup mixed frozen vegetables', '2 green onions', '2 tbsp soy sauce', '1 tbsp sesame oil'],
    e'1. Scramble eggs in a hot oiled wok, set aside.\n2. Stir-fry vegetables 2-3 min.\n3. Add rice, break up, fry 3-4 min.\n4. Return eggs, add soy sauce and sesame oil, toss, top with green onion.',
    array['vegetarian', 'quick'],
    true
  ),
  (
    'Loaded Beef Nachos',
    'Sharing-size nachos with seasoned beef, melted cheese and all the toppings. Indulgent.',
    'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=800',
    array['1 bag tortilla chips', '400g ground beef', '1 packet taco seasoning', '2 cups shredded cheese', 'Jalapenos', 'Sour cream', 'Guacamole', 'Salsa'],
    e'1. Brown beef, add taco seasoning + splash of water, simmer 5 min.\n2. Layer chips, beef and cheese on a tray; repeat.\n3. Bake 190C for 8-10 min until cheese melts.\n4. Top with jalapenos, sour cream, guac and salsa.',
    array['indulgent', 'sharing'],
    true
  ),
  (
    'Overnight Oats with Berries',
    'No-cook breakfast you prep the night before. Fiber-rich and meal-prep friendly.',
    'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800',
    array['1/2 cup rolled oats', '1/2 cup milk of choice', '1/4 cup yogurt', '1 tbsp chia seeds', '1 tsp honey', '1/2 cup mixed berries'],
    e'1. Combine oats, milk, yogurt, chia and honey in a jar.\n2. Stir well, top with berries.\n3. Refrigerate overnight (or at least 4 hours).\n4. Eat cold or warmed.',
    array['healthy', 'breakfast', 'high-fiber'],
    true
  );
