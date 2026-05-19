import { ReactNode } from "react";
import Image from "next/image";

export function HowItWorksStep({
  number,
  title,
  body,
  imageSrc,
  imageAlt,
  reverse = false,
}: {
  number: string; // "01", "02", "03"
  title: string;
  body: ReactNode;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-12 gap-6 items-center py-12 ${
        reverse ? "md:[&>*:first-child]:order-last" : ""
      }`}
    >
      <div className="col-span-12 md:col-span-6">
        <p className="font-display text-[44px] text-accent leading-none mb-4">
          {number}
        </p>
        <h3 className="font-display text-[clamp(28px,3.5vw,44px)] leading-[1.1] text-ink mb-4">
          {title}
        </h3>
        <div className="text-[16px] leading-[1.625] text-ink-2 max-w-[52ch]">
          {body}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6">
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={640}
          height={480}
          className="w-full h-auto"
          loading="lazy"
        />
      </div>
    </div>
  );
}
