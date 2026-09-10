import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { NutrientForm, NutrientFormValue } from "../components/NutrientForm";
import { useAuth } from "../contexts/AuthContext";
import { takePendingScanDraft } from "../lib/draftStore";
import { createMeal } from "../lib/meals";

export default function ReviewScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [pending] = useState(() => takePendingScanDraft());
  const [saving, setSaving] = useState(false);
  const [value, setValue] = useState<NutrientFormValue>(() => ({
    name: pending?.draft.name ?? "Unknown meal",
    servingSizeGrams: String(pending?.draft.servingSizeGrams ?? 200),
    per100g: pending?.draft.per100g ?? {
      calories: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      fiberG: 0,
      sodiumMg: 0,
    },
  }));

  if (!pending) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text>No scan to review. Go back and scan a meal first.</Text>
      </ScrollView>
    );
  }

  async function handleSave() {
    if (!session) {
      Alert.alert("Sign in to save", "Create a free account or sign in to save this meal.", [
        { text: "Not now", style: "cancel" },
        { text: "Sign in", onPress: () => router.push("/login") },
      ]);
      return;
    }
    setSaving(true);
    try {
      await createMeal({
        name: value.name,
        source: "scan",
        photoUrl: pending!.photoUrl,
        servingSizeGrams: Number(value.servingSizeGrams) || 0,
        per100g: value.per100g,
      });
      router.replace("/(tabs)/library");
    } catch (err) {
      Alert.alert("Couldn't save", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.confidence}>
        Estimated confidence: {pending.draft.confidence}
        {pending.draft.notes ? ` — ${pending.draft.notes}` : ""}
      </Text>
      <NutrientForm value={value} onChange={setValue} />
      <Pressable style={styles.button} onPress={handleSave} disabled={saving}>
        <Text style={styles.buttonText}>
          {saving ? "Saving..." : session ? "Save Meal" : "Sign in to Save"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  confidence: { fontSize: 13, color: "#666", fontStyle: "italic" },
  button: {
    backgroundColor: "#16a34a",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
});
