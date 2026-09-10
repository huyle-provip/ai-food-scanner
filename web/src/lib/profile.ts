import { Profile } from "@food-scanner/shared";
import { createClient } from "./supabase/server";

/** The signed-in user's profile row, or null if not signed in / no row. */
export async function getMyProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !data) return null;
  return { id: data.id, displayName: data.display_name, isAdmin: data.is_admin };
}

/** Whether the currently signed-in user has the admin flag on their profile row. */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const profile = await getMyProfile();
  return Boolean(profile?.isAdmin);
}
