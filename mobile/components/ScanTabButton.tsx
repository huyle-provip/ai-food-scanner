import { Ionicons } from "@expo/vector-icons";
import { GestureResponderEvent, Pressable, StyleSheet, View } from "react-native";

// Structural subset of react-navigation's BottomTabBarButtonProps (not re-exported
// from the `expo-router` entry). The full props object is spread in from
// `Tabs.Screen`'s `tabBarButton` render callback.
interface ScanTabButtonProps {
  onPress?: (e: GestureResponderEvent) => void;
  accessibilityState?: { selected?: boolean };
}

/** White camera glyph inside a corner-bracket "scan frame". */
function ScanGlyph() {
  return (
    <View style={styles.glyph}>
      <View style={[styles.corner, styles.tl]} />
      <View style={[styles.corner, styles.tr]} />
      <View style={[styles.corner, styles.bl]} />
      <View style={[styles.corner, styles.br]} />
      <Ionicons name="camera" size={20} color="#fff" />
    </View>
  );
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
        <ScanGlyph />
      </Pressable>
    </View>
  );
}

const LINE = 2.5;
const CORNER = 8;

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
  glyph: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  corner: {
    position: "absolute",
    width: CORNER,
    height: CORNER,
    borderColor: "#fff",
  },
  tl: { top: 0, left: 0, borderTopWidth: LINE, borderLeftWidth: LINE, borderTopLeftRadius: 3 },
  tr: { top: 0, right: 0, borderTopWidth: LINE, borderRightWidth: LINE, borderTopRightRadius: 3 },
  bl: {
    bottom: 0,
    left: 0,
    borderBottomWidth: LINE,
    borderLeftWidth: LINE,
    borderBottomLeftRadius: 3,
  },
  br: {
    bottom: 0,
    right: 0,
    borderBottomWidth: LINE,
    borderRightWidth: LINE,
    borderBottomRightRadius: 3,
  },
});
