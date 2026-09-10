import Link from "next/link";
import { listAllRecipes } from "@/lib/recipes";
import styles from "./page.module.css";

export default async function AdminRecipesPage() {
  const recipes = await listAllRecipes();

  if (recipes.length === 0) {
    return (
      <p>
        No recipes yet. <Link href="/admin/new">Create the first one</Link>.
      </p>
    );
  }

  return (
    <ul className={styles.list}>
      {recipes.map((recipe) => (
        <li key={recipe.id}>
          <Link href={`/admin/${recipe.id}`} className={styles.row}>
            <span className={styles.title}>{recipe.title}</span>
            <span
              className={recipe.isPublished ? styles.badgePublished : styles.badgeDraft}
            >
              {recipe.isPublished ? "Published" : "Draft"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
