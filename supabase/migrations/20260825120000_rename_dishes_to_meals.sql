-- Renames "dishes" to "meals" throughout (table, index, FK column, trigger,
-- RLS policies) to match the app's user-facing terminology. Written as a new
-- migration rather than editing 20260825000000_init.sql, since that one has
-- already been applied to any linked project.

alter table public.dishes rename to meals;
alter index dishes_user_id_idx rename to meals_user_id_idx;
alter trigger dishes_set_updated_at on public.meals rename to meals_set_updated_at;

alter table public.scans rename column dish_id to meal_id;

alter policy "dishes_select_own" on public.meals rename to "meals_select_own";
alter policy "dishes_insert_own" on public.meals rename to "meals_insert_own";
alter policy "dishes_update_own" on public.meals rename to "meals_update_own";
alter policy "dishes_delete_own" on public.meals rename to "meals_delete_own";
