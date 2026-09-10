import { GestureResponderEvent, Pressable, StyleSheet, Text, View } from "react-native";

// Structural subset of react-navigation's BottomTabBarButtonProps (not re-exported
// from the `expo-router` entry). The full props object is spread in from
// `Tabs.Screen`'s `tabBarButton` render callback.
interface ScanTabButtonProps {
  onPress?: (e: GestureResponderEvent) => void;
  accessibilityState?: { selected?: boolean };
}

/**
 * Raised circular center button for the Scan tab (TikTok-style). Passed to the
 * Scan `Tabs.Screen` via `options.tabBarButton`.
 */
export function ScanTabButton({ onPress, accessibilityState }: ScanTabButtonProps) {
  const focused = accessibilityState?.selected;
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Scan a meal"
        onPress={(e) => onPress?.(e)}
        style={[styles.button, focused && styles.buttonFocused]}
      >
        <Text style={styles.icon}>◎</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    top: -18,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#16a34a",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 4,
    borderColor: "#fff",
  },
  buttonFocused: { backgroundColor: "#15803d" },
  icon: { color: "#fff", fontSize: 28, lineHeight: 30 },
});
