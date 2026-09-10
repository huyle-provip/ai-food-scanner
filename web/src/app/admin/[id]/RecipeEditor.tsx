"use client";

import { Recipe, RecipeInput } from "@food-scanner/shared";
import { useTransition } from "react";
import { RecipeForm, type RecipeFormValue } from "@/components/RecipeForm";
import styles from "./page.module.css";

interface Props {
  recipe: Recipe;
  updateAction: (input: RecipeInput) => Promise<void>;
  deleteAction: () => Promise<void>;
}

export function RecipeEditor({ recipe, updateAction, deleteAction }: Props) {
  const [deleting, startDelete] = useTransition();

  const initialValue: RecipeFormValue = {
    title: recipe.title,
    description: recipe.description,
    imageUrl: recipe.imageUrl ?? "",
    ingredientsText: recipe.ingredients.join("\n"),
    instructions: recipe.instructions,
    tagsText: recipe.tags.join(", "),
    servings: String(recipe.servings),
    calories: String(recipe.nutrition.calories),
    proteinG: String(recipe.nutrition.proteinG),
    carbsG: String(recipe.nutrition.carbsG),
    fatG: String(recipe.nutrition.fatG),
    fiberG: String(recipe.nutrition.fiberG),
    sodiumMg: String(recipe.nutrition.sodiumMg),
    isPublished: recipe.isPublished,
  };

  return (
    <RecipeForm
      initialValue={initialValue}
      submitLabel="Save changes"
      onSubmit={updateAction}
      extraActions={
        <button
          type="button"
          className={styles.deleteButton}
          disabled={deleting}
          onClick={() => {
            if (confirm("Delete this recipe? This can't be undone.")) {
              startDelete(() => deleteAction());
            }
          }}
        >
          {deleting ? "Deleting..." : "Delete recipe"}
        </button>
      }
    />
  );
}
