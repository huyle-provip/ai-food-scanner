import { Meal, NutrientProfile } from "@food-scanner/shared";
import { createClient } from "./supabase/server";

interface MealRow {
  id: string;
  user_id: string;
  name: string;
  source: "scan" | "manual";
  photo_url: string | null;
  serving_size_grams: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
  per_100g: NutrientProfile;
  created_at: string;
  updated_at: string;
}

function fromRow(row: MealRow): Meal {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    source: row.source,
    photoUrl: row.photo_url,
    servingSizeGrams: row.serving_size_grams,
    per100g: row.per_100g,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    calories: row.calories,
    proteinG: row.protein_g,
    carbsG: row.carbs_g,
    fatG: row.fat_g,
    fiberG: row.fiber_g,
    sodiumMg: row.sodium_mg,
  };
}

export async function listMeals(): Promise<Meal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meals")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as MealRow[]).map(fromRow);
}

export async function getMeal(id: string): Promise<Meal | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("meals").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as MealRow) : null;
}
