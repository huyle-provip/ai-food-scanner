import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { analyzeMealPhoto } from "../../lib/analyzeMeal";
import { setPendingScanDraft } from "../../lib/draftStore";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!permission) {
    return <View style={styles.center} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Camera access is needed to scan your meals.</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  async function analyze(uri: string) {
    setAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeMealPhoto(uri);
      setPendingScanDraft(result);
      router.push("/review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze photo");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleCapture() {
    if (!cameraRef.current || analyzing) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    if (photo) analyze(photo.uri);
  }

  async function handlePickFromGallery() {
    if (analyzing) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) analyze(result.assets[0].uri);
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      <View style={styles.controls}>
        {error && <Text style={styles.error}>{error}</Text>}
        <Text style={styles.hint}>Tap the icon to pick a photo from your gallery</Text>
        <View style={styles.controlRow}>
          <Pressable
            style={styles.galleryButton}
            onPress={handlePickFromGallery}
            disabled={analyzing}
            accessibilityLabel="Choose a photo from your gallery"
          >
            <Ionicons name="images" size={22} color="#fff" />
          </Pressable>
          <Pressable style={styles.captureButton} onPress={handleCapture} disabled={analyzing}>
            {analyzing ? <ActivityIndicator color="white" /> : <View style={styles.captureInner} />}
          </Pressable>
          <View style={styles.galleryButtonSpacer} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  camera: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 12 },
  message: { textAlign: "center", fontSize: 16 },
  controls: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 10,
  },
  hint: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 34,
  },
  galleryButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryButtonSpacer: { width: 44 },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderWidth: 4,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  captureInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: "white" },
  button: {
    backgroundColor: "#16a34a",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  error: { color: "#fca5a5", backgroundColor: "rgba(0,0,0,0.5)", padding: 8, borderRadius: 8 },
});
