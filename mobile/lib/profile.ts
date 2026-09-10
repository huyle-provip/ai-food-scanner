import { Profile } from "@food-scanner/shared";
import { supabase } from "./supabase";

export async function getMyProfile(): Promise<Profile | null> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, is_admin")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return { id: data.id, displayName: data.display_name, isAdmin: data.is_admin };
}

export async function updateDisplayName(name: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not signed in");

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: name.trim() || null })
    .eq("id", userId);
  if (error) throw error;
}
