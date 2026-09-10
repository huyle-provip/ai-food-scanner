import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { ToastProvider } from "../components/Toast";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#F7F7F7" } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="login"
            options={{ headerShown: true, title: "Sign In", presentation: "modal" }}
          />
          <Stack.Screen name="recipe/[id]" options={{ headerShown: true, title: "Recipe" }} />
          <Stack.Screen name="meal/[id]" options={{ headerShown: true, title: "Edit meal" }} />
          <Stack.Screen name="meal-add" options={{ headerShown: true, title: "Add meal" }} />
          <Stack.Screen name="review" options={{ headerShown: true, title: "Review scan" }} />
          <Stack.Screen name="settings" options={{ headerShown: true, title: "Settings" }} />
        </Stack>
      </ToastProvider>
    </AuthProvider>
  );
}
