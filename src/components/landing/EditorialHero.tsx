import { EditorialCTA } from "./EditorialCTA";
import { FloatingScoreCard } from "./FloatingScoreCard";

/**
 * v2 hero. Left text + CTAs, right HeroPreview with a single floating
 * Score · 94 overlay. The trust strip, stats row, FeatureCarousel, and
 * pre-launch line that previously lived inside this component have moved
 * to dedicated sections (TrustBar, PreLaunchPanel).
 */
export function EditorialHero({
  primaryCtaHref,
  primaryCtaLabel,
}: {
  primaryCtaHref: string;
  primaryCtaLabel: string;
}) {
  return (
    <section
      id="main-content"
      className="relative container mx-auto px-4 sm:px-6 pt-10 md:pt-14 lg:pt-20 pb-16 md:pb-24"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="text-left">
          <p className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-tight text-accent mb-6 px-3.5 py-1.5 rounded-full bg-accent-soft">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            For nonprofits, founders &amp; students
          </p>

          <h1 className="text-[clamp(40px,5.5vw,68px)] font-bold leading-[1.05] tracking-[-0.025em] text-ink mb-6">
            Win grants and scholarships.
            <br />
            <span className="text-accent">Pay 0% upfront.</span>
          </h1>

          <p className="text-[18px] md:text-[19px] leading-[1.55] text-ink-2 max-w-[520px] mb-8">
            Find the funding you actually qualify for. Draft each
            application against the funder&apos;s rubric. See your predicted
            score before you submit. <span className="font-semibold text-ink">You only pay when you win.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <EditorialCTA href={primaryCtaHref}>
              {primaryCtaLabel} — it&apos;s $0 until you win
            </EditorialCTA>
            <EditorialCTA href="#how-it-works" variant="secondary">
              See how it works
            </EditorialCTA>
          </div>

          <p className="text-[13px] text-ink-2">
            No credit card · 21-day free trial · Cancel anytime
          </p>
        </div>

        <div className="relative">
          <HeroPreview />
          <FloatingScoreCard />
        </div>
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="relative max-w-[520px] mx-auto lg:ml-auto">
      <div className="bg-surface rounded-2xl border border-rule shadow-[0_20px_48px_-12px_rgba(15,23,42,0.18),0_4px_12px_-2px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-rule bg-bg/40">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </div>
          <p className="ml-3 text-[12px] text-ink-2">grantpilot.dev / matches</p>
          <div className="ml-auto flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-ink-2">
            <span className="size-1.5 rounded-full bg-success" />
            Live
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-baseline justify-between mb-4">
            <p className="text-[15px] font-semibold text-ink">
              3 new matches today
            </p>
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-2">
              By score
            </p>
          </div>
          <div className="space-y-2.5">
            {[
              {
                t: "NSF SBIR Phase I — Software",
                f: "National Science Foundation",
                a: "$275,000",
                s: 94,
                d: "Due Mar 12",
              },
              {
                t: "Knight Foundation · Civic",
                f: "Knight Foundation",
                a: "$125,000",
                s: 88,
                d: "Due Apr 04",
              },
              {
                t: "Coca-Cola Scholars Program",
                f: "Coca-Cola Foundation",
                a: "$20,000",
                s: 91,
                d: "Due May 21",
              },
            ].map((row) => (
              <div
                key={row.t}
                className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border border-rule"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-ink truncate">
                    {row.t}
                  </p>
                  <p className="text-[11px] text-ink-2 truncate">{row.f}</p>
                </div>
                <div className="hidden sm:block text-right shrink-0">
                  <p className="text-[13px] font-mono font-semibold text-success tabular-nums">
                    {row.a}
                  </p>
                  <p className="text-[10px] font-mono uppercase tracking-[0.1em] text-ink-2">
                    {row.d}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-soft text-success text-[11px] font-mono font-bold tabular-nums">
                  {row.s}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-rule flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-2">
              You only pay on a win
            </p>
            <p className="text-[12px] font-semibold text-accent">
              Draft all 3 →
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
