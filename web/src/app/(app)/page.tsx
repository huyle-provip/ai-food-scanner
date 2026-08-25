import Link from "next/link";
import { listDishes } from "@/lib/dishes";
import styles from "./page.module.css";

export default async function DishesPage() {
  const dishes = await listDishes();

  if (dishes.length === 0) {
    return (
      <p>
        No saved dishes yet. Scan a meal in the mobile app, or{" "}
        <Link href="/add">add one manually</Link>.
      </p>
    );
  }

  return (
    <ul className={styles.list}>
      {dishes.map((dish) => (
        <li key={dish.id}>
          <Link href={`/dish/${dish.id}`} className={styles.card}>
            <span className={styles.name}>{dish.name}</span>
            <span className={styles.meta}>
              {dish.servingSizeGrams}g · {dish.calories.toFixed(0)} kcal ·{" "}
              {dish.source === "scan" ? "scanned" : "manual"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
