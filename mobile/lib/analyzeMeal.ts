import { MealAnalysisDraft } from "@food-scanner/shared";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { supabase } from "./supabase";

/**
 * Re-encodes any source image (camera capture or gallery pick, incl. HEIC/PNG)
 * to a resized JPEG. Keeps uploads small and guarantees a format the vision
 * model accepts.
 */
async function normalizeToJpeg(uri: string): Promise<string> {
  const rendered = await ImageManipulator.manipulate(uri).resize({ width: 1024 }).renderAsync();
  const result = await rendered.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });
  return result.uri;
}

/**
 * Normalizes a meal photo, uploads it to the user's private Storage folder, and
 * invokes the `analyze-meal` Edge Function to get a draft nutrient estimate.
 */
export async function analyzeMealPhoto(localUri: string): Promise<{
  draft: MealAnalysisDraft;
  photoUrl: string;
}> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not signed in");

  const jpegUri = await normalizeToJpeg(localUri);
  const response = await fetch(jpegUri);
  const arrayBuffer = await response.arrayBuffer();
  const path = `${userId}/${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("meal-photos")
    .upload(path, arrayBuffer, { contentType: "image/jpeg" });
  if (uploadError) throw uploadError;

  const { data: fnData, error: fnError } = await supabase.functions.invoke("analyze-meal", {
    body: { photoPath: path },
  });
  if (fnError) throw fnError;

  return { draft: fnData as MealAnalysisDraft, photoUrl: path };
}
