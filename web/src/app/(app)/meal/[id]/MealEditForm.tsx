"use client";

import { Meal } from "@food-scanner/shared";
import { useTransition } from "react";
import { NutrientForm } from "@/components/NutrientForm";
import type { MealFormInput } from "@/lib/actions";
import styles from "./page.module.css";

interface Props {
  meal: Meal;
  updateAction: (input: MealFormInput) => Promise<void>;
  deleteAction: () => Promise<void>;
}

export function MealEditForm({ meal, updateAction, deleteAction }: Props) {
  const [deleting, startDelete] = useTransition();

  return (
    <NutrientForm
      initialValue={{
        name: meal.name,
        servingSizeGrams: String(meal.servingSizeGrams),
        per100g: meal.per100g,
      }}
      submitLabel="Save Changes"
      onSubmit={updateAction}
      extraActions={
        <button
          type="button"
          className={styles.deleteButton}
          disabled={deleting}
          onClick={() => {
            if (confirm("Delete this meal? This can't be undone.")) {
              startDelete(() => deleteAction());
            }
          }}
        >
          {deleting ? "Deleting..." : "Delete Meal"}
        </button>
      }
    />
  );
}
