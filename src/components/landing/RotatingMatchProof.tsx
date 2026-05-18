"use client";

import { useEffect, useMemo, useState } from "react";

interface MatchExample {
  audience: string;
  audienceShort: string;
  funder: string;
  title: string;
  amount: string;
  score: number;
  category: string;
}

const EXAMPLES: MatchExample[] = [
  {
    audience: "For founders & startups",
    audienceShort: "Founder",
    funder: "National Science Foundation",
    title: "SBIR Phase I — Software & Systems",
    amount: "$275K",
    score: 94,
    category: "Federal · R&D",
  },
  {
    audience: "For nonprofits",
    audienceShort: "Nonprofit",
    funder: "Knight Foundation",
    title: "Local · Civic Engagement Grant",
    amount: "$125K",
    score: 88,
    category: "Foundation · Operating",
  },
  {
    audience: "For students",
    audienceShort: "Student",
    funder: "Coca-Cola Scholars Foundation",
    title: "Coca-Cola Scholars Program",
    amount: "$20K",
    score: 91,
    category: "Scholarship · Merit",
  },
];

const ROTATION_MS = 6500;

export function RotatingMatchProof() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (paused || !mounted) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % EXAMPLES.length);
    }, ROTATION_MS);
    return () => window.clearInterval(t);
  }, [paused, mounted]);

  const current = useMemo(() => EXAMPLES[index], [index]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center gap-2 mb-5">
        <span className="font-mono text-[11px] font-medium tracking-[0.18em] uppercase text-ink-2">
          Example match
        </span>
        <span className="text-ink-2/30" aria-hidden="true">
          ·
        </span>
        <span className="font-mono text-[11px] font-medium tracking-[0.18em] uppercase text-accent">
          {current.audienceShort}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <p
            className="font-display font-medium text-success leading-[0.9] tracking-[-0.04em] text-[clamp(56px,10vw,128px)] tabular-nums"
            aria-live="polite"
          >
            {current.amount}
          </p>
          <p className="mt-3 text-[11px] font-medium tracking-[0.14em] uppercase text-ink-2">
            Award amount
          </p>
        </div>
        <div>
          <p className="font-display font-medium text-success leading-[0.9] tracking-[-0.04em] text-[clamp(56px,10vw,128px)] tabular-nums">
            {current.score}
            <span className="text-ink-2/50 text-[0.32em] font-mono ml-1 align-top">
              /100
            </span>
          </p>
          <p className="mt-3 text-[11px] font-medium tracking-[0.14em] uppercase text-ink-2">
            Predicted score
          </p>
        </div>
      </div>

      <div className="pt-5 border-t border-rule">
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <div className="min-w-0">
            <p className="font-display text-[18px] font-medium leading-tight text-ink truncate">
              {current.title}
            </p>
            <p className="text-[13px] text-ink-2 truncate">{current.funder}</p>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2 shrink-0">
            {current.category}
          </p>
        </div>
        <p className="text-[13px] text-ink-2">{current.audience}</p>
      </div>

      <div
        className="flex items-center gap-2 mt-6"
        role="tablist"
        aria-label="Match example selector"
      >
        {EXAMPLES.map((ex, i) => (
          <button
            key={ex.audienceShort}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show ${ex.audienceShort} example`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-[var(--dur-base)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              i === index
                ? "w-10 bg-accent"
                : "w-1.5 bg-ink-2/30 hover:bg-ink-2/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
