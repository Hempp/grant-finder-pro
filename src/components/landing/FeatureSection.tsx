"use client";

import type { ReactNode } from "react";
import { useReveal } from "@/lib/landing/useReveal";

type Tint = 1 | 2 | 3 | 4 | 5;

interface FeatureSectionProps {
  tint: Tint;
  eyebrow: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  mockup: ReactNode;
  reverse?: boolean;
}

const TINT_BG: Record<Tint, string> = {
  1: "bg-[image:var(--section-tint-1)]",
  2: "bg-[image:var(--section-tint-2)]",
  3: "bg-[image:var(--section-tint-3)]",
  4: "bg-[image:var(--section-tint-4)]",
  5: "bg-[image:var(--section-tint-5)]",
};

const TINT_BORDER: Record<Tint, string> = {
  1: "border-[color:var(--section-border-1)]",
  2: "border-[color:var(--section-border-2)]",
  3: "border-[color:var(--section-border-3)]",
  4: "border-[color:var(--section-border-4)]",
  5: "border-[color:var(--section-border-5)]",
};

export function FeatureSection({
  tint,
  eyebrow,
  headline,
  body,
  ctaLabel,
  ctaHref,
  mockup,
  reverse = false,
}: FeatureSectionProps) {
  const { ref, visible } = useReveal();
  return (
    <section
      ref={ref}
      data-reveal={visible ? "visible" : "hidden"}
      className="reveal container mx-auto px-4 sm:px-6"
    >
      <div
        className={`rounded-2xl border ${TINT_BG[tint]} ${TINT_BORDER[tint]} p-8 lg:p-10`}
      >
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start ${
            reverse ? "lg:[&>*:first-child]:col-start-2" : ""
          }`}
        >
          <div>
            <p className="text-meta font-semibold tracking-[0.16em] uppercase text-accent mb-4">
              {eyebrow}
            </p>
            <h3 className="font-display text-[clamp(28px,3.6vw,42px)] leading-[1.1] tracking-[-0.02em] text-ink mb-5 max-w-[18ch]">
              {headline}
            </h3>
            <p className="text-body-lg leading-[1.6] text-ink-2 max-w-[44ch] mb-6">
              {body}
            </p>
            <a
              href={ctaHref}
              className="inline-flex items-center gap-1.5 text-small font-semibold text-accent hover:text-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {ctaLabel} <span aria-hidden="true">→</span>
            </a>
          </div>
          <div>{mockup}</div>
        </div>
      </div>
    </section>
  );
}
