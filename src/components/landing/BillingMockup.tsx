export function BillingMockup() {
  return (
    <div className="max-w-[480px] mx-auto">
      <div className="bg-surface rounded-2xl border border-rule shadow-[var(--shadow-card-soft)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-rule bg-bg/40">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </div>
          <p className="ml-3 text-meta text-ink-2">grantpilot.dev / billing</p>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between px-3.5 py-3 rounded-xl border border-success/20 bg-success-soft/20">
            <div>
              <p className="text-micro font-mono uppercase tracking-[0.12em] text-ink-2">Grant won</p>
              <p className="text-small font-semibold text-ink mt-0.5">NSF SBIR Phase I — Software</p>
            </div>
            <p className="text-small font-mono font-bold text-success tabular-nums">$275,000</p>
          </div>
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-rule">
            <p className="text-meta text-ink-2">Success fee · 4 %</p>
            <p className="text-meta font-mono font-semibold text-ink tabular-nums">– $11,000</p>
          </div>
          <div className="flex items-center justify-between px-3.5 py-3 rounded-xl border-2 border-ink/10 bg-bg-soft/40">
            <p className="text-caption font-semibold text-ink">Net to you</p>
            <p className="text-body font-mono font-bold text-ink tabular-nums">$264,000</p>
          </div>
          <p className="text-micro font-mono text-center text-ink-2 pt-1">
            $0 upfront · No charge until you win.
          </p>
        </div>
      </div>
    </div>
  );
}
