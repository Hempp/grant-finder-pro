/**
 * Floating "Score · 94" overlay anchored to the top-right of the hero
 * preview. Decorative — hidden from screen readers (aria-hidden).
 */
export function FloatingScoreCard() {
  return (
    <div
      aria-hidden="true"
      className="absolute z-10 top-0 right-0 w-[88px] translate-x-[18%] -translate-y-[28%] rotate-2
        rounded-xl px-3.5 py-2.5
        bg-white/85 [backdrop-filter:blur(8px)]
        border border-[color:var(--glass-border)]
        shadow-[0_8px_22px_-6px_rgba(15,23,42,0.22)]
        max-[480px]:hidden
        max-[768px]:rotate-0 max-[768px]:translate-x-[6%] max-[768px]:translate-y-[-12%]"
    >
      <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-ink-2">
        Score
      </p>
      <p className="text-[20px] font-mono font-bold text-success leading-none tabular-nums mt-1">
        94
      </p>
    </div>
  );
}
