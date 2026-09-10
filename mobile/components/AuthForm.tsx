import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../lib/supabase";

interface Props {
  /** Called after a successful sign-in (not sign-up, which needs email confirmation first). */
  onSuccess?: () => void;
  heading?: string;
  subheading?: string;
}

export function AuthForm({ onSuccess, heading = "AI Food Scanner", subheading }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setNotice(null);
    if (mode === "sign-in") {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (authError) return setError(authError.message);
      onSuccess?.();
    } else {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name.trim() } },
      });
      setLoading(false);
      if (authError) return setError(authError.message);
      setNotice("Check your email to confirm your account, then sign in.");
      setMode("sign-in");
    }
  }

  async function handleForgotPassword() {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError("Enter your email above first, then tap “Forgot password”.");
      return;
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (resetError) return setError(resetError.message);
    setNotice("If that email has an account, a password reset link is on its way.");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{heading}</Text>
      {subheading ? <Text style={styles.subheading}>{subheading}</Text> : null}
      {mode === "sign-up" ? (
        <TextInput
          style={styles.input}
          placeholder="Your name"
          value={name}
          onChangeText={setName}
        />
      ) : null}
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      {notice && <Text style={styles.notice}>{notice}</Text>}
      <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? "Please wait..." : mode === "sign-in" ? "Sign In" : "Sign Up"}
        </Text>
      </Pressable>
      {mode === "sign-in" ? (
        <Pressable onPress={handleForgotPassword}>
          <Text style={styles.linkText}>Forgot password?</Text>
        </Pressable>
      ) : null}
      <Pressable onPress={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}>
        <Text style={styles.switchText}>
          {mode === "sign-in" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 12 },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center" },
  subheading: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#16a34a",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  linkText: { textAlign: "center", color: "#16a34a", fontSize: 13 },
  switchText: { textAlign: "center", color: "#16a34a", marginTop: 4 },
  error: { color: "#dc2626" },
  notice: { color: "#15803d" },
});
