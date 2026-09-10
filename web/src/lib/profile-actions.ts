"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export async function updateDisplayName(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // The column-level grant on `profiles` limits this to `display_name`.
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: name.trim() || null })
    .eq("id", user.id);
  if (error) throw error;

  revalidatePath("/settings");
  revalidatePath("/library");
  redirect("/library?saved=1");
}
