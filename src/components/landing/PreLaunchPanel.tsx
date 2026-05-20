export function PreLaunchPanel() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-20 md:py-28">
      <div className="rounded-3xl border border-[color:var(--section-border-2)] bg-[image:var(--panel-prelaunch)] px-8 py-14 md:px-16 md:py-20 text-center max-w-5xl mx-auto">
        <p className="text-[12px] font-semibold tracking-[0.16em] uppercase text-success mb-4">
          Pre-launch
        </p>
        <h2 className="font-display text-[clamp(32px,4.4vw,52px)] leading-[1.1] tracking-[-0.02em] text-ink mb-5 max-w-[22ch] mx-auto">
          Be one of our first 100 wins.
        </h2>
        <p className="text-[16px] md:text-[17px] leading-[1.6] text-ink-2 max-w-[58ch] mx-auto mb-8">
          We&apos;re building in the open. Your story replaces this section
          the moment we have permission to tell it.
        </p>
        <a
          href="/signup"
          className="inline-flex items-center gap-2 text-[15px] font-semibold text-accent hover:text-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Join the launch list <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
