import { MealAnalysisDraft } from "@food-scanner/shared";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { supabase } from "./supabase";

/**
 * Re-encodes any source image (camera capture or gallery pick, incl. HEIC/PNG)
 * to a resized JPEG. Keeps payloads small and guarantees a format the vision
 * model accepts. Returns both a local file URI and the base64 payload.
 */
async function normalizeToJpeg(uri: string): Promise<{ uri: string; base64: string }> {
  const rendered = await ImageManipulator.manipulate(uri).resize({ width: 1024 }).renderAsync();
  const result = await rendered.saveAsync({ compress: 0.7, format: SaveFormat.JPEG, base64: true });
  return { uri: result.uri, base64: result.base64 ?? "" };
}

/**
 * Normalizes a meal photo and invokes the `analyze-meal` Edge Function for a
 * draft nutrient estimate.
 *
 * Scanning does not require an account: anonymous callers send the image inline
 * and nothing is persisted. When the user is signed in, the photo is also saved
 * to their private `meal-photos` Storage folder so a saved meal can reference it
 * (the returned `photoUrl` is that path, or "" when anonymous).
 */
export async function analyzeMealPhoto(localUri: string): Promise<{
  draft: MealAnalysisDraft;
  photoUrl: string;
}> {
  const jpeg = await normalizeToJpeg(localUri);

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id ?? null;

  let photoPath = "";
  if (userId) {
    photoPath = `${userId}/${Date.now()}.jpg`;
    const arrayBuffer = await (await fetch(jpeg.uri)).arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("meal-photos")
      .upload(photoPath, arrayBuffer, { contentType: "image/jpeg" });
    if (uploadError) throw uploadError;
  }

  const { data: fnData, error: fnError } = await supabase.functions.invoke("analyze-meal", {
    body: userId ? { photoPath } : { imageBase64: jpeg.base64 },
  });
  if (fnError) throw fnError;

  return { draft: fnData as MealAnalysisDraft, photoUrl: photoPath };
}
