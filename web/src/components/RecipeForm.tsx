"use client";

import { NutrientProfile, RecipeInput } from "@food-scanner/shared";
import { useState, useTransition, type ReactNode } from "react";
import styles from "./RecipeForm.module.css";

export interface RecipeFormValue {
  title: string;
  description: string;
  imageUrl: string;
  ingredientsText: string; // one ingredient per line
  instructions: string;
  tagsText: string; // comma-separated
  servings: string;
  calories: string;
  proteinG: string;
  carbsG: string;
  fatG: string;
  fiberG: string;
  sodiumMg: string;
  isPublished: boolean;
}

export const emptyRecipeForm: RecipeFormValue = {
  title: "",
  description: "",
  imageUrl: "",
  ingredientsText: "",
  instructions: "",
  tagsText: "",
  servings: "1",
  calories: "0",
  proteinG: "0",
  carbsG: "0",
  fatG: "0",
  fiberG: "0",
  sodiumMg: "0",
  isPublished: false,
};

const num = (s: string) => Number(s) || 0;

function toInput(v: RecipeFormValue): RecipeInput {
  const nutrition: NutrientProfile = {
    calories: num(v.calories),
    proteinG: num(v.proteinG),
    carbsG: num(v.carbsG),
    fatG: num(v.fatG),
    fiberG: num(v.fiberG),
    sodiumMg: num(v.sodiumMg),
  };
  return {
    title: v.title.trim(),
    description: v.description.trim(),
    imageUrl: v.imageUrl.trim() || null,
    ingredients: v.ingredientsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    instructions: v.instructions.trim(),
    tags: v.tagsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    servings: Math.max(1, Math.round(num(v.servings) || 1)),
    nutrition,
    isPublished: v.isPublished,
  };
}

interface Props {
  initialValue: RecipeFormValue;
  submitLabel: string;
  onSubmit: (input: RecipeInput) => Promise<void>;
  extraActions?: ReactNode;
}

export function RecipeForm({ initialValue, submitLabel, onSubmit, extraActions }: Props) {
  const [value, setValue] = useState(initialValue);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof RecipeFormValue>(key: K, v: RecipeFormValue[K]) {
    setValue((prev) => ({ ...prev, [key]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await onSubmit(toInput(value));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  const numberField = (key: keyof RecipeFormValue, label: string) => (
    <label className={styles.field} key={key}>
      <span>{label}</span>
      <input
        type="number"
        step="any"
        value={value[key] as string}
        onChange={(e) => set(key, e.target.value as never)}
      />
    </label>
  );

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span>Title</span>
        <input value={value.title} onChange={(e) => set("title", e.target.value)} required />
      </label>

      <label className={styles.field}>
        <span>Description</span>
        <textarea
          rows={2}
          value={value.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </label>

      <label className={styles.field}>
        <span>Image URL</span>
        <input
          type="url"
          value={value.imageUrl}
          onChange={(e) => set("imageUrl", e.target.value)}
          placeholder="https://..."
        />
      </label>

      <label className={styles.field}>
        <span>Ingredients (one per line)</span>
        <textarea
          rows={6}
          value={value.ingredientsText}
          onChange={(e) => set("ingredientsText", e.target.value)}
        />
      </label>

      <label className={styles.field}>
        <span>Instructions</span>
        <textarea
          rows={6}
          value={value.instructions}
          onChange={(e) => set("instructions", e.target.value)}
        />
      </label>

      <label className={styles.field}>
        <span>Tags (comma-separated)</span>
        <input
          value={value.tagsText}
          onChange={(e) => set("tagsText", e.target.value)}
          placeholder="healthy, high-protein"
        />
      </label>

      <h3 className={styles.sectionTitle}>Nutrition (per serving)</h3>
      <div className={styles.grid}>
        {numberField("servings", "Servings")}
        {numberField("calories", "Calories (kcal)")}
        {numberField("proteinG", "Protein (g)")}
        {numberField("carbsG", "Carbs (g)")}
        {numberField("fatG", "Fat (g)")}
        {numberField("fiberG", "Fiber (g)")}
        {numberField("sodiumMg", "Sodium (mg)")}
      </div>

      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={value.isPublished}
          onChange={(e) => set("isPublished", e.target.checked)}
        />
        <span>Published (visible on the public feed)</span>
      </label>

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
