"use client";

import { Dish } from "@food-scanner/shared";
import { useTransition } from "react";
import { NutrientForm } from "@/components/NutrientForm";
import type { DishFormInput } from "@/lib/actions";
import styles from "./page.module.css";

interface Props {
  dish: Dish;
  updateAction: (input: DishFormInput) => Promise<void>;
  deleteAction: () => Promise<void>;
}

export function DishEditForm({ dish, updateAction, deleteAction }: Props) {
  const [deleting, startDelete] = useTransition();

  return (
    <NutrientForm
      initialValue={{
        name: dish.name,
        servingSizeGrams: String(dish.servingSizeGrams),
        per100g: dish.per100g,
      }}
      submitLabel="Save Changes"
      onSubmit={updateAction}
      extraActions={
        <button
          type="button"
          className={styles.deleteButton}
          disabled={deleting}
          onClick={() => {
            if (confirm("Delete this dish? This can't be undone.")) {
              startDelete(() => deleteAction());
            }
          }}
        >
          {deleting ? "Deleting..." : "Delete Dish"}
        </button>
      }
    />
  );
}
