import { SmallCapsEyebrow } from "./SmallCapsEyebrow";

interface FAQItem {
  q: string;
  a: string;
}

export function EditorialFAQ({ items }: { items: FAQItem[] }) {
  return (
    <section
      id="faq"
      aria-label="Frequently asked questions"
      className="border-t border-rule py-20 md:py-32"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-[60ch] mx-auto">
          <SmallCapsEyebrow className="mb-12">Questions</SmallCapsEyebrow>
          <div className="space-y-3">
            {items.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)] [backdrop-filter:blur(var(--glass-blur))] px-5 py-3 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]"
              >
                <summary className="cursor-pointer text-[15px] font-medium text-ink list-none flex items-center justify-between gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                  <span>{item.q}</span>
                  <span
                    aria-hidden="true"
                    className="size-2.5 border-r-2 border-b-2 border-ink-2 -rotate-45 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)] group-open:rotate-45"
                  />
                </summary>
                <p className="mt-3 text-[14px] leading-[1.65] text-ink-2">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
