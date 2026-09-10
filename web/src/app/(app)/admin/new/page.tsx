"use client";

import { RecipeForm, emptyRecipeForm } from "@/components/RecipeForm";
import { createRecipe } from "@/lib/recipe-actions";

export default function NewRecipePage() {
  return (
    <>
      <h1>New recipe</h1>
      <RecipeForm
        initialValue={emptyRecipeForm}
        submitLabel="Create recipe"
        onSubmit={(input) => createRecipe(input)}
      />
    </>
  );
}
