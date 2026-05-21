const ROWS = [
  { t: "NSF SBIR Phase I", a: "$275,000", e: "Eligible", s: 94 },
  { t: "Knight Civic Innovation", a: "$125,000", e: "Eligible", s: 88 },
  { t: "Gates Health Equity", a: "$500,000", e: "Eligible", s: 82 },
];

export function DiscoveryMockup() {
  return (
    <div className="max-w-[480px] mx-auto">
      <div className="bg-surface rounded-2xl border border-rule shadow-[var(--shadow-card-soft)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-rule bg-bg/40">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </div>
          <p className="ml-3 text-meta text-ink-2">grantpilot.dev / discovery</p>
        </div>
        <div className="p-5">
          <p className="text-micro font-mono uppercase tracking-[0.12em] text-ink-2 mb-3">
            3 ranked matches · auto-refreshed
          </p>
          <div className="space-y-2.5">
            {ROWS.map((r) => (
              <div key={r.t} className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border border-rule">
                <div className="min-w-0 flex-1">
                  <p className="text-caption font-semibold text-ink truncate">{r.t}</p>
                  <p className="text-micro text-success font-medium mt-0.5">{r.e}</p>
                </div>
                <p className="text-meta font-mono font-semibold text-success tabular-nums shrink-0">{r.a}</p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-soft text-success text-micro font-mono font-bold tabular-nums">{r.s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
