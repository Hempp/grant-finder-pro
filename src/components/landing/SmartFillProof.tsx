import { SmallCapsEyebrow } from "./SmallCapsEyebrow";

export function SmartFillProof() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-20 md:py-32">
      <div className="grid grid-cols-12 gap-6 items-center">
        <div className="col-span-12 md:col-span-5">
          <SmallCapsEyebrow className="mb-6">
            Smart Fill in 30 seconds
          </SmallCapsEyebrow>
          <h2 className="font-display text-[clamp(36px,5vw,64px)] leading-[1.05] tracking-[-0.02em] text-ink mb-6">
            From RFP to ready-to-submit in under a minute.
          </h2>
          <p className="text-body leading-[1.625] text-ink-2 max-w-[52ch]">
            Smart Fill reads the complete RFP or scholarship prompt, maps
            every scoring criterion to your organization&apos;s data, drafts
            each section, and auto-optimizes up to three rounds until every
            criterion scores maximum points. You see what changed, why, and
            how it maps to the rubric.
          </p>
        </div>
        <div className="col-span-12 md:col-span-7">
          <SmartFillProofMockup />
        </div>
      </div>
    </section>
  );
}

const SECTIONS = [
  {
    heading: "§1 · Specific Aims",
    criterion: "Specific Aims",
    score: "10 / 10",
    body:
      "We propose a platform that cuts grant-application drafting from 48 hours to under 4, while raising rubric-match rates above 95 % for first-time applicants.",
  },
  {
    heading: "§2 · Innovation",
    criterion: "Innovation",
    score: "9 / 10",
    body:
      "Unlike template tools, the engine scores each draft against the funder's own rubric and re-optimizes until every criterion clears its threshold.",
  },
  {
    heading: "§3 · Approach",
    criterion: "Approach",
    score: "9 / 10",
    body:
      "A three-phase build — corpus ingestion, rubric mapping, and supervised drafting — each tied to a measurable milestone and acceptance gate.",
  },
] as const;

function SmartFillProofMockup() {
  return (
    <div className="max-w-[560px] mx-auto lg:ml-auto">
      <div className="bg-surface rounded-2xl border border-rule shadow-[var(--shadow-card-soft)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-rule bg-bg/40">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </div>
          <p className="ml-3 text-meta text-ink-2">
            grantpilot.dev / smart-fill
          </p>
          <span className="ml-auto text-nano font-mono font-semibold tracking-[0.12em] uppercase text-ink-2">
            NSF SBIR Phase I
          </span>
        </div>
        <div className="p-5">
          <p className="text-micro font-mono uppercase tracking-[0.12em] text-ink-2 mb-4">
            Draft · annotated against rubric
          </p>
          <div className="space-y-3">
            {SECTIONS.map((s) => (
              <div
                key={s.heading}
                className="rounded-lg border border-rule overflow-hidden"
              >
                <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-rule bg-bg-soft/40">
                  <span className="text-nano font-mono font-semibold uppercase tracking-[0.12em] text-ink-2">
                    {s.heading}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-nano uppercase tracking-[0.1em] text-ink-2">
                      Maps to {s.criterion}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-success-soft text-success text-nano font-mono font-bold tabular-nums">
                      {s.score}
                    </span>
                  </span>
                </div>
                <p className="px-3 py-2.5 text-meta leading-[1.55] text-ink-2">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-rule flex items-center justify-between text-micro text-ink-2">
            <span>3 sections · every criterion mapped</span>
            <span className="font-mono font-semibold text-success tabular-nums">
              47 / 47
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
