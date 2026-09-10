import { Meal, resolveDisplayName } from "@food-scanner/shared";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AuthForm } from "../../components/AuthForm";
import { useAuth } from "../../contexts/AuthContext";
import { listMeals } from "../../lib/meals";
import { getMyProfile } from "../../lib/profile";

export default function LibraryScreen() {
  const { session, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!session) {
    return (
      <ScrollView contentContainerStyle={styles.authWrap}>
        <AuthForm
          heading="Your Library"
          subheading="Sign in to see your saved meals and diet settings."
        />
      </ScrollView>
    );
  }

  return <SignedInLibrary email={session.user.email ?? ""} />;
}

function SignedInLibrary({ email }: { email: string }) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    setError(null);
    try {
      const [mealList, profile] = await Promise.all([listMeals(), getMyProfile()]);
      setMeals(mealList);
      setDisplayName(profile?.displayName ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load meals");
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

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={meals}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <View style={styles.headerBlock}>
          <Text style={styles.title}>My Meals</Text>
          <Text style={styles.greeting}>{resolveDisplayName(displayName, email)}</Text>
          <Pressable style={styles.addButton} onPress={() => router.push("/meal-add")}>
            <Text style={styles.addButtonText}>+ Add manually</Text>
          </Pressable>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Diet preferences</Text>
            <Text style={styles.settingHint}>coming soon</Text>
          </View>
        </View>
      }
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} />
        ) : (
          <Text style={styles.empty}>{error ?? "No saved meals yet. Scan or add one."}</Text>
        )
      }
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => router.push(`/meal/${item.id}`)}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardMeta}>
            {item.servingSizeGrams}g · {item.calories.toFixed(0)} kcal ·{" "}
            {item.source === "scan" ? "scanned" : "manual"}
          </Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  authWrap: { flexGrow: 1, justifyContent: "center" },
  list: { padding: 16, gap: 10 },
  headerBlock: { gap: 10, marginBottom: 6 },
  title: { fontSize: 24, fontWeight: "800" },
  greeting: { fontSize: 14, color: "#444", fontWeight: "500" },
  addButton: {
    backgroundColor: "#16a34a",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  addButtonText: { color: "white", fontWeight: "600" },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  settingText: { fontSize: 15 },
  settingHint: { fontSize: 13, color: "#999" },
  chevron: { fontSize: 20, color: "#bbb" },
  empty: { textAlign: "center", color: "#666", marginTop: 24 },
  card: { padding: 14, borderRadius: 10, backgroundColor: "#f3f4f6", gap: 4 },
  cardName: { fontSize: 16, fontWeight: "600" },
  cardMeta: { fontSize: 13, color: "#555" },
});
