import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Animated, StyleSheet, Text } from "react-native";

interface ToastContextValue {
  show: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (text: string) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setMessage(text);
      Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
      hideTimer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(
          () => setMessage(null)
        );
      }, 2200);
    },
    [opacity]
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message !== null && (
        <Animated.View style={[styles.toast, { opacity }]} pointerEvents="none">
          <Text style={styles.text}>{message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 90,
    alignSelf: "center",
    backgroundColor: "#111827",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    maxWidth: "88%",
  },
  text: { color: "#fff", fontSize: 14, fontWeight: "600", textAlign: "center" },
});
