import { EditorialCTA } from "./EditorialCTA";

/**
 * Product-led hero. Headline + subhead + single primary CTA on the
 * left; stylized GrantPilot dashboard preview on the right showing
 * three matched grants with cyan match-score chips. Stat strip lives
 * below the grid as quiet inline proof, not as the centerpiece.
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
            <span className="font-medium text-accent">Start winning them.</span>
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
            No credit card · 21-day free trial · 0% upfront
          </p>
        </div>

        <div className="col-span-12 md:col-span-6 order-first md:order-last">
          <DashboardPreview />
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
          <Stat value="0%" label="Upfront cost" accent />
        </dl>
      </div>
    </section>
  );
}

function Stat({
  value,
  label,
  accent = false,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div>
      <dt
        className={`font-mono font-medium text-[clamp(28px,4vw,40px)] leading-none tracking-[-0.02em] ${
          accent ? "text-accent" : "text-ink"
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

function DashboardPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-accent-soft rounded-2xl -z-10 opacity-60 blur-xl" />
      <div className="bg-surface border border-rule rounded-xl shadow-[0_1px_0_#FFF_inset,0_8px_32px_-8px_rgba(15,23,42,0.12),0_2px_8px_-2px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-rule">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-ink-2/30" />
            <span className="size-2.5 rounded-full bg-ink-2/30" />
            <span className="size-2.5 rounded-full bg-ink-2/30" />
          </div>
          <p className="ml-3 text-[12px] font-mono text-ink-2">
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

          <div className="space-y-3">
            <GrantRow
              title="NSF SBIR Phase I — Software"
              funder="National Science Foundation"
              amount="$275,000"
              score={94}
              deadline="Mar 12"
            />
            <GrantRow
              title="USDA Rural Innovation Grant"
              funder="USDA Rural Development"
              amount="$150,000"
              score={87}
              deadline="Apr 04"
            />
            <GrantRow
              title="Ford Foundation · Civic Engagement"
              funder="Ford Foundation"
              amount="$80,000"
              score={82}
              deadline="May 21"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function GrantRow({
  title,
  funder,
  amount,
  score,
  deadline,
}: {
  title: string;
  funder: string;
  amount: string;
  score: number;
  deadline: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-rule hover:border-accent/30 transition-colors">
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium text-ink truncate">{title}</p>
        <p className="text-[12px] text-ink-2 truncate">{funder}</p>
      </div>
      <div className="hidden sm:block text-right">
        <p className="font-mono text-[14px] text-ink">{amount}</p>
        <p className="text-[11px] font-mono uppercase tracking-[0.1em] text-ink-2">
          Due {deadline}
        </p>
      </div>
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent-soft text-accent text-[11px] font-mono font-medium">
          <span className="size-1.5 rounded-full bg-accent" />
          {score}
        </span>
        <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-ink-2">
          Match
        </span>
      </div>
    </div>
  );
}
