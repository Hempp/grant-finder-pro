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
 * v7 hero. Zeffy-aligned register: pure white substrate, deep navy
 * text, marine blue primary, all sans-serif, centered symmetric
 * composition. The FeatureCarousel below is the standout move —
 * a rotating tile carousel of stylized mini product UIs (find →
 * draft → score → win) on soft pastel backgrounds. Mirrors Zeffy's
 * "show literal product moments instead of metaphors" pattern.
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
      className="relative container mx-auto px-4 sm:px-6 pt-12 md:pt-16 lg:pt-20 pb-12 md:pb-16"
    >
      <div className="max-w-3xl mx-auto text-center">
        <p className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-tight text-accent mb-6 px-3.5 py-1.5 rounded-full bg-accent-soft">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
          For nonprofits, founders &amp; students
        </p>

        <h1 className="text-[clamp(38px,5.5vw,64px)] font-semibold leading-[1.05] tracking-[-0.025em] text-ink mb-6">
          Grants and scholarships,
          <br />
          with <span className="text-accent">zero upfront cost.</span>
        </h1>

        <p className="text-[18px] md:text-[19px] leading-[1.55] text-ink-2 max-w-[600px] mx-auto mb-8">
          Find the funding you actually qualify for, draft each application
          against the funder&apos;s rubric, and predict your score —
          all before you submit. Pay nothing until you win.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
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

      <div className="mt-14 md:mt-20">
        <FeatureCarousel />
      </div>

      <div className="mt-14 md:mt-20">
        <TrustBar />
      </div>

      <HonestStrip />

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

function TrustBar() {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <p className="text-[12px] font-semibold tracking-[0.14em] uppercase text-ink-2 mb-5">
        Indexing funding from
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5">
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
  );
}

function HonestStrip() {
  return (
    <div className="mt-12 md:mt-16 mx-auto max-w-2xl">
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
        className={`font-semibold text-[clamp(28px,4.2vw,44px)] leading-none tracking-[-0.02em] tabular-nums ${
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
