const MATCHES = [
  { t: "NSF SBIR Phase I — Software", a: "$275,000", s: 94 },
  { t: "Knight Civic Innovation", a: "$125,000", s: 88 },
  { t: "Gates Health Equity", a: "$500,000", s: 82 },
  { t: "USDA Rural Business", a: "$95,000", s: 76 },
];

export function HowItWorksMockup2() {
  return (
    <div className="max-w-[480px] mx-auto lg:ml-auto">
      <div className="bg-surface rounded-2xl border border-rule shadow-[0_20px_48px_-12px_rgba(15,23,42,0.18),0_4px_12px_-2px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-rule bg-bg/40">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </div>
          <p className="ml-3 text-meta text-ink-2">grantpilot.dev / matches</p>
        </div>
        <div className="p-5">
          <p className="text-micro uppercase tracking-[0.12em] text-ink-2 mb-3">
            Ranked for your profile
          </p>
          <div className="space-y-2.5">
            {MATCHES.map((m) => (
              <div
                key={m.t}
                className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border border-rule"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-caption font-semibold text-ink truncate">{m.t}</p>
                  <p className="text-micro text-success font-medium mt-0.5">Eligible</p>
                </div>
                <p className="text-meta font-mono font-semibold text-success tabular-nums shrink-0">
                  {m.a}
                </p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-soft text-success text-micro font-mono font-bold tabular-nums">
                  {m.s}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
