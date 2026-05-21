const ITEMS = [
  { t: "Coca-Cola Scholars", a: "$20,000", checked: true },
  { t: "Gates Millennium Scholarship", a: "$50,000", checked: true },
  { t: "Hispanic Scholarship Fund", a: "$5,000", checked: true },
  { t: "Jack Kent Cooke Scholarship", a: "$55,000", checked: true },
  { t: "Burger King Scholars", a: "$1,000", checked: false },
  { t: "Dell Scholars Program", a: "$20,000", checked: true },
  { t: "Horatio Alger", a: "$25,000", checked: true },
  { t: "Ron Brown Scholar", a: "$40,000", checked: true },
];

export function BatchSubmissionMockup() {
  return (
    <div className="max-w-[480px] mx-auto">
      <div className="bg-surface rounded-2xl border border-rule shadow-[var(--shadow-card-soft)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-rule bg-bg/40">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </div>
          <p className="ml-3 text-meta text-ink-2">grantpilot.dev / queue</p>
        </div>
        <div className="p-5">
          <p className="text-micro font-mono uppercase tracking-[0.12em] text-ink-2 mb-3">
            Batch queue · 7 of 8 selected
          </p>
          <div className="space-y-1.5">
            {ITEMS.map((i) => (
              <div key={i.t} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-rule">
                <span
                  className={`size-4 rounded border ${i.checked ? "bg-accent border-accent" : "bg-surface border-rule"} flex items-center justify-center shrink-0`}
                  aria-hidden="true"
                >
                  {i.checked && (
                    <span className="text-surface text-nano font-bold">✓</span>
                  )}
                </span>
                <p className={`flex-1 text-meta font-medium truncate ${i.checked ? "text-ink" : "text-ink-2/70"}`}>{i.t}</p>
                <p className="text-micro font-mono font-semibold text-success tabular-nums shrink-0">{i.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-rule flex items-center justify-between">
            <p className="text-micro text-ink-2">Total potential: <span className="font-mono font-semibold text-ink tabular-nums">$215,000</span></p>
            <button type="button" className="bg-accent text-surface text-meta font-semibold rounded-lg px-3.5 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              Submit 7 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
