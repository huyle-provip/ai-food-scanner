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
import { AuthForm } from "../../components/AuthForm";
import { useToast } from "../../components/Toast";
import { useAuth } from "../../contexts/AuthContext";
import { getMyProfile, updateDisplayName } from "../../lib/profile";
import { supabase } from "../../lib/supabase";

export default function ProfileScreen() {
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
        <AuthForm heading="Your Profile" subheading="Sign in to manage your account." />
      </ScrollView>
    );
  }

  return <SignedInProfile currentEmail={session.user.email ?? ""} />;
}

function SignedInProfile({ currentEmail }: { currentEmail: string }) {
  const toast = useToast();
  const { refreshProfile } = useAuth();

  const [name, setName] = useState("");
  const [loadingName, setLoadingName] = useState(true);
  const [savingName, setSavingName] = useState(false);

  const [email, setEmail] = useState(currentEmail);
  const [savingEmail, setSavingEmail] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then((p) => setName(p?.displayName ?? ""))
      .finally(() => setLoadingName(false));
  }, []);

  async function handleSaveName() {
    if (savingName) return;
    setSavingName(true);
    try {
      await updateDisplayName(name);
      await refreshProfile();
      toast.show("Name updated");
    } catch (err) {
      Alert.alert("Couldn't save name", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSavingName(false);
    }
  }

  async function handleUpdateEmail() {
    if (savingEmail) return;
    const next = email.trim();
    if (!next || next === currentEmail) {
      Alert.alert("No change", "Enter a different email address first.");
      return;
    }
    setSavingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: next });
      if (error) throw error;
      Alert.alert(
        "Confirm your new email",
        `We sent a confirmation link to ${next}. Your email changes once you tap it. ` +
          "A notice also goes to your current address."
      );
    } catch (err) {
      Alert.alert("Couldn't update email", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSavingEmail(false);
    }
  }

  async function handleUpdatePassword() {
    if (savingPassword) return;
    if (password.length < 6) {
      Alert.alert("Password too short", "Use at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Passwords don't match", "Re-enter the same password in both fields.");
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword("");
      setConfirm("");
      toast.show("Password updated");
    } catch (err) {
      Alert.alert("Couldn't update password", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Display name</Text>
        {loadingName ? (
          <ActivityIndicator style={{ alignSelf: "flex-start", marginVertical: 8 }} />
        ) : (
          <>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              maxLength={40}
            />
            <Text style={styles.hint}>Shown in the app instead of your email.</Text>
            <Pressable
              style={[styles.button, savingName && styles.buttonDisabled]}
              onPress={handleSaveName}
              disabled={savingName}
            >
              <Text style={styles.buttonText}>{savingName ? "Saving…" : "Save name"}</Text>
            </Pressable>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Text style={styles.hint}>Changing this sends a confirmation link to the new address.</Text>
        <Pressable
          style={[styles.button, savingEmail && styles.buttonDisabled]}
          onPress={handleUpdateEmail}
          disabled={savingEmail}
        >
          <Text style={styles.buttonText}>{savingEmail ? "Sending…" : "Update email"}</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>New password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="New password"
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Confirm new password"
          secureTextEntry
        />
        <Pressable
          style={[styles.button, savingPassword && styles.buttonDisabled]}
          onPress={handleUpdatePassword}
          disabled={savingPassword}
        >
          <Text style={styles.buttonText}>{savingPassword ? "Saving…" : "Update password"}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  authWrap: { flexGrow: 1, justifyContent: "center" },
  container: { padding: 16, gap: 24 },
  section: { gap: 8 },
  label: { fontSize: 13, color: "#666" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  hint: { fontSize: 12, color: "#999" },
  button: {
    backgroundColor: "#16a34a",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
