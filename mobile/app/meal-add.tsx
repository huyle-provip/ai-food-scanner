import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { NutrientForm, NutrientFormValue } from "../components/NutrientForm";
import { useToast } from "../components/Toast";
import { createMeal } from "../lib/meals";

const empty: NutrientFormValue = {
  name: "",
  servingSizeGrams: "200",
  per100g: { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0, sodiumMg: 0 },
};

export default function MealAddScreen() {
  const [value, setValue] = useState<NutrientFormValue>(empty);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function handleSave() {
    if (saving) return;
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
      toast.show("Saved to library");
      router.replace("/(tabs)/library");
    } catch (err) {
      Alert.alert("Couldn't save", err instanceof Error ? err.message : "Unknown error");
      setSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Add meal",
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Text style={styles.headerCancel}>Cancel</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleSave} disabled={saving} hitSlop={8}>
              <Text style={[styles.headerSave, saving && styles.headerSaveDisabled]}>
                {saving ? "Saving…" : "Save"}
              </Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <NutrientForm value={value} onChange={setValue} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  headerCancel: { color: "#16a34a", fontSize: 16 },
  headerSave: { color: "#16a34a", fontSize: 16, fontWeight: "600" },
  headerSaveDisabled: { color: "#9ca3af" },
});
