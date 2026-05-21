import { Fragment } from "react";
import { Stat } from "./Stat";

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

export function TrustBar() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-14 md:py-20 border-t border-rule">
      <div className="text-center mb-10">
        <p className="text-meta font-semibold tracking-[0.14em] uppercase text-ink-2 mb-5">
          Indexing funding from
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 max-w-3xl mx-auto">
          {INDEXED_FUNDERS.map((funder, i) => (
            <Fragment key={funder}>
              <span className="text-small md:text-body-sm font-medium tracking-tight text-ink hover:text-accent transition-colors">
                {funder}
              </span>
              {i < INDEXED_FUNDERS.length - 1 && (
                <span className="text-ink-2/40" aria-hidden="true">·</span>
              )}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="pt-10 border-t border-rule/60 max-w-5xl mx-auto">
        <p className="text-meta font-semibold tracking-[0.14em] uppercase text-ink-2 mb-7 text-center">
          What we&apos;ve indexed so far
        </p>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-8">
          <Stat value="2,000+" label="Grants" />
          <Stat value="141+" label="Scholarships" />
          <Stat value="12" label="Live sources" />
          <Stat value="0%" label="Upfront" tone="success" />
        </dl>
      </div>

      <div className="mt-12 mx-auto max-w-2xl">
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border-l-4 border-l-accent border-y border-r border-rule bg-accent-soft/30">
          <p className="text-caption md:text-small text-ink-2 leading-relaxed">
            <span className="text-micro font-semibold tracking-[0.14em] uppercase text-ink mr-2">
              Pre-launch
            </span>
            We&apos;re building in the open. Be one of our first 100 wins and
            your story replaces this strip.
          </p>
        </div>
      </div>
    </section>
  );
}
