import { Recipe } from "@food-scanner/shared";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { RecipeCard } from "../../components/RecipeCard";
import { listPublishedRecipes } from "../../lib/recipes";

export default function HomeFeedScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    setError(null);
    try {
      setRecipes(await listPublishedRecipes());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recipes");
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading && recipes.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={recipes}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={<Text style={styles.header}>Discover</Text>}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text>{error ?? "No recipes yet. Check back soon."}</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable onPress={() => router.push(`/recipe/${item.id}`)}>
          <RecipeCard recipe={item} />
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 14 },
  header: { fontSize: 26, fontWeight: "800", marginBottom: 2 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
});
