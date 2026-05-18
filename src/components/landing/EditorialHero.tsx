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
 * v4 hero. Centered composition, giant Fraunces headline, aurora
 * gradient glow, trust bar of indexed funders, full-width laptop-
 * framed product preview with two floating activity notifications.
 * Stat strip lives below as the final proof beat before "How It
 * Works." Pattern aligns with modern SaaS heroes (Linear, Resend,
 * Cal.com) — bigger statement, more credibility signals, visible
 * product motion.
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
      className="relative container mx-auto px-4 sm:px-6 pt-14 md:pt-20 lg:pt-28 pb-16 md:pb-24 overflow-hidden"
    >
      <Aurora />

      <div className="max-w-3xl mx-auto text-center">
        <p className="inline-flex items-center gap-2 font-mono text-[11px] md:text-[12px] font-medium tracking-[0.18em] uppercase text-accent mb-8 px-3.5 py-1.5 rounded-full border border-accent/25 bg-accent-soft/50 backdrop-blur-sm">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full rounded-full bg-accent opacity-60 animate-ping" />
            <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
          </span>
          AI Grant Discovery · Live
        </p>

        <h1 className="font-display font-normal text-[clamp(46px,9vw,108px)] leading-[0.98] tracking-[-0.035em] text-ink mb-8">
          Stop writing grants.
          <br />
          <span className="font-medium">Start winning them.</span>
        </h1>

        <p className="text-[18px] md:text-[20px] leading-[1.55] text-ink-2 max-w-[640px] mx-auto mb-10">
          Tell us about your work once. We surface the grants you actually
          qualify for, draft each section against the funder&apos;s rubric,
          and predict your score — all before you submit.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5">
          <EditorialCTA
            href={primaryCtaHref}
            className="text-base md:text-[15px]"
          >
            {primaryCtaLabel} →
          </EditorialCTA>
          <EditorialCTA href="#how-it-works" variant="secondary">
            See how it works
          </EditorialCTA>
        </div>

        <p className="text-[13px] text-ink-2 mb-14">
          No credit card · 21-day free trial ·{" "}
          <span className="text-success font-medium">0% upfront</span>
        </p>

        <TrustBar />
      </div>

      <div className="relative max-w-4xl mx-auto mt-16 md:mt-20">
        <LaptopFrame>
          <DashboardPreview />
        </LaptopFrame>

        <FloatingNotification
          className="hidden sm:flex absolute top-2 -right-3 md:-right-10 lg:-right-16"
          tone="success"
          title="Match found"
          subtitle="NSF SBIR · score 94"
        />
        <FloatingNotification
          className="hidden sm:flex absolute bottom-8 -left-3 md:-left-10 lg:-left-16"
          tone="accent"
          title="Draft optimized"
          subtitle="3 of 3 criteria · 100%"
        />
      </div>

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
      <div className="absolute top-[8%] left-[15%] w-[640px] h-[640px] bg-accent-soft rounded-full blur-[140px] opacity-50 motion-reduce:opacity-30" />
      <div className="absolute top-[35%] right-[10%] w-[520px] h-[520px] bg-success-soft rounded-full blur-[140px] opacity-40 motion-reduce:opacity-25" />
      <div className="absolute bottom-[10%] left-[40%] w-[400px] h-[400px] bg-warn-soft rounded-full blur-[140px] opacity-25 motion-reduce:opacity-15" />
    </div>
  );
}

function TrustBar() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 max-w-[760px] mx-auto">
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
  const dotRing =
    tone === "success" ? "bg-success/40" : "bg-accent/40";
  return (
    <div
      className={`items-center gap-3 bg-surface border border-rule rounded-xl shadow-[0_8px_24px_-6px_rgba(15,23,42,0.18),0_2px_6px_-2px_rgba(15,23,42,0.08)] px-4 py-3 max-w-[240px] ${className}`}
    >
      <div className="relative flex size-2.5 shrink-0">
        <span className={`absolute inline-flex size-full rounded-full ${dotRing} animate-ping`} />
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

function LaptopFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="relative bg-device rounded-[16px] p-[10px] pb-[14px] shadow-[0_32px_64px_-16px_rgba(15,23,42,0.35),0_12px_24px_-6px_rgba(15,23,42,0.16)]">
        <div className="absolute top-[3px] left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          <span className="size-[3px] rounded-full bg-device-2" />
          <span className="text-[8px] font-mono tracking-widest text-device-2/70 leading-none">
            grantpilot
          </span>
        </div>

        <div className="bg-surface rounded-[8px] overflow-hidden">
          {children}
        </div>
      </div>

      <div className="relative mx-auto h-[10px] w-[72%] bg-gradient-to-b from-device-2/35 via-device-2/15 to-transparent rounded-b-[14px]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[4px] w-[14%] bg-device-2/45 rounded-b-[4px]" />
      </div>
      <div className="mx-auto h-[1px] w-[50%] bg-gradient-to-r from-transparent via-device-2/25 to-transparent mt-1.5" />
    </div>
  );
}

function DashboardPreview() {
  return (
    <>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-rule bg-bg/40">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#FF5F57]" />
          <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="size-2.5 rounded-full bg-[#28C840]" />
        </div>
        <p className="ml-3 text-[11px] font-mono text-ink-2 truncate">
          grantpilot.dev / matches
        </p>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.1em] text-ink-2">
          <span className="size-1.5 rounded-full bg-success" />
          Synced 2m ago
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-baseline justify-between mb-4">
          <p className="text-[14px] font-medium text-ink">
            3 new matches today
          </p>
          <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-ink-2">
            Sorted by score
          </p>
        </div>

        <div className="space-y-2.5">
          <GrantRow
            title="NSF SBIR Phase I — Software"
            funder="National Science Foundation"
            amount="$275,000"
            score={94}
            scoreTone="success"
            deadline="Mar 12"
            deadlineTone="default"
          />
          <GrantRow
            title="USDA Rural Innovation Grant"
            funder="USDA Rural Development"
            amount="$150,000"
            score={87}
            scoreTone="accent"
            deadline="Apr 04"
            deadlineTone="default"
          />
          <GrantRow
            title="Ford Foundation · Civic Engagement"
            funder="Ford Foundation"
            amount="$80,000"
            score={82}
            scoreTone="warn"
            deadline="May 21"
            deadlineTone="warn"
          />
        </div>
      </div>
    </>
  );
}

function GrantRow({
  title,
  funder,
  amount,
  score,
  scoreTone,
  deadline,
  deadlineTone,
}: {
  title: string;
  funder: string;
  amount: string;
  score: number;
  scoreTone: "success" | "accent" | "warn";
  deadline: string;
  deadlineTone: "default" | "warn";
}) {
  const scoreClasses = {
    success: "bg-success-soft text-success",
    accent: "bg-accent-soft text-accent",
    warn: "bg-warn-soft text-warn",
  }[scoreTone];
  const scoreDot = {
    success: "bg-success",
    accent: "bg-accent",
    warn: "bg-warn",
  }[scoreTone];
  const deadlineClass =
    deadlineTone === "warn" ? "text-warn" : "text-ink-2";

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-rule hover:border-ink/20 transition-colors">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-ink truncate">{title}</p>
        <p className="text-[11px] text-ink-2 truncate">{funder}</p>
      </div>
      <div className="hidden sm:block text-right shrink-0">
        <p className="font-mono text-[13px] text-success font-medium">
          {amount}
        </p>
        <p
          className={`text-[10px] font-mono uppercase tracking-[0.1em] ${deadlineClass}`}
        >
          Due {deadline}
        </p>
      </div>
      <div className="shrink-0">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-mono font-medium ${scoreClasses}`}
        >
          <span className={`size-1.5 rounded-full ${scoreDot}`} />
          {score}
        </span>
      </div>
    </div>
  );
}
