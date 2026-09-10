import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NutrientForm, NutrientFormValue } from "../../components/NutrientForm";
import { useToast } from "../../components/Toast";
import { deleteMeal, getMeal, updateMeal } from "../../lib/meals";

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = useState<NutrientFormValue | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMeal(id)
      .then((meal) =>
        setValue({
          name: meal.name,
          servingSizeGrams: String(meal.servingSizeGrams),
          per100g: meal.per100g,
        })
      )
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load meal"));
  }, [id]);

  async function handleSave() {
    if (!value || saving) return;
    setSaving(true);
    try {
      await updateMeal(id, {
        name: value.name,
        servingSizeGrams: Number(value.servingSizeGrams) || 0,
        per100g: value.per100g,
      });
      toast.show("Saved to library");
      router.replace("/(tabs)/library");
    } catch (err) {
      Alert.alert("Couldn't save", err instanceof Error ? err.message : "Unknown error");
      setSaving(false);
    }
  }

  function handleDelete() {
    Alert.alert("Delete meal", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteMeal(id);
          toast.show("Meal deleted");
          router.replace("/(tabs)/library");
        },
      },
    ]);
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Edit meal",
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Text style={styles.headerCancel}>Cancel</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleSave} disabled={!value || saving} hitSlop={8}>
              <Text style={[styles.headerSave, (!value || saving) && styles.headerSaveDisabled]}>
                {saving ? "Saving…" : "Save"}
              </Text>
            </Pressable>
          ),
        }}
      />

      {error ? (
        <View style={styles.center}>
          <Text>{error}</Text>
        </View>
      ) : !value ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <NutrientForm value={value} onChange={setValue} />
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>🗑  Delete meal</Text>
          </Pressable>
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerCancel: { color: "#16a34a", fontSize: 16 },
  headerSave: { color: "#16a34a", fontSize: 16, fontWeight: "600" },
  headerSaveDisabled: { color: "#9ca3af" },
  deleteButton: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  deleteButtonText: { color: "#dc2626", fontSize: 15, fontWeight: "600" },
});
