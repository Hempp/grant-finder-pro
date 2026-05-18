import { Fragment } from "react";
import { EditorialCTA } from "./EditorialCTA";
import { RotatingMatchProof } from "./RotatingMatchProof";

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
 * v6 hero. Audience-named eyebrow, anti-consultant headline, pricing
 * chip elevated from microcopy to a primary visual element, and a
 * billboard-scale RotatingMatchProof cycling between three audience
 * examples (founder / nonprofit / student) as the page's typographic
 * anchor. Honest pre-launch strip below replaces the missing-social-
 * proof gap with structural transparency.
 *
 * Synthesizes four-auditor consensus from the UX/visual/a11y/
 * conversion review: audience naming, MatchProof rotation, pricing
 * promotion, contrast fixes, billboard numerals, honest framing.
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
      className="relative container mx-auto px-4 sm:px-6 pt-12 md:pt-16 lg:pt-24 pb-12 md:pb-20 overflow-hidden"
    >
      <Aurora />

      <div className="grid grid-cols-12 gap-y-16 lg:gap-x-12 items-center">
        <div className="col-span-12 lg:col-span-6">
          <p
            className="inline-flex items-center gap-2 font-mono text-[11px] md:text-[12px] font-medium tracking-[0.18em] uppercase text-accent mb-7 px-3.5 py-1.5 rounded-full border border-accent/30 bg-accent-soft/60"
            aria-label="Audience: nonprofits, founders, and students"
          >
            <span className="relative flex size-1.5">
              <span
                className="absolute inline-flex size-full rounded-full bg-accent opacity-60 animate-ping motion-reduce:hidden"
                aria-hidden="true"
              />
              <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
            </span>
            For nonprofits · founders · students
          </p>

          <h1 className="font-display font-normal text-[clamp(42px,7vw,84px)] leading-[1.02] tracking-[-0.035em] text-ink mb-7">
            Win grants and scholarships
            <br />
            <span className="font-medium">
              without the $10K consultant.
            </span>
          </h1>

          <p className="text-[18px] md:text-[19px] leading-[1.55] text-ink-2 max-w-[560px] mb-7">
            Tell us your work once. GrantPilot surfaces the funding you
            actually qualify for, drafts every section against the funder&apos;s
            rubric, and predicts your score — before you submit.
          </p>

          <p className="inline-flex items-center gap-2 mb-8 px-3.5 py-1.5 rounded-full border border-success/30 bg-success-soft/70">
            <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
            <span className="font-mono text-[11px] md:text-[12px] font-medium tracking-[0.18em] uppercase text-success">
              0% upfront · Pay only when you win
            </span>
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-5">
            <EditorialCTA href={primaryCtaHref}>
              {primaryCtaLabel} →
            </EditorialCTA>
            <EditorialCTA href="#how-it-works" variant="secondary">
              See how it works
            </EditorialCTA>
          </div>

          <p className="text-[13px] text-ink-2 mb-10">
            No credit card · 21-day free trial · Cancel anytime
          </p>

          <TrustBar />
        </div>

        <div className="col-span-12 lg:col-span-6">
          <div className="relative max-w-[560px] mx-auto lg:mx-0 lg:ml-auto">
            <RotatingMatchProof />
          </div>
        </div>
      </div>

      <HonestStrip />

      <div className="mt-16 md:mt-20 pt-10 border-t border-rule max-w-5xl mx-auto">
        <p className="text-[12px] font-medium tracking-[0.16em] uppercase text-ink-2 mb-6 text-center">
          What we&apos;ve indexed so far
        </p>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-8">
          <Stat value="2,000+" label="Grants indexed" />
          <Stat value="141+" label="Scholarships" />
          <Stat value="12" label="Live sources" />
          <Stat value="0%" label="Upfront cost" tone="success" />
        </dl>
      </div>
    </section>
  );
}

function Aurora() {
  return (
    <div
      className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <div className="absolute top-[4%] left-[10%] w-[680px] h-[680px] bg-accent-soft rounded-full blur-[180px] opacity-40 motion-reduce:opacity-20" />
      <div className="absolute top-[30%] right-[5%] w-[560px] h-[560px] bg-success-soft rounded-full blur-[180px] opacity-35 motion-reduce:opacity-15" />
    </div>
  );
}

function TrustBar() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 max-w-[560px]">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-2 mr-2">
        Indexes
      </p>
      {INDEXED_FUNDERS.map((funder, i) => (
        <Fragment key={funder}>
          <span className="text-[13px] font-medium tracking-tight text-ink-2 hover:text-ink transition-colors">
            {funder}
          </span>
          {i < INDEXED_FUNDERS.length - 1 && (
            <span className="text-ink-2/30" aria-hidden="true">
              ·
            </span>
          )}
        </Fragment>
      ))}
    </div>
  );
}

function HonestStrip() {
  return (
    <div className="mt-16 md:mt-20 mx-auto max-w-3xl">
      <div className="flex items-center gap-3 px-5 py-4 rounded-xl border border-rule bg-surface/60 backdrop-blur-sm">
        <span
          className="size-2 rounded-full bg-success shrink-0"
          aria-hidden="true"
        />
        <p className="text-[13px] md:text-[14px] text-ink-2 leading-relaxed">
          <span className="font-mono text-[11px] font-medium tracking-[0.14em] uppercase text-ink mr-2">
            Pre-launch
          </span>
          We&apos;re building in the open. 2,000+ grants indexed across 12 live
          sources. Be one of our first 100 wins and your story replaces this
          strip.
        </p>
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
    <div className="text-center sm:text-left">
      <dt
        className={`font-mono font-medium text-[clamp(28px,4vw,44px)] leading-none tracking-[-0.02em] ${
          tone === "success" ? "text-success" : "text-ink"
        }`}
      >
        {value}
      </dt>
      <dd className="mt-2 text-[12px] font-medium tracking-[0.12em] uppercase text-ink-2">
        {label}
      </dd>
    </div>
  );
}
