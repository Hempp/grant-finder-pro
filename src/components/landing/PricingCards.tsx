import { Check } from "lucide-react";
import { EditorialCTA } from "./EditorialCTA";

const ORG_FEATURES = [
  "Federal, state, and foundation indexing",
  "Smart Fill against the RFP rubric",
  "Predicted score before submit",
  "Unlimited applications",
  "Single source-of-truth dashboard",
];

const STUDENT_FEATURES = [
  "141+ scholarship index",
  "Auto-draft personalized essays",
  "Batch submission queue",
  "Predicted score per scholarship",
  "3 % success fee on wins (vs 8 % on free plan)",
];

interface PricingCardsProps {
  ctaHref: string;
  ctaLabel: string;
}

export function PricingCards({ ctaHref, ctaLabel }: PricingCardsProps) {
  return (
    <section id="pricing" className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <p className="text-[12px] font-semibold tracking-[0.14em] uppercase text-accent mb-3">
          Pricing
        </p>
        <h2 className="font-display text-[clamp(28px,3.6vw,42px)] leading-[1.1] tracking-[-0.02em] text-ink mb-3">
          Pick your path. Pay only on a win.
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <article className="rounded-3xl border border-rule p-8 lg:p-10 bg-surface">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-accent mb-3">
            Nonprofits · Founders · Grantmakers
          </p>
          <h3 className="font-display text-[clamp(28px,3.4vw,40px)] leading-none tracking-[-0.02em] text-ink mb-1">
            For organizations
          </h3>
          <dl className="mb-6 mt-4">
            <dt className="sr-only">Price</dt>
            <dd className="flex items-baseline gap-2">
              <span className="text-[64px] font-bold leading-none tracking-[-0.02em] text-ink tabular-nums">0%</span>
              <span className="text-[16px] text-ink-2">upfront</span>
            </dd>
            <dt className="sr-only">Billing</dt>
            <dd className="text-[14px] text-ink-2 mt-2">Pay only on grants won — 2–5 % success fee.</dd>
          </dl>
          <ul className="space-y-3 mb-8">
            {ORG_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-[14px] text-ink">
                <Check className="size-4 text-success shrink-0 mt-0.5" aria-hidden="true" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <EditorialCTA href={ctaHref}>
            {ctaLabel} — pay only on a win
          </EditorialCTA>
        </article>

        <article className="rounded-3xl border border-rule p-8 lg:p-10 bg-surface">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-accent mb-3">
            Scholarship applicants · Undergrad · Grad
          </p>
          <h3 className="font-display text-[clamp(28px,3.4vw,40px)] leading-none tracking-[-0.02em] text-ink mb-1">
            For students
          </h3>
          <dl className="mb-6 mt-4">
            <dt className="sr-only">Price</dt>
            <dd className="flex items-baseline gap-2">
              <span className="text-[64px] font-bold leading-none tracking-[-0.02em] text-ink tabular-nums">$9.99</span>
              <span className="text-[16px] text-ink-2">/ month</span>
            </dd>
            <dt className="sr-only">Billing</dt>
            <dd className="text-[14px] text-ink-2 mt-2">Auto-apply to scholarships you qualify for. Cancel anytime.</dd>
          </dl>
          <ul className="space-y-3 mb-8">
            {STUDENT_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-[14px] text-ink">
                <Check className="size-4 text-success shrink-0 mt-0.5" aria-hidden="true" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <EditorialCTA href="/signup?audience=student">
            Start Student Pro
          </EditorialCTA>
        </article>
      </div>
    </section>
  );
}
