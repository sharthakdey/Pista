/**
 * Runtime configuration. All values come from Vite env variables (see .env.example).
 * Never put secrets here — everything in this file ships to the browser.
 */
const env = import.meta.env;

export const API_BASE_URL = (env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
export const API_TIMEOUT_MS = Number(env.VITE_API_TIMEOUT_MS) || 60000;

const DEMO_OVERRIDE_KEY = "pista:demo-mode";

function resolveDemoMode() {
  // 1. A choice made in Settings (stored per browser) wins.
  try {
    const stored = localStorage.getItem(DEMO_OVERRIDE_KEY);
    if (stored === "true") return true;
    if (stored === "false" && API_BASE_URL) return false;
  } catch { /* storage unavailable */ }
  // 2. Explicit env flag.
  if (env.VITE_DEMO_MODE === "true") return true;
  if (env.VITE_DEMO_MODE === "false" && API_BASE_URL) return false;
  // 3. No backend configured → demo mode.
  return !API_BASE_URL;
}

export const DEMO_MODE = resolveDemoMode();

export function setDemoModeOverride(enabled) {
  try { localStorage.setItem(DEMO_OVERRIDE_KEY, String(enabled)); } catch { /* ignore */ }
  window.location.reload();
}
