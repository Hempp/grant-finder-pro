import Image from "next/image";
import { SmallCapsEyebrow } from "./SmallCapsEyebrow";

export function SmartFillProof() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-20 md:py-32">
      <div className="grid grid-cols-12 gap-6 items-center">
        <div className="col-span-12 md:col-span-5">
          <SmallCapsEyebrow className="mb-6">
            Smart Fill in 30 seconds
          </SmallCapsEyebrow>
          <h2 className="font-display text-[clamp(36px,5vw,64px)] leading-[1.05] tracking-[-0.02em] text-ink mb-6">
            From RFP to ready-to-submit in under a minute.
          </h2>
          <p className="text-[16px] leading-[1.625] text-ink-2 max-w-[52ch]">
            Smart Fill reads the complete RFP or scholarship prompt, maps
            every scoring criterion to your organization&apos;s data, drafts
            each section, and auto-optimizes up to three rounds until every
            criterion scores maximum points. You see what changed, why, and
            how it maps to the rubric.
          </p>
        </div>
        <div className="col-span-12 md:col-span-7">
          <Image
            src="/landing/smart-fill-mockup.webp"
            alt="Smart Fill rubric-mapping view, with each section of the draft annotated with its rubric criterion and predicted score."
            width={960}
            height={720}
            className="w-full h-auto rounded-sm shadow-[0_1px_0_#FFF_inset,0_1px_2px_rgba(20,16,8,0.04)]"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
