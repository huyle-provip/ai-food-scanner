"use server";

import { NutrientProfile, scaleNutrients } from "@food-scanner/shared";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export interface DishFormInput {
  name: string;
  servingSizeGrams: number;
  per100g: NutrientProfile;
}

export async function createManualDish(input: DishFormInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const scaled = scaleNutrients(input.per100g, input.servingSizeGrams);
  const { error } = await supabase.from("dishes").insert({
    user_id: user.id,
    name: input.name,
    source: "manual",
    serving_size_grams: input.servingSizeGrams,
    calories: scaled.calories,
    protein_g: scaled.proteinG,
    carbs_g: scaled.carbsG,
    fat_g: scaled.fatG,
    fiber_g: scaled.fiberG,
    sodium_mg: scaled.sodiumMg,
    per_100g: input.per100g,
  });
  if (error) throw error;

  revalidatePath("/");
  redirect("/");
}

export async function updateDish(id: string, input: DishFormInput) {
  const supabase = await createClient();
  const scaled = scaleNutrients(input.per100g, input.servingSizeGrams);
  const { error } = await supabase
    .from("dishes")
    .update({
      name: input.name,
      serving_size_grams: input.servingSizeGrams,
      calories: scaled.calories,
      protein_g: scaled.proteinG,
      carbs_g: scaled.carbsG,
      fat_g: scaled.fatG,
      fiber_g: scaled.fiberG,
      sodium_mg: scaled.sodiumMg,
      per_100g: input.per100g,
    })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/");
  redirect("/");
}

export async function deleteDish(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("dishes").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
