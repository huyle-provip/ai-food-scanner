import { Recipe } from "@food-scanner/shared";
import { Image, StyleSheet, Text, View } from "react-native";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <View style={styles.card}>
      {recipe.imageUrl ? (
        <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}
      <View style={styles.body}>
        <Text style={styles.title}>{recipe.title}</Text>
        {recipe.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {recipe.description}
          </Text>
        ) : null}
        {recipe.tags.length > 0 ? (
          <View style={styles.tagRow}>
            {recipe.tags.map((tag) => (
              <Text key={tag} style={styles.tag}>
                {tag}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    backgroundColor: "#fff",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },
  image: { width: "100%", height: 180, backgroundColor: "#f3f4f6" },
  imagePlaceholder: { alignItems: "center", justifyContent: "center" },
  body: { padding: 14, gap: 6 },
  title: { fontSize: 17, fontWeight: "700" },
  description: { fontSize: 14, color: "#555" },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 },
  tag: {
    fontSize: 12,
    color: "#166534",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
  },
});
