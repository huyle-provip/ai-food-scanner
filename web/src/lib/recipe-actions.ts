"use server";

import { RecipeInput } from "@food-scanner/shared";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

// Writes are additionally protected by the `recipes_admin_*` RLS policies —
// a non-admin session gets a permission error from Postgres.

function toRow(input: RecipeInput) {
  return {
    title: input.title,
    description: input.description,
    image_url: input.imageUrl,
    ingredients: input.ingredients,
    instructions: input.instructions,
    tags: input.tags,
    is_published: input.isPublished,
  };
}

export async function createRecipe(input: RecipeInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("recipes").insert({ ...toRow(input), created_by: user.id });
  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateRecipe(id: string, input: RecipeInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("recipes").update(toRow(input)).eq("id", id);
  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/recipe/${id}`);
  redirect("/admin");
}

export async function deleteRecipe(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function setRecipePublished(id: string, isPublished: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("recipes")
    .update({ is_published: isPublished })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/recipe/${id}`);
}
