"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getStoredThemeMode,
  setStoredThemeMode,
  type ThemeMode,
} from "@/lib/theme-mode";

const PRODUCT_LINKS = [
  { label: "Pricing", href: "/pricing" },
  { label: "For organizations", href: "/#for-orgs", disabled: true },
  { label: "For students", href: "/#for-students", disabled: true },
  { label: "API", href: "/api-docs", disabled: true },
  { label: "Status", href: "/status", disabled: true },
];

const RESOURCE_LINKS = [
  { label: "Grant index", href: "/grants", disabled: true },
  { label: "Scholarship index", href: "/scholarships", disabled: true },
  { label: "Blog", href: "/blog", disabled: true },
  { label: "Help center", href: "/help", disabled: true },
  { label: "Smart Fill rubric", href: "/smart-fill", disabled: true },
];

const COMPANY_LINKS = [
  { label: "About", href: "/about", disabled: true },
  { label: "Careers", href: "/careers", disabled: true },
  { label: "Press", href: "/press", disabled: true },
  { label: "Contact", href: "/contact", disabled: true },
];

const LEGAL_LINKS = [
  { label: "Trust", href: "/trust" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Security", href: "/security", disabled: true },
  { label: "DPA", href: "/dpa", disabled: true },
];

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string; disabled?: boolean }[];
}) {
  return (
    <nav aria-label={title}>
      <p className="text-micro font-semibold tracking-[0.16em] uppercase text-ink mb-4">
        {title}
      </p>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.label}>
            {item.disabled ? (
              <span
                className="text-small text-ink-2/60 cursor-not-allowed"
                title="Coming soon"
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-small text-ink-2 hover:text-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {item.label}
              </Link>
            )}
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
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-10 lg:gap-12 mb-12">
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
          </div>
          <FooterColumn title="Product" items={PRODUCT_LINKS} />
          <FooterColumn title="Resources" items={RESOURCE_LINKS} />
          <FooterColumn title="Company" items={COMPANY_LINKS} />
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
