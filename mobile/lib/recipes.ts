import { Recipe } from "@food-scanner/shared";
import { supabase } from "./supabase";

interface RecipeRow {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  ingredients: string[];
  instructions: string;
  tags: string[];
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
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listPublishedRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as RecipeRow[]).map(fromRow);
}

export async function getRecipe(id: string): Promise<Recipe> {
  const { data, error } = await supabase.from("recipes").select("*").eq("id", id).single();
  if (error) throw error;
  return fromRow(data as RecipeRow);
}
