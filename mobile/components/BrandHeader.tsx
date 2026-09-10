import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { BrandLogo } from "./BrandLogo";

/** Max characters shown for the header name before it gets an ellipsis. */
const NAME_MAX = 14;

/**
 * Brand mark + wordmark for the navigator header title slot (mirrors the web
 * header). Rendered inside React Navigation's own header, so it does not handle
 * the status-bar inset itself -- the navigator does.
 */
export function BrandHeaderTitle() {
  const router = useRouter();

  return (
    <Pressable
      style={styles.brand}
      onPress={() => router.navigate("/")}
      accessibilityRole="link"
      accessibilityLabel="AI Food Scanner, go to home"
    >
      <BrandLogo size={26} />
      <Text style={styles.title}>AI Food Scanner</Text>
    </Pressable>
  );
}

/** Signed-in user's display name, shown on the right of the header. */
export function HeaderUserName() {
  const { displayName } = useAuth();
  if (!displayName) return null;

  const shown =
    displayName.length > NAME_MAX ? `${displayName.slice(0, NAME_MAX - 1).trimEnd()}…` : displayName;

  return (
    <Text style={styles.userName} numberOfLines={1}>
      {shown}
    </Text>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    maxWidth: 140,
    marginRight: 12,
  },
});
