import { Dish, NutrientProfile, scaleNutrients } from "@food-scanner/shared";
import { supabase } from "./supabase";

interface DishRow {
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

function fromRow(row: DishRow): Dish {
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

export async function listDishes(): Promise<Dish[]> {
  const { data, error } = await supabase
    .from("dishes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as DishRow[]).map(fromRow);
}

export async function getDish(id: string): Promise<Dish> {
  const { data, error } = await supabase.from("dishes").select("*").eq("id", id).single();
  if (error) throw error;
  return fromRow(data as DishRow);
}

export interface SaveDishInput {
  name: string;
  source: "scan" | "manual";
  photoUrl?: string | null;
  servingSizeGrams: number;
  per100g: NutrientProfile;
}

export async function createDish(input: SaveDishInput): Promise<Dish> {
  const scaled = scaleNutrients(input.per100g, input.servingSizeGrams);
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("dishes")
    .insert({
      user_id: userId,
      name: input.name,
      source: input.source,
      photo_url: input.photoUrl ?? null,
      serving_size_grams: input.servingSizeGrams,
      calories: scaled.calories,
      protein_g: scaled.proteinG,
      carbs_g: scaled.carbsG,
      fat_g: scaled.fatG,
      fiber_g: scaled.fiberG,
      sodium_mg: scaled.sodiumMg,
      per_100g: input.per100g,
    })
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as DishRow);
}

export interface UpdateDishInput {
  name: string;
  servingSizeGrams: number;
  per100g: NutrientProfile;
}

export async function updateDish(id: string, input: UpdateDishInput): Promise<Dish> {
  const scaled = scaleNutrients(input.per100g, input.servingSizeGrams);
  const { data, error } = await supabase
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
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as DishRow);
}

export async function deleteDish(id: string): Promise<void> {
  const { error } = await supabase.from("dishes").delete().eq("id", id);
  if (error) throw error;
}
