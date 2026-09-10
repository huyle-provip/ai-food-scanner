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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instructions}>{recipe.instructions}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: "100%", height: 220, borderRadius: 12, backgroundColor: "#f3f4f6" },
  title: { fontSize: 24, fontWeight: "800" },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    fontSize: 12,
    color: "#166534",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
  },
  description: { fontSize: 15, color: "#444", lineHeight: 21 },
  section: { gap: 6, marginTop: 8 },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  listItem: { fontSize: 15, lineHeight: 22 },
  instructions: { fontSize: 15, lineHeight: 22, color: "#333" },
});
