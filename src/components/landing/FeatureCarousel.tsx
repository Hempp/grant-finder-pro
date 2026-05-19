"use client";

import { useEffect, useState } from "react";

type Tile =
  | "find"
  | "draft"
  | "score"
  | "win";

interface TileSpec {
  id: Tile;
  eyebrow: string;
  title: string;
  body: string;
  tileBg: string;
  tileTint: string;
  iconBg: string;
  iconColor: string;
}

const TILES: TileSpec[] = [
  {
    id: "find",
    eyebrow: "Discover",
    title: "Find the grants you actually qualify for.",
    body: "We watch 12 live sources and rank every match by predicted score so you spend time only on the ones you can win.",
    tileBg: "bg-tile-teal-bg",
    tileTint: "bg-tile-teal",
    iconBg: "bg-tile-teal",
    iconColor: "text-teal-900",
  },
  {
    id: "draft",
    eyebrow: "Draft",
    title: "Smart Fill writes against the rubric.",
    body: "Drop in the RFP. We map every scoring criterion to your data and draft each section in your voice.",
    tileBg: "bg-tile-peach-bg",
    tileTint: "bg-tile-peach",
    iconBg: "bg-tile-peach",
    iconColor: "text-orange-900",
  },
  {
    id: "score",
    eyebrow: "Predict",
    title: "See your score before you submit.",
    body: "The auto-optimize loop runs three rounds until every criterion hits maximum points.",
    tileBg: "bg-tile-yellow-bg",
    tileTint: "bg-tile-yellow",
    iconBg: "bg-tile-yellow",
    iconColor: "text-yellow-900",
  },
  {
    id: "win",
    eyebrow: "Win",
    title: "Submit and only pay when you win.",
    body: "Zero upfront cost. We earn 2–5% on grants and 3–8% on scholarships — never before the win.",
    tileBg: "bg-tile-lavender-bg",
    tileTint: "bg-tile-lavender",
    iconBg: "bg-tile-lavender",
    iconColor: "text-violet-900",
  },
];

const ROTATION_MS = 5500;

export function FeatureCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || paused) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % TILES.length);
    }, ROTATION_MS);
    return () => window.clearInterval(t);
  }, [mounted, paused]);

  const current = TILES[index];

  return (
    <div
      className="relative max-w-[920px] mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={`relative rounded-3xl overflow-hidden transition-colors duration-500 ${current.tileBg}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="px-7 py-9 md:px-10 md:py-12 flex flex-col justify-center">
            <p className="text-[12px] font-semibold tracking-[0.16em] uppercase text-ink-2 mb-3">
              {current.eyebrow}
            </p>
            <h3 className="text-[clamp(22px,2.4vw,30px)] font-semibold leading-[1.2] tracking-tight text-ink mb-3">
              {current.title}
            </h3>
            <p className="text-[15px] leading-[1.55] text-ink-2 max-w-[420px]">
              {current.body}
            </p>
          </div>
          <div className="relative flex items-center justify-center p-5 md:p-8 min-h-[280px] md:min-h-[360px]">
            {current.id === "find" && <FindMock />}
            {current.id === "draft" && <DraftMock />}
            {current.id === "score" && <ScoreMock />}
            {current.id === "win" && <WinMock />}
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-center gap-2 mt-6"
        role="tablist"
        aria-label="Feature carousel"
      >
        {TILES.map((t, i) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show ${t.title}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-[var(--dur-base)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              i === index
                ? "w-10 bg-ink"
                : "w-1.5 bg-ink-2/30 hover:bg-ink-2/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ───── Mini product mocks ───── */

function FindMock() {
  return (
    <div className="w-full max-w-[320px] bg-surface rounded-2xl shadow-[0_8px_24px_-8px_rgba(15,23,42,0.18)] p-4 space-y-2.5">
      <div className="flex items-center justify-between text-[11px] font-medium text-ink-2 mb-1">
        <span>3 new matches</span>
        <span className="font-mono uppercase tracking-[0.12em]">
          By score
        </span>
      </div>
      {[
        { t: "NSF SBIR Phase I", s: 94, c: "bg-success-soft text-success" },
        { t: "Knight Foundation", s: 88, c: "bg-tile-teal-bg text-teal-700" },
        { t: "Coca-Cola Scholars", s: 91, c: "bg-success-soft text-success" },
      ].map((row) => (
        <div
          key={row.t}
          className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-rule"
        >
          <p className="text-[12px] font-medium text-ink truncate">{row.t}</p>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold ${row.c}`}
          >
            <span className="size-1 rounded-full bg-current opacity-60" />
            {row.s}
          </span>
        </div>
      ))}
    </div>
  );
}

function DraftMock() {
  return (
    <div className="w-full max-w-[320px] bg-surface rounded-2xl shadow-[0_8px_24px_-8px_rgba(15,23,42,0.18)] p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-tile-peach" />
        <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-ink-2">
          Section 2 — Methodology
        </p>
      </div>
      <div className="space-y-1.5">
        <div className="h-2 rounded-full bg-rule w-full" />
        <div className="h-2 rounded-full bg-rule w-[88%]" />
        <div className="h-2 rounded-full bg-tile-peach w-[72%]" />
        <div className="h-2 rounded-full bg-rule w-full" />
        <div className="h-2 rounded-full bg-rule w-[64%]" />
        <div className="h-2 rounded-full bg-tile-peach w-[80%]" />
        <div className="h-2 rounded-full bg-rule w-[92%]" />
      </div>
      <div className="flex items-center justify-between pt-1.5 border-t border-rule">
        <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-ink-2">
          Auto-optimize · Round 2/3
        </p>
        <span className="font-mono text-[11px] font-semibold text-success">
          +18
        </span>
      </div>
    </div>
  );
}

function ScoreMock() {
  return (
    <div className="w-full max-w-[280px] bg-surface rounded-2xl shadow-[0_8px_24px_-8px_rgba(15,23,42,0.18)] p-6 flex flex-col items-center">
      <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-ink-2 mb-3">
        Predicted score
      </p>
      <div className="relative size-36 mb-3">
        <svg viewBox="0 0 36 36" className="size-full -rotate-90">
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke="var(--rule)"
            strokeWidth="2.5"
          />
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke="var(--success)"
            strokeWidth="2.5"
            strokeDasharray={`${(94 / 100) * 97.4} 97.4`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-[40px] font-semibold leading-none text-ink tabular-nums">
            94
          </span>
          <span className="font-mono text-[11px] text-ink-2 mt-1">/100</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-soft">
        <span className="size-1.5 rounded-full bg-success" />
        <span className="font-mono text-[11px] font-semibold text-success">
          High confidence
        </span>
      </div>
    </div>
  );
}

function WinMock() {
  return (
    <div className="w-full max-w-[320px] bg-surface rounded-2xl shadow-[0_8px_24px_-8px_rgba(15,23,42,0.18)] p-5 space-y-4">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-tile-lavender-bg">
        <svg viewBox="0 0 20 20" className="size-4 text-violet-600 fill-none stroke-current" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4,11 8,15 16,5" />
        </svg>
        <p className="text-[12px] font-semibold text-ink">
          Application submitted
        </p>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <p className="text-[11px] text-ink-2">Awarded</p>
          <p className="font-mono text-[14px] font-semibold text-success">
            $275,000
          </p>
        </div>
        <div className="flex items-baseline justify-between">
          <p className="text-[11px] text-ink-2">Our fee</p>
          <p className="font-mono text-[14px] text-ink">$5,500</p>
        </div>
        <div className="flex items-baseline justify-between pt-1.5 border-t border-rule">
          <p className="text-[11px] font-medium text-ink">You keep</p>
          <p className="font-mono text-[14px] font-semibold text-ink">
            $269,500
          </p>
        </div>
      </div>
      <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-ink-2 pt-1 border-t border-rule">
        Paid only because you won
      </p>
    </div>
  );
}
