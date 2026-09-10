import "expo-sqlite/localStorage/install";
import { Appearance } from "react-native";

/**
 * App colour-scheme preference. "system" follows the OS setting; "light" / "dark"
 * force one. Persisted in localStorage (SQLite-backed) and applied via
 * Appearance.setColorScheme so React Native's useColorScheme() reflects it.
 *
 * NOTE: screens still use fixed light colours -- this only stores the preference
 * and flips the native appearance. Full dark theming is a follow-up.
 */
export type ThemePref = "system" | "light" | "dark";

const STORAGE_KEY = "themePref";

export function getThemePref(): ThemePref {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "light" || value === "dark" || value === "system") return value;
  } catch {
    // storage unavailable -- fall through to default
  }
  return "system";
}

export function applyThemePref(pref: ThemePref): void {
  Appearance.setColorScheme(pref === "system" ? "unspecified" : pref);
}

export function setThemePref(pref: ThemePref): void {
  try {
    localStorage.setItem(STORAGE_KEY, pref);
  } catch {
    // best effort -- still apply for this session
  }
  applyThemePref(pref);
}
