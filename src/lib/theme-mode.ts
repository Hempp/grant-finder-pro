export type ThemeMode = "light" | "dark" | "auto";

const STORAGE_KEY = "theme-mode";
const VALID: ReadonlySet<ThemeMode> = new Set(["light", "dark", "auto"]);

function safeRead(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function safeWrite(value: string | null): void {
  try {
    if (value === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, value);
    }
  } catch {
    /* private browsing / disabled — silent */
  }
}

export function getStoredThemeMode(): ThemeMode {
  const v = safeRead();
  if (v === "light" || v === "dark") return v;
  return "auto";
}

export function setStoredThemeMode(mode: ThemeMode): void {
  if (!VALID.has(mode)) return;
  if (mode === "auto") {
    safeWrite(null);
    return;
  }
  safeWrite(mode);
}

export function resolveEffectiveMode(
  stored: ThemeMode,
  prefersDark: boolean
): "light" | "dark" {
  if (stored === "light" || stored === "dark") return stored;
  return prefersDark ? "dark" : "light";
}
