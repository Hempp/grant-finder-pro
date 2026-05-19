import { SmallCapsEyebrow } from "./SmallCapsEyebrow";

interface FAQItem {
  q: string;
  a: string;
}

export function EditorialFAQ({ items }: { items: FAQItem[] }) {
  return (
    <section
      id="faq"
      className="border-t border-rule py-20 md:py-32"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-[60ch] mx-auto">
          <SmallCapsEyebrow className="mb-12">Questions</SmallCapsEyebrow>
          <div>
            {items.map((item) => (
              <details
                key={item.q}
                className="group border-b border-rule py-6"
              >
                <summary className="cursor-pointer font-display text-[22px] leading-[1.3] text-ink list-none flex justify-between items-start gap-4">
                  <span>{item.q}</span>
                  <span
                    aria-hidden="true"
                    className="text-ink-2 transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] group-open:rotate-45 text-2xl leading-none mt-1"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 text-[16px] leading-[1.7] text-ink-2">
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
