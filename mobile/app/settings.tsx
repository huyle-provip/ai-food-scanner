import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useToast } from "../components/Toast";
import { useAuth } from "../contexts/AuthContext";
import { getMyProfile, updateDisplayName } from "../lib/profile";
import { supabase } from "../lib/supabase";

export default function SettingsScreen() {
  const router = useRouter();
  const toast = useToast();
  const { session } = useAuth();
  const email = session?.user.email ?? "";

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then((p) => setName(p?.displayName ?? ""))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      await updateDisplayName(name);
      toast.show("Saved");
      router.back();
    } catch (err) {
      Alert.alert("Couldn't save", err instanceof Error ? err.message : "Unknown error");
      setSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Text style={styles.headerCancel}>Cancel</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleSave} disabled={saving || loading} hitSlop={8}>
              <Text style={[styles.headerSave, (saving || loading) && styles.headerSaveDisabled]}>
                {saving ? "Saving…" : "Save"}
              </Text>
            </Pressable>
          ),
        }}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <View>
            <Text style={styles.label}>Display name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              maxLength={40}
            />
            <Text style={styles.hint}>Shown in the app instead of your email.</Text>
          </View>

          <View>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.readonly}>{email}</Text>
            <Text style={styles.hint}>Used to sign in. Contact support to change it.</Text>
          </View>

          <Pressable style={styles.signOut} onPress={() => supabase.auth.signOut()}>
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerCancel: { color: "#16a34a", fontSize: 16 },
  headerSave: { color: "#16a34a", fontSize: 16, fontWeight: "600" },
  headerSaveDisabled: { color: "#9ca3af" },
  label: { fontSize: 13, color: "#666", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  readonly: { fontSize: 16, color: "#222", paddingVertical: 4 },
  hint: { fontSize: 12, color: "#999", marginTop: 4 },
  signOut: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  signOutText: { color: "#dc2626", fontSize: 15, fontWeight: "600" },
});
