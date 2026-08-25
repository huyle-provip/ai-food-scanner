import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="dish/[id]" options={{ headerShown: true, title: "Dish" }} />
        <Stack.Screen name="review" options={{ headerShown: true, title: "Review Scan" }} />
      </Stack>
    </AuthProvider>
  );
}
