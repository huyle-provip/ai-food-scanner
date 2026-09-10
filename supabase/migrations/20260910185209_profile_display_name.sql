-- Free-text display name on profiles, shown in place of the user's email.

alter table public.profiles
  add column if not exists display_name text
  check (display_name is null or char_length(trim(display_name)) between 1 and 40);

-- Users may update their own row, but the column-level grant limits API
-- updates to display_name only -- is_admin stays server/SQL-only.
grant update (display_name) on public.profiles to authenticated;

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Copy the name supplied at signup (auth.signUp options.data.display_name)
-- into the profile row.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(trim(new.raw_user_meta_data->>'display_name'), ''))
  on conflict (id) do nothing;
  return new;
end;
$$;
