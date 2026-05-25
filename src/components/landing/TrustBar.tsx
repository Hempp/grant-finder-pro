"use client";

import { useReveal } from "@/lib/landing/useReveal";
import { Stat } from "./Stat";
import { FunderLogos } from "./FunderLogos";

export function TrustBar() {
  const { ref, visible } = useReveal();
  return (
    <section
      ref={ref}
      data-reveal={visible ? "visible" : "hidden"}
      className="reveal container mx-auto px-4 sm:px-6 py-14 md:py-20 border-t border-rule"
    >
      <div className="text-center mb-10">
        <p className="text-meta font-semibold tracking-[0.14em] uppercase text-ink-2 mb-7">
          Indexing funding from
        </p>
        <FunderLogos />
      </div>

      <div className="pt-10 mt-10 border-t border-rule/60 max-w-5xl mx-auto">
        <p className="text-meta font-semibold tracking-[0.14em] uppercase text-ink-2 mb-7 text-center">
          What we&apos;ve indexed so far
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-8">
          <Stat value="2,000+" label="Grants" />
          <Stat value="141+" label="Scholarships" />
          <Stat value="12" label="Live sources" />
          <Stat value="0%" label="Upfront" tone="success" />
        </div>
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
