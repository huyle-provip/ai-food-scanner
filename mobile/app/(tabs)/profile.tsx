import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

export default function ProfileScreen() {
  const { session } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.email}>{session?.user.email}</Text>
      <Pressable style={styles.button} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16, justifyContent: "center" },
  email: { fontSize: 16, textAlign: "center", color: "#333" },
  button: {
    backgroundColor: "#dc2626",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
});
