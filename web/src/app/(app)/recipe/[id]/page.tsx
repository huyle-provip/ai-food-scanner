import { notFound } from "next/navigation";
import { getPublishedRecipe } from "@/lib/recipes";
import styles from "./page.module.css";

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = await getPublishedRecipe(id);
  if (!recipe) notFound();

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

      {recipe.ingredients.length > 0 ? (
        <>
          <h2 className={styles.sectionTitle}>Ingredients</h2>
          <ul className={styles.ingredients}>
            {recipe.ingredients.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </>
      ) : null}

      {recipe.instructions ? (
        <>
          <h2 className={styles.sectionTitle}>Instructions</h2>
          <p className={styles.instructions}>{recipe.instructions}</p>
        </>
      ) : null}
    </article>
  );
}
