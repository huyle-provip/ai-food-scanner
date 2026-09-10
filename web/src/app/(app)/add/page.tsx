"use client";

import { NutrientForm } from "@/components/NutrientForm";
import { createManualMeal } from "@/lib/actions";

const empty = {
  name: "",
  servingSizeGrams: "200",
  per100g: { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0, sodiumMg: 0 },
};

export default function AddMealPage() {
  return (
    <NutrientForm
      initialValue={empty}
      submitLabel="Save Meal"
      onSubmit={(input) => createManualMeal(input)}
    />
  );
}
