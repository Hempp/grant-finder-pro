"use client";

import { useEffect, useRef, useState } from "react";

const TARGET_SCORE = 94;
const FILL_MS = 10_000;

/**
 * Ambient marine motif for the right column of the split auth layout.
 * A slow-fill ring + one quiet line. Decorative — aria-hidden, role is
 * purely visual presence ("joining something with momentum") and not
 * an interactive control. Mobile hides it; desktop only.
 *
 * Why not reuse <ScoreRing>: ScoreRing has a 700ms fill and a >=90
 * pulse flourish — both designed for *content* moments (a real
 * predicted score arriving). Ambient auth presence needs a slower,
 * non-pulsing fill that doesn't compete with the form.
 */
export function AuthMotifPanel() {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    if (reduce) {
      setProgress(1);
      return;
    }

    let start: number | null = null;
    const step = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start;
      const t = Math.min(1, elapsed / FILL_MS);
      // var(--ease-soft) = cubic-bezier(0.32, 0.72, 0, 1) — flatten the
      // tail so the fill settles instead of slamming the target.
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const box = 240;
  const stroke = 14;
  const radius = (box - stroke) / 2 - 1;
  const center = box / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);
  const display = Math.round(TARGET_SCORE * progress);

  return (
    <div
      aria-hidden="true"
      className="hidden md:flex relative flex-col items-center justify-center overflow-hidden"
      style={{
        background: "var(--section-tint-2)",
        borderLeft: "1px solid var(--section-border-2)",
      }}
    >
      <div className="relative" style={{ width: box, height: box }}>
        <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--accent-soft)"
            strokeWidth={stroke}
            opacity={0.55}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${center} ${center})`}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center font-mono tabular-nums font-semibold leading-none"
          style={{ fontSize: 72, color: "var(--accent)" }}
        >
          {display}
        </span>
      </div>
      <p
        className="mt-10 text-center max-w-xs px-6 leading-snug"
        style={{
          color: "var(--ink-2)",
          fontSize: "var(--text-body-lg)",
        }}
      >
        Closer to funding,<br />one win at a time.
      </p>
    </div>
  );
}
