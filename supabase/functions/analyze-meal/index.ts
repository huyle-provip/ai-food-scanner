// Supabase Edge Function (Deno runtime): given a photo already uploaded to the
// user's private `meal-photos` storage folder, identifies the dish with Claude
// vision, looks up authoritative per-100g nutrients from USDA FoodData Central
// when a match is found, and returns a draft for the client to review/edit
// before it gets saved as a `dishes` row. Nothing is written to the database
// here -- the client does that after the user confirms/edits the draft.
import { createClient } from "npm:@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const ANTHROPIC_MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-5";
const FDC_API_KEY = Deno.env.get("FDC_API_KEY") ?? "DEMO_KEY";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// When "true", skips the paid Claude + USDA calls entirely and returns a
// randomized canned estimate instead, so the full scan -> review -> save
// flow can be tested end-to-end for $0. Toggle with:
//   npx supabase secrets set MOCK_ANALYSIS=true
const MOCK_ANALYSIS = (Deno.env.get("MOCK_ANALYSIS") ?? "false").toLowerCase() === "true";

interface NutrientProfile {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sodiumMg: number;
}

interface VisionEstimate {
  name: string;
  servingSizeGrams: number;
  per100g: NutrientProfile;
  confidence: "low" | "medium" | "high";
  notes?: string;
}

const FDC_NUTRIENT_IDS = {
  calories: 1008,
  proteinG: 1003,
  carbsG: 1005,
  fatG: 1004,
  fiberG: 1079,
  sodiumMg: 1093,
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing Authorization header" }, 401);
    }

    const { photoPath } = await req.json();
    if (!photoPath || typeof photoPath !== "string") {
      return jsonResponse({ error: "photoPath is required" }, 400);
    }

    // Verify the caller's JWT with the anon-key client (does not bypass RLS),
    // then use a service-role client only to read the already-authorized path.
    const authedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await authedClient.auth.getUser();
    if (userError || !userData.user) {
      return jsonResponse({ error: "Invalid session" }, 401);
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    if (!photoPath.startsWith(`${userData.user.id}/`)) {
      return jsonResponse({ error: "photoPath does not belong to the caller" }, 403);
    }

    const { data: photoBlob, error: downloadError } = await admin.storage
      .from("meal-photos")
      .download(photoPath);
    if (downloadError || !photoBlob) {
      return jsonResponse({ error: `Could not read photo: ${downloadError?.message}` }, 404);
    }
    // Photo is downloaded even in mock mode, so the real Storage/RLS path is
    // still exercised -- only the paid external API calls are skipped below.
    const photoBase64 = arrayBufferToBase64(await photoBlob.arrayBuffer());

    if (MOCK_ANALYSIS) {
      return jsonResponse(pickMockEstimate(), 200);
    }

    const estimate = await estimateWithClaude(photoBase64);
    const usdaMatch = await lookupUsdaPer100g(estimate.name);

    const draft = {
      name: estimate.name,
      servingSizeGrams: estimate.servingSizeGrams,
      per100g: usdaMatch ?? estimate.per100g,
      confidence: usdaMatch ? "high" : estimate.confidence,
      notes: usdaMatch
        ? `Nutrients from USDA FoodData Central. ${estimate.notes ?? ""}`.trim()
        : `Nutrients estimated by AI (no USDA match found). ${estimate.notes ?? ""}`.trim(),
    };

    return jsonResponse(draft, 200);
  } catch (err) {
    console.error(err);
    return jsonResponse({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

const MOCK_ESTIMATES: VisionEstimate[] = [
  {
    name: "Grilled Chicken Salad",
    servingSizeGrams: 350,
    per100g: { calories: 120, proteinG: 12, carbsG: 6, fatG: 5, fiberG: 2, sodiumMg: 250 },
    confidence: "medium",
    notes: "Mock data -- no AI call was made.",
  },
  {
    name: "Beef Pho",
    servingSizeGrams: 500,
    per100g: { calories: 90, proteinG: 6, carbsG: 10, fatG: 3, fiberG: 1, sodiumMg: 400 },
    confidence: "medium",
    notes: "Mock data -- no AI call was made.",
  },
  {
    name: "Margherita Pizza Slice",
    servingSizeGrams: 120,
    per100g: { calories: 266, proteinG: 11, carbsG: 33, fatG: 10, fiberG: 2, sodiumMg: 598 },
    confidence: "medium",
    notes: "Mock data -- no AI call was made.",
  },
  {
    name: "Steamed Rice with Vegetables",
    servingSizeGrams: 300,
    per100g: { calories: 130, proteinG: 3, carbsG: 27, fatG: 1, fiberG: 2, sodiumMg: 150 },
    confidence: "low",
    notes: "Mock data -- no AI call was made.",
  },
];

function pickMockEstimate(): VisionEstimate {
  return MOCK_ESTIMATES[Math.floor(Math.random() * MOCK_ESTIMATES.length)];
}

async function estimateWithClaude(photoBase64: string): Promise<VisionEstimate> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: photoBase64 } },
            {
              type: "text",
              text:
                "You are a nutrition estimation assistant. Identify the dish in this photo and " +
                "estimate its nutrition. Respond with ONLY a JSON object (no markdown, no prose) " +
                "matching this exact shape:\n" +
                '{"name": string, "servingSizeGrams": number, "per100g": {"calories": number, ' +
                '"proteinG": number, "carbsG": number, "fatG": number, "fiberG": number, ' +
                '"sodiumMg": number}, "confidence": "low" | "medium" | "high", "notes": string}\n' +
                "`servingSizeGrams` is your best estimate of the total plated portion weight in " +
                "grams. `per100g` values are per 100 grams of the dish, not for the whole portion.",
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error("Claude returned no content");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Claude response did not contain JSON");
  return JSON.parse(jsonMatch[0]) as VisionEstimate;
}

async function lookupUsdaPer100g(dishName: string): Promise<NutrientProfile | null> {
  try {
    const searchUrl = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
    searchUrl.searchParams.set("api_key", FDC_API_KEY);
    searchUrl.searchParams.set("query", dishName);
    searchUrl.searchParams.set("pageSize", "1");
    searchUrl.searchParams.set("dataType", "Survey (FNDDS),SR Legacy");

    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) return null;
    const searchData = await searchResponse.json();
    const food = searchData.foods?.[0];
    if (!food) return null;

    const getNutrient = (id: number) =>
      food.foodNutrients?.find((n: { nutrientId: number }) => n.nutrientId === id)?.value ?? 0;

    return {
      calories: getNutrient(FDC_NUTRIENT_IDS.calories),
      proteinG: getNutrient(FDC_NUTRIENT_IDS.proteinG),
      carbsG: getNutrient(FDC_NUTRIENT_IDS.carbsG),
      fatG: getNutrient(FDC_NUTRIENT_IDS.fatG),
      fiberG: getNutrient(FDC_NUTRIENT_IDS.fiberG),
      sodiumMg: getNutrient(FDC_NUTRIENT_IDS.sodiumMg),
    };
  } catch {
    // USDA lookup is a best-effort refinement; Claude's own estimate is the fallback.
    return null;
  }
}
