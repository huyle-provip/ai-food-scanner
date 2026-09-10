import { Stack } from "expo-router";
import { useEffect } from "react";
import { ToastProvider } from "../components/Toast";
import { AuthProvider } from "../contexts/AuthContext";
import { applyThemePref, getThemePref } from "../lib/theme";

export default function RootLayout() {
  useEffect(() => {
    applyThemePref(getThemePref());
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            headerBackButtonDisplayMode: "minimal",
            contentStyle: { backgroundColor: "#F7F7F7" },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="login"
            options={{ headerShown: true, title: "Sign In", presentation: "modal" }}
          />
          <Stack.Screen name="recipe/[id]" options={{ headerShown: true, title: "Recipe" }} />
          <Stack.Screen name="meal/[id]" options={{ headerShown: true, title: "Edit meal" }} />
          <Stack.Screen name="meal-add" options={{ headerShown: true, title: "Add meal" }} />
          <Stack.Screen name="review" options={{ headerShown: true, title: "Review scan" }} />
        </Stack>
      </ToastProvider>
    </AuthProvider>
  );
}
