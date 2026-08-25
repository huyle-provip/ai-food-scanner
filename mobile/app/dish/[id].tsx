import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NutrientForm, NutrientFormValue } from "../../components/NutrientForm";
import { deleteDish, getDish, updateDish } from "../../lib/dishes";

export default function DishDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [value, setValue] = useState<NutrientFormValue | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDish(id)
      .then((dish) =>
        setValue({
          name: dish.name,
          servingSizeGrams: String(dish.servingSizeGrams),
          per100g: dish.per100g,
        })
      )
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load dish"));
  }, [id]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!value) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateDish(id, {
        name: value!.name,
        servingSizeGrams: Number(value!.servingSizeGrams) || 0,
        per100g: value!.per100g,
      });
      router.back();
    } catch (err) {
      Alert.alert("Couldn't save", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    Alert.alert("Delete dish", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDish(id);
          router.back();
        },
      },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <NutrientForm value={value} onChange={setValue} />
      <Pressable style={styles.button} onPress={handleSave} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? "Saving..." : "Save Changes"}</Text>
      </Pressable>
      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete Dish</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  button: {
    backgroundColor: "#16a34a",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  deleteButton: { padding: 14, alignItems: "center" },
  deleteButtonText: { color: "#dc2626", fontSize: 15, fontWeight: "600" },
});
