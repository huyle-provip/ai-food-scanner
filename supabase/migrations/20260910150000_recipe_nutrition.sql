-- Per-serving nutrition for recipes, shown on the recipe detail page and
-- editable from the admin UI.

alter table public.recipes
  add column if not exists servings integer not null default 1 check (servings > 0),
  add column if not exists calories numeric not null default 0 check (calories >= 0),
  add column if not exists protein_g numeric not null default 0 check (protein_g >= 0),
  add column if not exists carbs_g numeric not null default 0 check (carbs_g >= 0),
  add column if not exists fat_g numeric not null default 0 check (fat_g >= 0),
  add column if not exists fiber_g numeric not null default 0 check (fiber_g >= 0),
  add column if not exists sodium_mg numeric not null default 0 check (sodium_mg >= 0);

-- Fill in the seed recipes (per serving).
update public.recipes set servings = 2, calories = 320, protein_g = 42, carbs_g = 6, fat_g = 14, fiber_g = 1, sodium_mg = 520
  where title = 'Grilled Lemon Herb Chicken';
update public.recipes set servings = 4, calories = 280, protein_g = 8, carbs_g = 46, fat_g = 7, fiber_g = 3, sodium_mg = 610
  where title = 'Veggie Fried Rice';
update public.recipes set servings = 4, calories = 640, protein_g = 29, carbs_g = 44, fat_g = 38, fiber_g = 5, sodium_mg = 980
  where title = 'Loaded Beef Nachos';
update public.recipes set servings = 1, calories = 350, protein_g = 14, carbs_g = 52, fat_g = 10, fiber_g = 9, sodium_mg = 95
  where title = 'Overnight Oats with Berries';
