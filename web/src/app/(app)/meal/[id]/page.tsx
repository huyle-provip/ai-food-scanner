import { notFound } from "next/navigation";
import { deleteMeal, updateMeal } from "@/lib/actions";
import { getMeal } from "@/lib/meals";
import { MealEditForm } from "./MealEditForm";

export default async function MealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meal = await getMeal(id);
  if (!meal) notFound();

  return (
    <MealEditForm
      meal={meal}
      updateAction={updateMeal.bind(null, id)}
      deleteAction={deleteMeal.bind(null, id)}
    />
  );
}
