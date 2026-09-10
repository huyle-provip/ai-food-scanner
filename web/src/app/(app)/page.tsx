import Link from "next/link";
import { listPublishedRecipes } from "@/lib/recipes";
import styles from "./page.module.css";

export default async function DiscoverPage() {
  const recipes = await listPublishedRecipes();

  return (
    <section>
      <h1 className={styles.heading}>Discover</h1>
      {recipes.length === 0 ? (
        <p>No recipes published yet.</p>
      ) : (
        <ul className={styles.grid}>
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <Link href={`/recipe/${recipe.id}`} className={styles.card}>
                {recipe.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={recipe.imageUrl} alt="" className={styles.image} />
                ) : (
                  <div className={styles.imagePlaceholder} />
                )}
                <div className={styles.cardBody}>
                  <span className={styles.title}>{recipe.title}</span>
                  {recipe.description ? (
                    <span className={styles.description}>{recipe.description}</span>
                  ) : null}
                  <span className={styles.kcal}>
                    {recipe.nutrition.calories.toFixed(0)} kcal · per serving
                  </span>
                  {recipe.tags.length > 0 ? (
                    <span className={styles.tags}>
                      {recipe.tags.map((tag) => (
                        <span key={tag} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </span>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
