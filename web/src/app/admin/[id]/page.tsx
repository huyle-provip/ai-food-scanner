import { notFound } from "next/navigation";
import { deleteRecipe, updateRecipe } from "@/lib/recipe-actions";
import { getRecipeForAdmin } from "@/lib/recipes";
import { RecipeEditor } from "./RecipeEditor";

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = await getRecipeForAdmin(id);
  if (!recipe) notFound();

  return (
    <>
      <h1>Edit recipe</h1>
      <RecipeEditor
        recipe={recipe}
        updateAction={updateRecipe.bind(null, id)}
        deleteAction={deleteRecipe.bind(null, id)}
      />
    </>
  );
}
