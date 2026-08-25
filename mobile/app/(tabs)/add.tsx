import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { NutrientForm, NutrientFormValue } from "../../components/NutrientForm";
import { createMeal } from "../../lib/meals";

const empty: NutrientFormValue = {
  name: "",
  servingSizeGrams: "200",
  per100g: { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0, sodiumMg: 0 },
};

export default function AddManuallyScreen() {
  const [value, setValue] = useState<NutrientFormValue>(empty);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSave() {
    if (!value.name.trim()) {
      Alert.alert("Name required", "Give this meal a name before saving.");
      return;
    }
    setSaving(true);
    try {
      await createMeal({
        name: value.name.trim(),
        source: "manual",
        servingSizeGrams: Number(value.servingSizeGrams) || 0,
        per100g: value.per100g,
      });
      setValue(empty);
      router.push("/(tabs)/history");
    } catch (err) {
      Alert.alert("Couldn't save", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <NutrientForm value={value} onChange={setValue} />
      <Pressable style={styles.button} onPress={handleSave} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? "Saving..." : "Save Meal"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  button: {
    backgroundColor: "#16a34a",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
});
