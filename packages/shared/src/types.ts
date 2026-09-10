export type MealSource = "scan" | "manual";

export interface NutrientProfile {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sodiumMg: number;
}

export interface Meal {
  id: string;
  userId: string;
  name: string;
  source: MealSource;
  photoUrl: string | null;
  servingSizeGrams: number;
  per100g: NutrientProfile;
  createdAt: string;
  updatedAt: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sodiumMg: number;
}

/** Draft returned by the `analyze-meal` edge function, before the user confirms/edits and saves it as a Meal. */
export interface MealAnalysisDraft {
  name: string;
  servingSizeGrams: number;
  per100g: NutrientProfile;
  confidence: "low" | "medium" | "high";
  notes?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  ingredients: string[];
  instructions: string;
  tags: string[];
  servings: number;
  nutrition: NutrientProfile;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Editable fields for creating/updating a recipe from the admin UI. */
export interface RecipeInput {
  title: string;
  description: string;
  imageUrl: string | null;
  ingredients: string[];
  instructions: string;
  tags: string[];
  servings: number;
  nutrition: NutrientProfile;
  isPublished: boolean;
}

export function scaleNutrients(per100g: NutrientProfile, servingSizeGrams: number): NutrientProfile {
  const factor = servingSizeGrams / 100;
  return {
    calories: per100g.calories * factor,
    proteinG: per100g.proteinG * factor,
    carbsG: per100g.carbsG * factor,
    fatG: per100g.fatG * factor,
    fiberG: per100g.fiberG * factor,
    sodiumMg: per100g.sodiumMg * factor,
  };
}
