"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getStoredThemeMode,
  setStoredThemeMode,
  type ThemeMode,
} from "@/lib/theme-mode";

/**
 * Footer links — only surfaces that actually exist. Disabled
 * placeholders were pruned per the honesty constraint (don't promise
 * pages we haven't built). When a new surface ships, add it here.
 */
const PRODUCT_LINKS = [
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/resources" },
];

const LEGAL_LINKS = [
  { label: "Trust", href: "/trust" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "DPA", href: "/dpa" },
];

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <nav aria-label={title}>
      <p className="text-micro font-semibold tracking-[0.16em] uppercase text-ink mb-4">
        {title}
      </p>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="text-small text-ink-2 hover:text-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

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
    <footer className="border-t border-rule">
      <div className="container mx-auto px-4 sm:px-6 py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-10 lg:gap-12 mb-12">
          <div>
            <p className="font-display text-2xl text-ink mb-2">GrantPilot</p>
            <p className="text-small text-ink-2 max-w-[28ch] mb-6">
              Win grants and scholarships. Pay 0% upfront.
            </p>
            <form
              action="#"
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row gap-2 max-w-[360px]"
              aria-label="Newsletter signup"
            >
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="flex-1 text-small px-3.5 py-2.5 rounded-lg border border-rule bg-surface text-ink placeholder:text-ink-2/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
              <button
                type="submit"
                className="bg-accent text-surface text-caption font-medium tracking-tight rounded-lg px-4 py-2.5 hover:bg-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Subscribe
              </button>
            </form>
            <p className="text-meta text-ink-2/70 mt-2 max-w-[360px]">
              One curated grant in your inbox each week. Unsubscribe anytime.
            </p>
            <p className="text-meta text-ink-2/70 mt-4 max-w-[360px]">
              Questions?{" "}
              <a
                href="mailto:hello@grantpilot.dev"
                className="text-accent hover:underline"
              >
                hello@grantpilot.dev
              </a>
            </p>
          </div>
          <FooterColumn title="Product" items={PRODUCT_LINKS} />
          <FooterColumn title="Legal" items={LEGAL_LINKS} />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-rule">
          <p className="text-meta text-ink-2">
            © {new Date().getFullYear()} GrantPilot. All rights reserved.
          </p>
          {hydrated && (
            <button
              type="button"
              onClick={handleToggle}
              className="text-meta text-ink-2 hover:text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {effective === "dark" ? "Switch to light" : "Switch to dark"}
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
