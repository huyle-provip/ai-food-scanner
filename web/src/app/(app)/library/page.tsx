import Link from "next/link";
import { listMeals } from "@/lib/meals";
import styles from "./page.module.css";
import { SavedNotice } from "./SavedNotice";

export default async function MealsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [meals, params] = await Promise.all([listMeals(), searchParams]);
  const notice = params.saved ? "Saved to library" : params.deleted ? "Meal deleted" : null;

  return (
    <section>
      <h1 className={styles.heading}>Library</h1>
      {notice ? <SavedNotice message={notice} /> : null}
      {meals.length === 0 ? (
        <p>
          No saved meals yet. Scan a meal in the mobile app, or{" "}
          <Link href="/add" className={styles.inlineLink}>
            add one manually
          </Link>
          .
        </p>
      ) : (
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
      )}
    </section>
  );
}
