const SOURCES = [
  "Grants.gov", "SAM.gov", "NIH Reporter", "NSF",
  "SBIR", "USDA", "DOE", "Knight Foundation",
  "Gates Foundation", "Coca-Cola", "Foundation Directory", "State databases",
];

export function HowItWorksMockup1() {
  return (
    <div className="max-w-[480px] mx-auto lg:ml-auto">
      <div className="bg-surface rounded-2xl border border-rule shadow-[0_20px_48px_-12px_rgba(15,23,42,0.18),0_4px_12px_-2px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-rule bg-bg/40">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </div>
          <p className="ml-3 text-meta text-ink-2">grantpilot.dev / sources</p>
          <div className="ml-auto flex items-center gap-1.5 text-nano uppercase tracking-[0.1em] text-ink-2">
            <span className="size-1.5 rounded-full bg-success animate-pulse" />
            Syncing
          </div>
        </div>
        <div className="p-5">
          <p className="text-micro font-mono uppercase tracking-[0.12em] text-ink-2 mb-3">
            12 live sources · Updated 4 min ago
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SOURCES.map((s) => (
              <div
                key={s}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-rule"
              >
                <span className="size-1.5 rounded-full bg-success shrink-0" />
                <span className="text-meta font-medium text-ink truncate">{s}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-rule flex items-center justify-between">
            <p className="text-micro font-mono uppercase tracking-[0.12em] text-ink-2">
              Next sync in 56 min
            </p>
            <p className="text-meta font-mono font-semibold text-accent">
              2,141 opportunities indexed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
