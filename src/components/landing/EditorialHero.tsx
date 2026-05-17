import { EditorialCTA } from "./EditorialCTA";

/**
 * Product-led hero. Headline + subhead + single primary CTA on the
 * left; stylized GrantPilot "matches" dashboard wrapped in a laptop
 * device frame on the right. Three-color dashboard palette (green
 * for win-signals, cyan for default state, amber for medium priority)
 * provides visual variety while cyan remains the brand accent.
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
      className="container mx-auto px-4 sm:px-6 pt-10 pb-16 md:pt-16 md:pb-24 lg:pt-20 lg:pb-32 overflow-hidden"
    >
      <div className="grid grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="col-span-12 md:col-span-6">
          <p className="font-mono text-[12px] font-medium tracking-[0.16em] uppercase text-accent mb-6">
            <span className="inline-block size-1.5 rounded-full bg-accent align-middle mr-2" />
            AI Grant Discovery · Live
          </p>
          <h1 className="font-display font-normal text-[clamp(40px,6vw,72px)] leading-[1.05] tracking-[-0.025em] text-ink mb-6">
            Stop writing grants.
            <br />
            <span className="font-medium">Start winning them.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-ink-2 max-w-[52ch] mb-8">
            Tell us about your work once. We surface grants you actually
            qualify for, draft each section against the funder&apos;s rubric,
            and show you a score before you submit.
            <span className="block mt-2 text-ink font-medium">
              You only pay when you win.
            </span>
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <EditorialCTA href={primaryCtaHref}>{primaryCtaLabel}</EditorialCTA>
            <EditorialCTA href="#how-it-works" variant="secondary">
              See how it works →
            </EditorialCTA>
          </div>
          <p className="mt-5 text-[13px] text-ink-2">
            No credit card · 21-day free trial ·{" "}
            <span className="text-success font-medium">0% upfront</span>
          </p>
        </div>

        <div className="col-span-12 md:col-span-6 order-first md:order-last">
          <LaptopFrame>
            <DashboardPreview />
          </LaptopFrame>
        </div>
      </div>

      <div className="mt-16 md:mt-20 pt-10 border-t border-rule">
        <p className="text-[12px] font-medium tracking-[0.16em] uppercase text-ink-2 mb-6">
          What we&apos;ve indexed so far
        </p>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-6">
          <Stat value="2,000+" label="Grants indexed" />
          <Stat value="141+" label="Scholarships" />
          <Stat value="12" label="Live sources" />
          <Stat value="0%" label="Upfront cost" tone="success" />
        </dl>
      </div>
    </section>
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
    <div>
      <dt
        className={`font-mono font-medium text-[clamp(28px,4vw,40px)] leading-none tracking-[-0.02em] ${
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

/**
 * Laptop screen + hinge frame. Subtle MacBook-style chrome so the
 * mock dashboard reads as "on a real device" — common register for
 * the audience (nonprofit directors, founders, students) who all
 * work laptop-first.
 */
function LaptopFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute -inset-8 bg-accent-soft rounded-[40px] -z-10 opacity-40 blur-3xl" />

      <div className="relative bg-device rounded-[14px] p-[8px] pb-[14px] shadow-[0_24px_48px_-12px_rgba(15,23,42,0.28),0_8px_16px_-4px_rgba(15,23,42,0.12)]">
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

      <div className="relative mx-auto h-[8px] w-[65%] bg-gradient-to-b from-device-2/30 via-device-2/10 to-transparent rounded-b-[12px]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-[14%] bg-device-2/40 rounded-b-[3px]" />
      </div>
      <div className="mx-auto h-[1px] w-[45%] bg-gradient-to-r from-transparent via-device-2/20 to-transparent mt-1" />
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
