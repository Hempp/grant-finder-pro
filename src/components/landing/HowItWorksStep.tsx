import type { ReactNode } from "react";

interface HowItWorksStepProps {
  number: string;
  title: string;
  body: ReactNode;
  mockup: ReactNode;
  reverse?: boolean;
}

export function HowItWorksStep({
  number,
  title,
  body,
  mockup,
  reverse = false,
}: HowItWorksStepProps) {
  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-12 md:py-20 ${
        reverse ? "lg:[&>*:first-child]:col-start-2" : ""
      }`}
    >
      <div>
        <p className="text-meta font-semibold tracking-[0.16em] uppercase text-accent mb-4">
          {number}
        </p>
        <h3 className="font-display text-[clamp(24px,3.2vw,36px)] leading-[1.15] tracking-[-0.02em] text-ink mb-4 max-w-[18ch]">
          {title}
        </h3>
        <div className="text-body leading-[1.65] text-ink-2 max-w-[44ch]">
          {body}
        </div>
      </div>
      <div>{mockup}</div>
    </div>
  );
}
