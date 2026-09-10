import Constants from "expo-constants";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { getThemePref, setThemePref, type ThemePref } from "../../lib/theme";

const THEME_OPTIONS: { value: ThemePref; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export default function SettingsScreen() {
  const { session } = useAuth();
  const [theme, setTheme] = useState<ThemePref>(() => getThemePref());

  function pickTheme(next: ThemePref) {
    setTheme(next);
    setThemePref(next);
  }

  function handleSignOut() {
    Alert.alert("Sign out?", "You'll need to sign in again to see your library.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => supabase.auth.signOut() },
    ]);
  }

  const version =
    Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? "dev";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Appearance</Text>
        <View style={styles.segment}>
          {THEME_OPTIONS.map((opt) => {
            const active = theme === opt.value;
            return (
              <Pressable
                key={opt.value}
                style={[styles.segmentItem, active && styles.segmentItemActive]}
                onPress={() => pickTheme(opt.value)}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.hint}>
          Full dark theme is still in progress — this saves your preference and switches the
          system appearance.
        </Text>
      </View>

      {session ? (
        <View style={styles.section}>
          <Text style={styles.label}>Account</Text>
          <Text style={styles.readonly}>{session.user.email}</Text>
          <Pressable style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Sign out</Text>
          </Pressable>
        </View>
      ) : null}

      <Text style={styles.version}>Version {version}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 24 },
  section: { gap: 8 },
  label: { fontSize: 13, color: "#666" },
  hint: { fontSize: 12, color: "#999" },
  readonly: { fontSize: 16, color: "#222", paddingVertical: 4 },
  segment: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    overflow: "hidden",
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  segmentItemActive: { backgroundColor: "#16a34a" },
  segmentText: { fontSize: 14, color: "#374151", fontWeight: "500" },
  segmentTextActive: { color: "#fff" },
  signOutButton: {
    backgroundColor: "#dc2626",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  signOutButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  version: { fontSize: 12, color: "#9ca3af", textAlign: "center", marginTop: 8 },
});
