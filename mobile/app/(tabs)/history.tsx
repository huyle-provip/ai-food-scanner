import { Dish } from "@food-scanner/shared";
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
import { listDishes } from "../../lib/dishes";

export default function HistoryScreen() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDishes(await listDishes());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dishes");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading && dishes.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={dishes}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text>{error ?? "No saved dishes yet. Scan or add one to get started."}</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => router.push(`/dish/${item.id}`)}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>
            {item.servingSizeGrams}g · {item.calories.toFixed(0)} kcal ·{" "}
            {item.source === "scan" ? "scanned" : "manual"}
          </Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  card: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    gap: 4,
  },
  name: { fontSize: 16, fontWeight: "600" },
  meta: { fontSize: 13, color: "#555" },
});
