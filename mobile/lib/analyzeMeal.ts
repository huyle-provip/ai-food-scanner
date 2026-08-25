import { MealAnalysisDraft } from "@food-scanner/shared";
import { supabase } from "./supabase";

/**
 * Uploads a captured meal photo to the user's private Storage folder and
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

  const response = await fetch(localUri);
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
