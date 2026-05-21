const CRITERIA = [
  { name: "Specific Aims", score: "10 / 10" },
  { name: "Innovation", score: "9 / 10" },
  { name: "Approach", score: "9 / 10" },
  { name: "Investigator", score: "10 / 10" },
  { name: "Environment", score: "9 / 10" },
];

export function HowItWorksMockup3() {
  return (
    <div className="max-w-[520px] mx-auto lg:ml-auto">
      <div className="bg-surface rounded-2xl border border-rule shadow-[0_20px_48px_-12px_rgba(15,23,42,0.18),0_4px_12px_-2px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-rule bg-bg/40">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </div>
          <p className="ml-3 text-[12px] text-ink-2">grantpilot.dev / smart-fill</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-rule">
          <div className="p-4">
            <p className="text-[10px] uppercase tracking-[0.12em] text-ink-2 mb-3">
              Scoring rubric
            </p>
            <ul className="space-y-2">
              {CRITERIA.map((c) => (
                <li key={c.name} className="flex items-center justify-between text-[12px]">
                  <span className="text-ink">{c.name}</span>
                  <span className="font-mono font-semibold text-success tabular-nums">{c.score}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 bg-bg-soft/40">
            <p className="text-[10px] uppercase tracking-[0.12em] text-ink-2 mb-3">
              Draft · §1 Specific Aims
            </p>
            <p className="text-[11px] leading-[1.55] text-ink-2 line-clamp-[8]">
              We propose a software platform that addresses three specific
              aims: (1) reduce average grant-application drafting time from
              48 hours to under 4, (2) raise the rate at which applicants
              meet every scoring criterion to ≥ 95 %, and (3) make grant
              capital accessible to first-time applicants without
              consultant fees…
            </p>
            <p className="text-[10px] font-semibold text-accent mt-3">
              Auto-optimizing · round 2 of 3
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
