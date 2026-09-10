import { useRouter } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { AuthForm } from "../components/AuthForm";

export default function LoginScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AuthForm
        subheading="Sign in to save meals and see your library."
        onSuccess={() => {
          // Return to wherever the user was (e.g. the scan review screen).
          if (router.canGoBack()) router.back();
          else router.replace("/(tabs)/library");
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center" },
});
