export function SmartFillMockup() {
  return (
    <div className="max-w-[480px] mx-auto">
      <div className="bg-surface rounded-2xl border border-rule shadow-[var(--shadow-card-soft)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-rule bg-bg/40">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </div>
          <p className="ml-3 text-meta text-ink-2">grantpilot.dev / smart-fill</p>
          <span className="ml-auto text-nano font-mono font-semibold tracking-[0.12em] uppercase text-success tabular-nums">
            Round 3 / 3
          </span>
        </div>
        <div className="p-5">
          <p className="text-micro font-mono uppercase tracking-[0.12em] text-ink-2 mb-3">
            Specific Aims · auto-optimized
          </p>
          <div className="space-y-2">
            <div className="px-3 py-2 rounded-lg border border-success/20 bg-success-soft/30 text-meta leading-[1.55] text-ink">
              <span className="font-semibold text-success">+ added</span> &quot;reduce drafting time from 48 hr to under 4&quot;
            </div>
            <div className="px-3 py-2 rounded-lg border border-success/20 bg-success-soft/30 text-meta leading-[1.55] text-ink">
              <span className="font-semibold text-success">+ added</span> measurable target tied to Aim 1
            </div>
            <div className="px-3 py-2 rounded-lg border border-rule text-meta leading-[1.55] text-ink-2">
              <span className="font-semibold text-ink">~ tightened</span> background paragraph by 31 words
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-rule flex items-center justify-between text-micro text-ink-2">
            <span>All 5 criteria · max points</span>
            <span className="font-mono font-semibold text-success tabular-nums">47 / 47</span>
          </div>
        </div>
      </div>
    </div>
  );
}
