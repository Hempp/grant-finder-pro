"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SmallCapsEyebrow } from "./SmallCapsEyebrow";

interface NavSubscriptionState {
  loggedIn: boolean;
  destinationHref: string;
  trialDaysLeft?: number;
  pastDue?: boolean;
}

export function EditorialNav({ state }: { state: NavSubscriptionState }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sentinel = document.createElement("div");
    sentinel.style.position = "absolute";
    sentinel.style.top = "60px";
    sentinel.style.height = "1px";
    sentinel.style.width = "1px";
    sentinel.style.pointerEvents = "none";
    document.body.prepend(sentinel);
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, []);

  return (
    <nav
      data-scrolled={scrolled}
      className="sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-[var(--dur-fast)] ease-[var(--ease-out)]
        bg-transparent border-b border-transparent
        data-[scrolled=true]:bg-[color:var(--glass-bg)]
        data-[scrolled=true]:[backdrop-filter:blur(var(--glass-blur))]
        data-[scrolled=true]:border-[color:var(--glass-border)]"
    >
      <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span className="font-display text-xl">GrantPilot</span>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-[14px] text-ink-2">
          <Link href="/#features" className="hover:text-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Product</Link>
          <Link href="/pricing" className="hover:text-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Pricing</Link>
          <Link href="/resources" className="hover:text-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Resources</Link>
        </div>

        <div className="flex items-center gap-4">
          {state.pastDue && (
            <SmallCapsEyebrow className="text-accent">
              <Link
                href="/dashboard/billing"
                className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Payment needed
              </Link>
            </SmallCapsEyebrow>
          )}
          {state.trialDaysLeft !== undefined && !state.pastDue && (
            <SmallCapsEyebrow>
              Trial · {state.trialDaysLeft} days left
            </SmallCapsEyebrow>
          )}
          <Link
            href={state.loggedIn ? state.destinationHref : "/login"}
            className="text-[14px] text-ink-2 hover:text-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {state.loggedIn ? "Dashboard" : "Sign in"}
          </Link>
          <Link
            href={state.loggedIn ? state.destinationHref : "/signup"}
            className="inline-flex items-center bg-accent text-surface text-[13px] font-medium tracking-tight rounded-lg px-3.5 py-2 hover:bg-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {state.loggedIn ? "Open dashboard" : "Start free"}
          </Link>
        </div>
      </div>
    </nav>
  );
}
