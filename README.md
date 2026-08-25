# ai-food-scanner

Scan a meal with your phone's camera to get an estimated calorie/nutrient breakdown, save it, edit it later if the estimate is off, or add dishes manually. A companion website shows the same saved dishes, scoped to your account.

## Structure

- [`mobile/`](mobile) — Expo (React Native) app: camera scan, history, manual add, per-dish edit.
- [`web/`](web) — Next.js app: same data, browser-based view/edit.
- [`supabase/`](supabase) — Postgres schema + RLS policies (migrations) and the `analyze-meal` Edge Function.
- [`packages/shared/`](packages/shared) — TypeScript types shared by `mobile` and `web` (npm workspace).

## How a scan becomes a saved dish

1. Mobile app captures a photo and uploads it to the user's private folder in the `meal-photos` Storage bucket.
2. It invokes the `analyze-meal` Edge Function, which asks Claude (vision) to identify the dish, estimate portion size, and estimate per-100g nutrients; it then tries to refine those nutrients with an authoritative match from USDA FoodData Central.
3. The app shows the result on an editable review screen — nothing is saved yet.
4. On confirm, the (possibly edited) values are inserted into the `dishes` table, scoped to the signed-in user via Row Level Security.
5. History (mobile) and the dashboard (web) list `dishes` for the current user; both support editing or deleting a saved entry, and mobile/web can both add a dish manually with no scan at all.

## One-time setup

1. **Create a Supabase project** at supabase.com, then apply the schema:
   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
2. **Set Edge Function secrets** (Anthropic + USDA keys; Supabase URL/keys are auto-provided to functions):
   ```bash
   npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-... FDC_API_KEY=...
   ```
   To test the full scan → review → save flow without spending anything on API calls, set `MOCK_ANALYSIS=true` instead (or in addition, it takes priority) — the function still uploads/downloads the real photo but returns a randomized canned nutrient estimate instead of calling Claude/USDA:
   ```bash
   npx supabase secrets set MOCK_ANALYSIS=true
   ```
   Unset it (`npx supabase secrets set MOCK_ANALYSIS=false` or `npx supabase secrets unset MOCK_ANALYSIS`) once you're ready for real estimates.
3. **Deploy the Edge Function**:
   ```bash
   npx supabase functions deploy analyze-meal
   ```
4. **Configure each app's env vars** — copy `.env.example` to `.env` in both `mobile/` and `web/`, filling in your Supabase project URL and anon key (Project Settings → API in the Supabase dashboard).

## Running locally

```bash
npm install          # installs and links all workspaces (mobile, web, packages/shared)

cd mobile && npm start    # Expo dev server — scan the QR code with Expo Go, or press i/a for a simulator
cd web && npm run dev     # Next.js dev server on http://localhost:3000
```

## Building the iOS app without a Mac

[EAS Build](https://docs.expo.dev/build/introduction/) compiles and signs the iOS app in the cloud:

```bash
cd mobile
npx eas login
npx eas build --platform ios --profile preview   # installable build, no App Store submission
```

Use the `production` profile plus `npx eas submit` when you're ready to publish to the App Store — that step still requires an active Apple Developer account, but not a physical Mac.
