"use client";

import { NutrientProfile, scaleNutrients } from "@food-scanner/shared";
import { useState, useTransition, type ReactNode } from "react";
import styles from "./NutrientForm.module.css";

export interface NutrientFormValue {
  name: string;
  servingSizeGrams: string;
  per100g: NutrientProfile;
}

interface Props {
  initialValue: NutrientFormValue;
  submitLabel: string;
  onSubmit: (input: { name: string; servingSizeGrams: number; per100g: NutrientProfile }) => Promise<void>;
  extraActions?: ReactNode;
}

const fields: { key: keyof NutrientProfile; label: string; unit: string }[] = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "proteinG", label: "Protein", unit: "g" },
  { key: "carbsG", label: "Carbs", unit: "g" },
  { key: "fatG", label: "Fat", unit: "g" },
  { key: "fiberG", label: "Fiber", unit: "g" },
  { key: "sodiumMg", label: "Sodium", unit: "mg" },
];

export function NutrientForm({ initialValue, submitLabel, onSubmit, extraActions }: Props) {
  const [value, setValue] = useState(initialValue);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const servingGrams = Number(value.servingSizeGrams) || 0;
  const scaled = scaleNutrients(value.per100g, servingGrams);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await onSubmit({
          name: value.name,
          servingSizeGrams: servingGrams,
          per100g: value.per100g,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span>Name</span>
        <input
          value={value.name}
          onChange={(e) => setValue({ ...value, name: e.target.value })}
          required
        />
      </label>

      <label className={styles.field}>
        <span>Serving size (g)</span>
        <input
          type="number"
          step="any"
          value={value.servingSizeGrams}
          onChange={(e) => setValue({ ...value, servingSizeGrams: e.target.value })}
          required
        />
      </label>

      <h3 className={styles.sectionTitle}>Nutrients per 100g</h3>
      <div className={styles.grid}>
        {fields.map(({ key, label, unit }) => (
          <label className={styles.field} key={key}>
            <span>
              {label} ({unit})
            </span>
            <input
              type="number"
              step="any"
              value={value.per100g[key]}
              onChange={(e) =>
                setValue({
                  ...value,
                  per100g: { ...value.per100g, [key]: Number(e.target.value) || 0 },
                })
              }
            />
          </label>
        ))}
      </div>

      <div className={styles.totals}>
        <strong>Total for this serving ({servingGrams}g):</strong>
        <div>{scaled.calories.toFixed(0)} kcal</div>
        <div>
          Protein {scaled.proteinG.toFixed(1)}g · Carbs {scaled.carbsG.toFixed(1)}g · Fat{" "}
          {scaled.fatG.toFixed(1)}g
        </div>
        <div>
          Fiber {scaled.fiberG.toFixed(1)}g · Sodium {scaled.sodiumMg.toFixed(0)}mg
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button type="submit" disabled={pending} className={styles.submit}>
          {pending ? "Saving..." : submitLabel}
        </button>
        {extraActions}
      </div>
    </form>
  );
}
