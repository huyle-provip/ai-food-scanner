import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" options={{ headerShown: true, title: "Sign In", presentation: "modal" }} />
        <Stack.Screen name="recipe/[id]" options={{ headerShown: true, title: "Recipe" }} />
        <Stack.Screen name="meal/[id]" options={{ headerShown: true, title: "Meal" }} />
        <Stack.Screen name="meal-add" options={{ headerShown: true, title: "Add Meal" }} />
        <Stack.Screen name="review" options={{ headerShown: true, title: "Review Scan" }} />
      </Stack>
    </AuthProvider>
  );
}
