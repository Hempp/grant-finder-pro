"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import {
  getStoredThemeMode,
  setStoredThemeMode,
  resolveEffectiveMode,
  type ThemeMode,
} from "@/lib/theme-mode";

interface ThemeToggleProps {
  /** Visual variant. `inline` = subtle button for sidebars/headers, `chip` = pill variant for footers. */
  variant?: "inline" | "chip";
  className?: string;
}

/**
 * Toggles between light and dark mode. Persists choice in localStorage
 * via `setStoredThemeMode`, applies the `data-theme-mode` attribute on
 * <html> immediately so styles flip without a reload, and stays in
 * sync with the system theme when no explicit choice is stored.
 *
 * The early-paint script at /public/theme-init.js handles SSR so this
 * component only needs to handle runtime changes — no FOUC.
 */
export function ThemeToggle({ variant = "inline", className = "" }: ThemeToggleProps) {
  const [mode, setMode] = useState<ThemeMode>("auto");
  const [systemDark, setSystemDark] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMode(getStoredThemeMode());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    setHydrated(true);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Render a stable, accessible placeholder pre-hydration to avoid a
  // mid-paint flip on theme-init.
  if (!hydrated) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={`inline-flex items-center justify-center ${className}`}
        style={{
          width: variant === "chip" ? 80 : 36,
          height: 36,
          background: "transparent",
          border: variant === "chip" ? "1px solid var(--rule)" : "none",
          borderRadius: variant === "chip" ? "var(--radius-control)" : 8,
        }}
        disabled
      />
    );
  }

  const effective = resolveEffectiveMode(mode, systemDark);
  const next = effective === "dark" ? "light" : "dark";

  const onClick = () => {
    setStoredThemeMode(next);
    setMode(next);
    document.documentElement.setAttribute("data-theme-mode", next);
  };

  if (variant === "chip") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`Switch to ${next} mode`}
        className={`inline-flex items-center gap-2 px-3 py-1.5 transition-colors hover:bg-[var(--bg-soft)] ${className}`}
        style={{
          background: "var(--surface)",
          color: "var(--ink-2)",
          border: "1px solid var(--rule)",
          borderRadius: "var(--radius-control)",
          fontSize: "var(--text-caption)",
        }}
      >
        {effective === "dark" ? (
          <Moon className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Sun className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        <span className="font-medium capitalize">{effective}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Switch to ${next} mode`}
      className={`inline-flex items-center justify-center transition-colors hover:bg-[var(--bg-soft)] ${className}`}
      style={{
        width: 36,
        height: 36,
        color: "var(--ink-2)",
        borderRadius: 8,
      }}
    >
      {effective === "dark" ? (
        <Moon className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Sun className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
