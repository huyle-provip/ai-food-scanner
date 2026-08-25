import { NutrientProfile, scaleNutrients } from "@food-scanner/shared";
import { StyleSheet, Text, TextInput, View } from "react-native";

export interface NutrientFormValue {
  name: string;
  servingSizeGrams: string;
  per100g: NutrientProfile;
}

interface Props {
  value: NutrientFormValue;
  onChange: (value: NutrientFormValue) => void;
}

function Field({
  label,
  value,
  onChangeText,
  unit,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  unit: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
      />
      <Text style={styles.unit}>{unit}</Text>
    </View>
  );
}

/** Edits a meal's name, serving size, and per-100g nutrients; shows the scaled totals for the current serving. */
export function NutrientForm({ value, onChange }: Props) {
  const servingGrams = Number(value.servingSizeGrams) || 0;
  const scaled = scaleNutrients(value.per100g, servingGrams);

  function setPer100g(patch: Partial<NutrientProfile>) {
    onChange({ ...value, per100g: { ...value.per100g, ...patch } });
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={value.name}
          onChangeText={(name) => onChange({ ...value, name })}
        />
      </View>

      <Field
        label="Serving size"
        unit="g"
        value={value.servingSizeGrams}
        onChangeText={(servingSizeGrams) => onChange({ ...value, servingSizeGrams })}
      />

      <Text style={styles.sectionTitle}>Nutrients per 100g</Text>
      <Field
        label="Calories"
        unit="kcal"
        value={String(value.per100g.calories)}
        onChangeText={(t) => setPer100g({ calories: Number(t) || 0 })}
      />
      <Field
        label="Protein"
        unit="g"
        value={String(value.per100g.proteinG)}
        onChangeText={(t) => setPer100g({ proteinG: Number(t) || 0 })}
      />
      <Field
        label="Carbs"
        unit="g"
        value={String(value.per100g.carbsG)}
        onChangeText={(t) => setPer100g({ carbsG: Number(t) || 0 })}
      />
      <Field
        label="Fat"
        unit="g"
        value={String(value.per100g.fatG)}
        onChangeText={(t) => setPer100g({ fatG: Number(t) || 0 })}
      />
      <Field
        label="Fiber"
        unit="g"
        value={String(value.per100g.fiberG)}
        onChangeText={(t) => setPer100g({ fiberG: Number(t) || 0 })}
      />
      <Field
        label="Sodium"
        unit="mg"
        value={String(value.per100g.sodiumMg)}
        onChangeText={(t) => setPer100g({ sodiumMg: Number(t) || 0 })}
      />

      <Text style={styles.sectionTitle}>Total for this serving ({servingGrams}g)</Text>
      <Text style={styles.totalLine}>{scaled.calories.toFixed(0)} kcal</Text>
      <Text style={styles.totalLine}>
        Protein {scaled.proteinG.toFixed(1)}g · Carbs {scaled.carbsG.toFixed(1)}g · Fat{" "}
        {scaled.fatG.toFixed(1)}g
      </Text>
      <Text style={styles.totalLine}>
        Fiber {scaled.fiberG.toFixed(1)}g · Sodium {scaled.sodiumMg.toFixed(0)}mg
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { width: 100, fontSize: 15 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
  },
  unit: { width: 40, fontSize: 13, color: "#666" },
  sectionTitle: { fontSize: 14, fontWeight: "600", marginTop: 12, color: "#444" },
  totalLine: { fontSize: 14, color: "#222" },
});
