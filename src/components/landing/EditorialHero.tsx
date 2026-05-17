import { SignatureMark } from "./SignatureMark";
import { EditorialCTA } from "./EditorialCTA";

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
      className="container mx-auto px-4 sm:px-6 pt-12 pb-20 md:pt-20 md:pb-32 lg:pt-28 lg:pb-40 overflow-hidden"
    >
      <div className="grid grid-cols-12 gap-6 items-center">
        <div className="col-span-12 md:col-span-7 lg:col-span-7">
          <h1 className="font-display font-normal text-[clamp(48px,8vw,96px)] leading-[1.02] tracking-[-0.03em] text-ink mb-8">
            Stop writing grants.
            <br />
            <span className="font-medium">Start winning them.</span>
          </h1>
          <p className="text-[18px] leading-[1.55] text-ink-2 max-w-[56ch] mb-10">
            Tell us about your work once. We surface grants you actually
            qualify for, draft each section against the funder&apos;s rubric,
            and show you a score before you submit.
            <span className="block mt-3 font-medium text-ink">
              No upfront cost. We earn a small percentage only when you win.
            </span>
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-12">
            <EditorialCTA href={primaryCtaHref}>{primaryCtaLabel}</EditorialCTA>
            <EditorialCTA href="#how-it-works" variant="secondary">
              See how it works →
            </EditorialCTA>
          </div>
          <div className="pt-6 border-t border-rule">
            <ul className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-[13px] font-medium tracking-[0.04em] uppercase text-ink-2">
              <li>
                <span className="font-mono text-ink mr-1.5">2,000+</span>
                grants indexed
              </li>
              <li aria-hidden="true" className="text-rule">·</li>
              <li>
                <span className="font-mono text-ink mr-1.5">141+</span>
                scholarships
              </li>
              <li aria-hidden="true" className="text-rule">·</li>
              <li>
                <span className="font-mono text-ink mr-1.5">12</span>
                live sources
              </li>
              <li aria-hidden="true" className="text-rule">·</li>
              <li>
                <span className="font-mono text-ink mr-1.5">0%</span>
                upfront
              </li>
            </ul>
          </div>
        </div>
        <div className="col-span-12 md:col-span-5 lg:col-span-5 hero-bleed flex justify-center md:justify-end order-first md:order-last">
          <SignatureMark className="w-[200px] md:w-[280px] lg:w-[480px]" />
        </div>
      </div>
    </section>
  );
}
