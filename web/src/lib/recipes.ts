import { Recipe } from "@food-scanner/shared";
import { createClient } from "./supabase/server";

interface RecipeRow {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  ingredients: string[];
  instructions: string;
  tags: string[];
  servings: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

function fromRow(row: RecipeRow): Recipe {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    ingredients: row.ingredients ?? [],
    instructions: row.instructions,
    tags: row.tags ?? [],
    servings: row.servings,
    nutrition: {
      calories: row.calories,
      proteinG: row.protein_g,
      carbsG: row.carbs_g,
      fatG: row.fat_g,
      fiberG: row.fiber_g,
      sodiumMg: row.sodium_mg,
    },
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Published recipes only — safe for the public feed (also works signed out). */
export async function listPublishedRecipes(): Promise<Recipe[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as RecipeRow[]).map(fromRow);
}

export async function getPublishedRecipe(id: string): Promise<Recipe | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as RecipeRow) : null;
}

/** All recipes incl. drafts — RLS only returns rows to admins. */
export async function listAllRecipes(): Promise<Recipe[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as RecipeRow[]).map(fromRow);
}

export async function getRecipeForAdmin(id: string): Promise<Recipe | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("recipes").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as RecipeRow) : null;
}
