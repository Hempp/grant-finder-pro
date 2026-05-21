const BARS = [
  { name: "Specific Aims", pct: 100 },
  { name: "Innovation", pct: 90 },
  { name: "Approach", pct: 90 },
  { name: "Investigator", pct: 100 },
  { name: "Environment", pct: 90 },
];

export function ScorePredictionMockup() {
  return (
    <div className="max-w-[480px] mx-auto">
      <div className="bg-surface rounded-2xl border border-rule shadow-[var(--shadow-card-soft)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-rule bg-bg/40">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </div>
          <p className="ml-3 text-meta text-ink-2">grantpilot.dev / score</p>
        </div>
        <div className="p-5">
          <div className="flex items-baseline justify-between mb-4">
            <p className="text-micro font-mono uppercase tracking-[0.12em] text-ink-2">Predicted score</p>
            <p className="text-title font-mono font-bold text-success leading-none tabular-nums">94 <span className="text-small text-ink-2 font-medium">/ 100</span></p>
          </div>
          <div className="space-y-3">
            {BARS.map((b) => (
              <div key={b.name}>
                <div className="flex items-center justify-between text-micro mb-1">
                  <span className="text-ink">{b.name}</span>
                  <span className="text-ink-2 font-mono tabular-nums">{b.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-rule overflow-hidden">
                  <div className="h-full bg-success rounded-full" style={{ width: `${b.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-rule text-micro text-ink-2 text-center">
            Score updates as you edit.
          </div>
        </div>
      </div>
    </div>
  );
}
