import { notFound } from "next/navigation";
import { getPublishedRecipe } from "@/lib/recipes";
import styles from "./page.module.css";

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = await getPublishedRecipe(id);
  if (!recipe) notFound();

  const n = recipe.nutrition;
  const nutrients: [string, string][] = [
    ["Calories", `${n.calories.toFixed(0)} kcal`],
    ["Protein", `${n.proteinG.toFixed(1)} g`],
    ["Carbs", `${n.carbsG.toFixed(1)} g`],
    ["Fat", `${n.fatG.toFixed(1)} g`],
    ["Fiber", `${n.fiberG.toFixed(1)} g`],
    ["Sodium", `${n.sodiumMg.toFixed(0)} mg`],
  ];

  return (
    <article className={styles.article}>
      {recipe.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={recipe.imageUrl} alt="" className={styles.image} />
      ) : null}
      <h1 className={styles.title}>{recipe.title}</h1>
      {recipe.tags.length > 0 ? (
        <div className={styles.tags}>
          {recipe.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      {recipe.description ? <p className={styles.description}>{recipe.description}</p> : null}

      <section className={styles.nutrition}>
        <h2 className={styles.sectionTitle}>Nutrition (per serving)</h2>
        <p className={styles.servings}>Makes {recipe.servings} serving{recipe.servings === 1 ? "" : "s"}</p>
        <div className={styles.nutrientGrid}>
          {nutrients.map(([label, val]) => (
            <div key={label} className={styles.nutrient}>
              <span className={styles.nutrientValue}>{val}</span>
              <span className={styles.nutrientLabel}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {recipe.ingredients.length > 0 ? (
        <section className={styles.block}>
          <h2 className={styles.sectionTitle}>Ingredients</h2>
          <ul className={styles.ingredients}>
            {recipe.ingredients.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {recipe.instructions ? (
        <>
          {recipe.ingredients.length > 0 ? <hr className={styles.divider} /> : null}
          <section className={styles.block}>
            <h2 className={styles.sectionTitle}>Instructions</h2>
            <p className={styles.instructions}>{recipe.instructions}</p>
          </section>
        </>
      ) : null}
    </article>
  );
}
