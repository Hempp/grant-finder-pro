interface CtaBannerProps {
  ctaHref: string;
  ctaLabel: string;
}

export function CtaBanner({ ctaHref, ctaLabel }: CtaBannerProps) {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 px-4 sm:px-6 text-center bg-[image:var(--gradient-cta-banner)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.18), transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div className="relative max-w-3xl mx-auto">
        <p className="text-[12px] font-semibold tracking-[0.16em] uppercase text-white/85 mb-4">
          Ready when you are
        </p>
        <h2 className="font-display text-[clamp(36px,5vw,60px)] leading-[1.05] tracking-[-0.02em] text-white mb-5 max-w-[22ch] mx-auto">
          Find the grant you&apos;d almost have given up on.
        </h2>
        <p className="text-[15px] md:text-[16px] text-white/85 mb-9">
          No credit card · 21-day free trial · 0% upfront.
        </p>
        <a
          href={ctaHref}
          className="inline-flex items-center gap-2 bg-white text-accent font-semibold tracking-tight rounded-lg px-7 py-3.5 hover:bg-white/90 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}
