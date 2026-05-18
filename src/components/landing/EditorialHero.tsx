import { Fragment } from "react";
import { EditorialCTA } from "./EditorialCTA";

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
 * v5 hero. Asymmetric editorial composition built around a single
 * signature MatchCard rather than a dashboard mock. The product
 * moment is one grant rendered confidently — large title, giant
 * mono amount, giant green match score, inline draft CTA. The
 * headline + supporting copy orbit on the left; the card and two
 * floating activity toasts anchor the right.
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
      className="relative container mx-auto px-4 sm:px-6 pt-12 md:pt-20 lg:pt-24 pb-16 md:pb-24 overflow-hidden"
    >
      <Aurora />

      <div className="grid grid-cols-12 gap-y-16 lg:gap-x-12 items-center">
        <div className="col-span-12 lg:col-span-7">
          <p className="inline-flex items-center gap-2 font-mono text-[11px] md:text-[12px] font-medium tracking-[0.18em] uppercase text-accent mb-7 px-3.5 py-1.5 rounded-full border border-accent/25 bg-accent-soft/50 backdrop-blur-sm">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full rounded-full bg-accent opacity-60 animate-ping motion-reduce:hidden" />
              <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
            </span>
            AI Grant Discovery · Live
          </p>

          <h1 className="font-display font-normal text-[clamp(44px,7.5vw,96px)] leading-[0.98] tracking-[-0.035em] text-ink mb-7">
            Stop writing grants.
            <br />
            <span className="font-medium">Start winning them.</span>
          </h1>

          <p className="text-[18px] md:text-[19px] leading-[1.55] text-ink-2 max-w-[560px] mb-8">
            Tell us your work once. GrantPilot surfaces the grants you
            actually qualify for, drafts each section against the funder&apos;s
            rubric, and predicts your score — all before you submit.
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
            No credit card · 21-day free trial ·{" "}
            <span className="text-success font-medium">0% upfront</span>
          </p>

          <TrustBar />
        </div>

        <div className="col-span-12 lg:col-span-5">
          <div className="relative max-w-[480px] mx-auto lg:mx-0 lg:ml-auto">
            <div
              className="absolute inset-0 translate-x-3 translate-y-3 bg-surface border border-rule rounded-2xl opacity-50 -z-10"
              aria-hidden="true"
            />
            <MatchCard />
            <FloatingNotification
              className="hidden sm:flex absolute -top-4 -right-4 md:-right-8"
              tone="success"
              title="Match found"
              subtitle="NSF SBIR · score 94"
            />
            <FloatingNotification
              className="hidden sm:flex absolute -bottom-4 -left-4 md:-left-8"
              tone="accent"
              title="Draft optimized"
              subtitle="3 of 3 criteria · 100%"
            />
          </div>
        </div>
      </div>

      <div className="mt-20 md:mt-24 pt-10 border-t border-rule max-w-5xl mx-auto">
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
      <div className="absolute top-[6%] left-[12%] w-[680px] h-[680px] bg-accent-soft rounded-full blur-[160px] opacity-55 motion-reduce:opacity-30" />
      <div className="absolute top-[30%] right-[8%] w-[560px] h-[560px] bg-success-soft rounded-full blur-[160px] opacity-45 motion-reduce:opacity-25" />
      <div className="absolute bottom-[8%] left-[35%] w-[420px] h-[420px] bg-warn-soft rounded-full blur-[160px] opacity-30 motion-reduce:opacity-15" />
    </div>
  );
}

function TrustBar() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 max-w-[560px]">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-2/70 mr-2">
        Indexes
      </p>
      {INDEXED_FUNDERS.map((funder, i) => (
        <Fragment key={funder}>
          <span className="text-[13px] font-medium tracking-tight text-ink-2/75 hover:text-ink transition-colors">
            {funder}
          </span>
          {i < INDEXED_FUNDERS.length - 1 && (
            <span className="text-ink-2/25" aria-hidden="true">
              ·
            </span>
          )}
        </Fragment>
      ))}
    </div>
  );
}

function MatchCard() {
  return (
    <article className="relative bg-surface border border-rule rounded-2xl shadow-[0_32px_64px_-16px_rgba(15,23,42,0.22),0_12px_24px_-6px_rgba(15,23,42,0.1)] overflow-hidden">
      <header className="flex items-center justify-between px-6 pt-6">
        <div className="inline-flex items-center gap-2">
          <span className="size-7 rounded-md bg-accent-soft text-accent flex items-center justify-center font-mono font-medium text-[11px]">
            NSF
          </span>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-ink-2">
              Federal Grant
            </p>
            <p className="text-[12px] text-ink-2">National Science Foundation</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-soft text-success text-[11px] font-mono font-medium">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full rounded-full bg-success opacity-60 animate-ping motion-reduce:hidden" />
            <span className="relative inline-flex size-1.5 rounded-full bg-success" />
          </span>
          New match
        </span>
      </header>

      <div className="px-6 pt-5 pb-6">
        <h3 className="font-display font-medium text-[28px] leading-[1.1] tracking-[-0.015em] text-ink mb-1">
          SBIR Phase I
        </h3>
        <p className="text-[15px] text-ink-2 mb-6">
          Software &amp; Information Systems · R&amp;D commercialization
        </p>

        <div className="grid grid-cols-2 gap-4 pb-6 border-b border-rule">
          <div>
            <p className="font-mono font-medium text-[40px] leading-none tracking-[-0.02em] text-success mb-1.5">
              $275K
            </p>
            <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-ink-2">
              Award amount
            </p>
          </div>
          <div>
            <p className="font-mono font-medium text-[40px] leading-none tracking-[-0.02em] text-success mb-1.5">
              94
              <span className="text-ink-2 text-[20px] font-mono ml-0.5">
                /100
              </span>
            </p>
            <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-ink-2">
              Predicted score
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-5">
          <div className="flex items-center gap-3">
            <div>
              <p className="font-mono text-[13px] text-ink">Mar 12, 2026</p>
              <p className="text-[11px] font-mono uppercase tracking-[0.1em] text-ink-2">
                Due in 28 days
              </p>
            </div>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:text-ink transition-colors"
          >
            Draft this →
          </a>
        </div>
      </div>

      <div className="flex items-center gap-2 px-6 py-3 bg-bg/60 border-t border-rule">
        <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-ink-2">
          Rubric coverage
        </p>
        <div className="flex-1 h-1 rounded-full bg-rule overflow-hidden">
          <div className="h-full w-[94%] bg-gradient-to-r from-accent via-accent to-success rounded-full" />
        </div>
        <p className="font-mono text-[11px] font-medium text-ink">94%</p>
      </div>
    </article>
  );
}

function FloatingNotification({
  className = "",
  tone,
  title,
  subtitle,
}: {
  className?: string;
  tone: "success" | "accent";
  title: string;
  subtitle: string;
}) {
  const dotColor = tone === "success" ? "bg-success" : "bg-accent";
  const dotRing = tone === "success" ? "bg-success/40" : "bg-accent/40";
  return (
    <div
      className={`items-center gap-3 bg-surface border border-rule rounded-xl shadow-[0_12px_32px_-8px_rgba(15,23,42,0.22),0_2px_6px_-2px_rgba(15,23,42,0.08)] px-4 py-3 max-w-[240px] ${className}`}
    >
      <div className="relative flex size-2.5 shrink-0">
        <span
          className={`absolute inline-flex size-full rounded-full ${dotRing} animate-ping motion-reduce:hidden`}
        />
        <span className={`relative inline-flex size-2.5 rounded-full ${dotColor}`} />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-[12px] font-medium text-ink truncate">{title}</p>
        <p className="text-[11px] text-ink-2 truncate">{subtitle}</p>
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
