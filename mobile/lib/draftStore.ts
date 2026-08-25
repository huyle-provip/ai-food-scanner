import { MealAnalysisDraft } from "@food-scanner/shared";

// In-memory handoff for the not-yet-saved scan draft between the Scan screen
// and the Review screen. Deliberately not persisted: a pending scan draft
// is only ever meant to survive the single in-app navigation to review it.
let pendingDraft: { draft: MealAnalysisDraft; photoUrl: string } | null = null;

export function setPendingScanDraft(value: { draft: MealAnalysisDraft; photoUrl: string }) {
  pendingDraft = value;
}

export function takePendingScanDraft() {
  const value = pendingDraft;
  pendingDraft = null;
  return value;
}
