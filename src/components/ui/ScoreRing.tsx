"use client";

import { useEffect, useRef, useState } from "react";

type ScoreRingSize = "sm" | "md" | "lg";

export interface ScoreRingProps {
  /** Predicted score. Clamped to 0–100. */
  score: number;
  /** Visual size. `sm` inline (lists/tables), `md` cards, `lg` hero/win moment. */
  size?: ScoreRingSize;
  /** Optional context label, woven into the accessible name. */
  label?: string;
  className?: string;
}

/**
 * Per-size geometry. `box` is the SVG viewBox / rendered px; `stroke` the ring
 * weight; `numeral` the font-size of the centered score; `pad` keeps the arc
 * fully inside the box accounting for stroke + the high-score pulse halo.
 */
const SIZES: Record<
  ScoreRingSize,
  { box: number; stroke: number; numeral: number }
> = {
  sm: { box: 32, stroke: 3, numeral: 12 },
  md: { box: 72, stroke: 6, numeral: 24 },
  lg: { box: 128, stroke: 11, numeral: 44 },
};

const FILL_DURATION = 700; // ms — matches spec ~700ms
// var(--ease-soft) = cubic-bezier(0.32, 0.72, 0, 1)
function easeSoft(t: number): number {
  return cubicBezier(0.32, 0.72, 0, 1, t);
}

/** Tier color token for the arc + numeral. */
function tierColor(score: number): string {
  if (score < 60) return "var(--warn)";
  if (score < 90) return "var(--accent)";
  return "var(--success)";
}

function clampScore(raw: number): number {
  if (!Number.isFinite(raw)) return 0;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function ScoreRing({
  score,
  size = "md",
  label,
  className = "",
}: ScoreRingProps) {
  const finalScore = clampScore(score);
  const { box, stroke, numeral } = SIZES[size];

  // Geometry: radius leaves room for the stroke (and a touch of pulse halo).
  const radius = (box - stroke) / 2 - 1;
  const center = box / 2;
  const circumference = 2 * Math.PI * radius;

  // `progress` (0–1) drives both the arc dash-offset and the displayed numeral.
  const [progress, setProgress] = useState(0);
  const [pulsing, setPulsing] = useState(false);
  const rafRef = useRef<number | null>(null);
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    // Reduced motion: snap to the final state, no animation, no pulse.
    if (reduce) {
      setProgress(1);
      setPulsing(false);
      return;
    }

    // Animate from 0 → 1 via requestAnimationFrame, eased.
    setProgress(0);
    setPulsing(false);
    let start: number | null = null;

    const step = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start;
      const t = Math.min(1, elapsed / FILL_DURATION);
      setProgress(easeSoft(t));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
        // High-score flourish: one subtle pulse once the fill completes.
        if (finalScore >= 90) {
          setPulsing(true);
          pulseTimerRef.current = setTimeout(() => setPulsing(false), 600);
        }
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (pulseTimerRef.current !== null) clearTimeout(pulseTimerRef.current);
    };
  }, [finalScore]);

  const color = tierColor(finalScore);
  // Numeral counts up in lockstep with the arc; rounded so it ticks cleanly.
  const displayValue = Math.round(finalScore * progress);
  // dashoffset: full circumference = empty, 0 = full.
  const dashOffset = circumference * (1 - progress);

  const accessibleLabel = label
    ? `${label}: ${finalScore} out of 100`
    : `Predicted score: ${finalScore} out of 100`;

  return (
    <div
      role="meter"
      aria-valuenow={finalScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={accessibleLabel}
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: box, height: box }}
    >
      <svg
        width={box}
        height={box}
        viewBox={`0 0 ${box} ${box}`}
        aria-hidden="true"
        style={{
          transform: pulsing ? "scale(1.06)" : "scale(1)",
          filter: pulsing
            ? `drop-shadow(0 0 6px ${color})`
            : "drop-shadow(0 0 0 transparent)",
          // Longhand only — the pulse jumps in (0ms) then eases back out
          // over 600ms once `pulsing` flips false. No shorthand mixing.
          transitionProperty: "transform, filter",
          transitionDuration: pulsing ? "0ms" : "600ms",
          transitionTimingFunction: "var(--ease-soft)",
        }}
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--accent-soft)"
          strokeWidth={stroke}
          opacity={0.55}
        />
        {/* Foreground progress arc — starts at 12 o'clock, sweeps clockwise. */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <span
        className="absolute font-mono tabular-nums font-semibold leading-none"
        style={{ fontSize: numeral, color }}
      >
        {displayValue}
      </span>
    </div>
  );
}

/**
 * Solve a cubic-bezier easing curve for a given x (time) and return y (eased
 * progress). Matches the CSS `cubic-bezier(x1,y1,x2,y2)` definition so the
 * rAF count-up shares the exact curve as `var(--ease-soft)`.
 */
function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x: number
): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  // Newton-Raphson to find the curve parameter t for the target x.
  let t = x;
  for (let i = 0; i < 8; i++) {
    const xEst = sampleX(t) - x;
    if (Math.abs(xEst) < 1e-6) break;
    const dx = sampleDX(t);
    if (Math.abs(dx) < 1e-6) break;
    t -= xEst / dx;
  }
  t = Math.max(0, Math.min(1, t));
  return sampleY(t);
}
