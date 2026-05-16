"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getStoredThemeMode,
  setStoredThemeMode,
  type ThemeMode,
} from "@/lib/theme-mode";

export function EditorialFooter() {
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

  const effective = mode === "auto" ? (systemDark ? "dark" : "light") : mode;

  const handleToggle = () => {
    const next: ThemeMode = effective === "dark" ? "light" : "dark";
    setStoredThemeMode(next);
    setMode(next);
    document.documentElement.setAttribute("data-theme-mode", next);
  };

  return (
    <footer className="border-t border-rule py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <p className="font-display text-2xl text-ink mb-2">GrantPilot</p>
            <p className="text-[14px] text-ink-2">
              Built by Coach Phillips · Made for people who need the grant
              more than the platform needs the fee.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-ink-2">
            <Link href="/pricing" className="hover:text-ink">
              Pricing
            </Link>
            <Link href="/resources" className="hover:text-ink">
              Resources
            </Link>
            <Link href="/trust" className="hover:text-ink">
              Trust
            </Link>
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-ink">
              Terms
            </Link>
            {hydrated && (
              <button
                type="button"
                onClick={handleToggle}
                className="hover:text-ink underline-offset-4 hover:underline"
              >
                {effective === "dark" ? "Switch to light" : "Switch to dark"}
              </button>
            )}
          </nav>
        </div>
      </div>
    </footer>
  );
}
