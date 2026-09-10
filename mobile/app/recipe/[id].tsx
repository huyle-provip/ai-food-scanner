import { Recipe } from "@food-scanner/shared";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { getRecipe } from "../../lib/recipes";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRecipe(id)
      .then(setRecipe)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load recipe"));
  }, [id]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

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
    <ScrollView contentContainerStyle={styles.container}>
      {recipe.imageUrl ? <Image source={{ uri: recipe.imageUrl }} style={styles.image} /> : null}
      <Text style={styles.title}>{recipe.title}</Text>
      {recipe.tags.length > 0 ? (
        <View style={styles.tagRow}>
          {recipe.tags.map((tag) => (
            <Text key={tag} style={styles.tag}>
              {tag}
            </Text>
          ))}
        </View>
      ) : null}
      {recipe.description ? <Text style={styles.description}>{recipe.description}</Text> : null}

      <View style={styles.nutritionBlock}>
        <Text style={styles.sectionTitle}>Nutrition (per serving)</Text>
        <Text style={styles.servings}>
          Makes {recipe.servings} serving{recipe.servings === 1 ? "" : "s"}
        </Text>
        <View style={styles.nutrientGrid}>
          {nutrients.map(([label, val]) => (
            <View key={label} style={styles.nutrient}>
              <Text style={styles.nutrientValue}>{val}</Text>
              <Text style={styles.nutrientLabel}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {recipe.ingredients.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients.map((item, i) => (
            <Text key={i} style={styles.listItem}>
              • {item}
            </Text>
          ))}
        </View>
      ) : null}

      {recipe.instructions ? (
        <>
          {recipe.ingredients.length > 0 ? <View style={styles.divider} /> : null}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.instructions}>{recipe.instructions}</Text>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10, alignItems: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: "100%", height: 220, borderRadius: 12, backgroundColor: "#f3f4f6" },
  title: { fontSize: 24, fontWeight: "800", textAlign: "center" },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center" },
  tag: {
    fontSize: 12,
    color: "#166534",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
  },
  description: { fontSize: 15, color: "#444", lineHeight: 21, textAlign: "center" },
  nutritionBlock: {
    width: "100%",
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ececec",
    marginVertical: 4,
  },
  servings: { fontSize: 13, color: "#777" },
  nutrientGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  nutrient: {
    width: 100,
    alignItems: "center",
    gap: 2,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ececec",
    borderRadius: 10,
  },
  nutrientValue: { fontWeight: "700", fontSize: 14 },
  nutrientLabel: { fontSize: 12, color: "#777" },
  // Ingredients + instructions: left-aligned text in a narrow centered column.
  section: {
    gap: 6,
    marginTop: 8,
    width: "100%",
    maxWidth: 420,
    alignItems: "flex-start",
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", alignSelf: "center", textAlign: "center" },
  divider: { width: "100%", borderTopWidth: 1, borderColor: "#ececec", marginVertical: 6 },
  listItem: { fontSize: 15, lineHeight: 22 },
  instructions: { fontSize: 15, lineHeight: 22, color: "#333" },
});
