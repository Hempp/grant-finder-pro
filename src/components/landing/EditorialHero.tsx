import { Fragment } from "react";
import { EditorialCTA } from "./EditorialCTA";
import { FeatureCarousel } from "./FeatureCarousel";

const INDEXED_FUNDERS = [
  "Grants.gov",
  "SAM.gov",
  "NIH",
  "NSF",
  "USDA",
  "SBIR",
  "DOE",
  "Foundation Directory",
];

/**
 * v8 hero. Zeffy layout: LEFT text + CTAs, RIGHT product preview
 * (matches inbox mock). Roboto throughout. One-message dominance
 * on "0% upfront." FeatureCarousel relocated below the hero as its
 * own "Everything you need" section.
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
      className="relative container mx-auto px-4 sm:px-6 pt-10 md:pt-14 lg:pt-20 pb-12 md:pb-16"
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
        </div>
      </div>

      <div className="mt-16 md:mt-24 text-center">
        <p className="text-[12px] font-semibold tracking-[0.14em] uppercase text-ink-2 mb-5">
          Indexing funding from
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 max-w-3xl mx-auto">
          {INDEXED_FUNDERS.map((funder, i) => (
            <Fragment key={funder}>
              <span className="text-[14px] md:text-[15px] font-medium tracking-tight text-ink hover:text-accent transition-colors">
                {funder}
              </span>
              {i < INDEXED_FUNDERS.length - 1 && (
                <span className="text-ink-2/40" aria-hidden="true">
                  ·
                </span>
              )}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="mt-16 md:mt-20">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <p className="text-[12px] font-semibold tracking-[0.14em] uppercase text-accent mb-3">
            Everything you need
          </p>
          <h2 className="text-[clamp(28px,3.6vw,42px)] font-bold leading-[1.1] tracking-[-0.02em] text-ink mb-4">
            One platform from find to win.
          </h2>
          <p className="text-[16px] md:text-[17px] leading-[1.55] text-ink-2">
            Discovery, drafting, scoring, and submission — all in one place,
            built around a 0% upfront economic model.
          </p>
        </div>
        <FeatureCarousel />
      </div>

      <div className="mt-14 md:mt-20 mx-auto max-w-2xl">
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-rule bg-bg">
          <span
            className="size-2 rounded-full bg-success shrink-0"
            aria-hidden="true"
          />
          <p className="text-[13px] md:text-[14px] text-ink-2 leading-relaxed">
            <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-ink mr-2">
              Pre-launch
            </span>
            We&apos;re building in the open. Be one of our first 100 wins and
            your story replaces this strip.
          </p>
        </div>
      </div>

      <div className="mt-14 md:mt-20 pt-10 border-t border-rule max-w-5xl mx-auto">
        <p className="text-[12px] font-semibold tracking-[0.14em] uppercase text-ink-2 mb-7 text-center">
          What we&apos;ve indexed so far
        </p>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-8">
          <Stat value="2,000+" label="Grants" />
          <Stat value="141+" label="Scholarships" />
          <Stat value="12" label="Live sources" />
          <Stat value="0%" label="Upfront" tone="success" />
        </dl>
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
                  <p className="text-[13px] font-semibold text-success tabular-nums">
                    {row.a}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-ink-2">
                    {row.d}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-soft text-success text-[11px] font-bold tabular-nums">
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

function Stat({
  value,
  label,
  tone = "default",
}: {
  value: string;
  label: string;
  tone?: "default" | "success";
}) {
  return (
    <div className="text-center">
      <dt
        className={`font-bold text-[clamp(28px,4.2vw,44px)] leading-none tracking-[-0.02em] tabular-nums ${
          tone === "success" ? "text-success" : "text-ink"
        }`}
      >
        {value}
      </dt>
      <dd className="mt-2 text-[12px] font-semibold tracking-[0.12em] uppercase text-ink-2">
        {label}
      </dd>
    </div>
  );
}
