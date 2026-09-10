import Link from "next/link";
import { listMeals } from "@/lib/meals";
import styles from "./page.module.css";

export default async function MealsPage() {
  const meals = await listMeals();

  if (meals.length === 0) {
    return (
      <p>
        No saved meals yet. Scan a meal in the mobile app, or{" "}
        <Link href="/add">add one manually</Link>.
      </p>
    );
  }

  return (
    <ul className={styles.list}>
      {meals.map((meal) => (
        <li key={meal.id}>
          <Link href={`/meal/${meal.id}`} className={styles.card}>
            <span className={styles.name}>{meal.name}</span>
            <span className={styles.meta}>
              {meal.servingSizeGrams}g · {meal.calories.toFixed(0)} kcal ·{" "}
              {meal.source === "scan" ? "scanned" : "manual"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
