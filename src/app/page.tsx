import Script from "next/script";
import { auth } from "@/lib/auth";
import {
  EditorialShell,
  EditorialNav,
  EditorialHero,
  FoundersNote,
  HowItWorksStep,
  SmartFillProof,
  EditorialFAQ,
  EditorialFooter,
} from "@/components/landing";

export const revalidate = 3600;

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://grantpilot.dev";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "GrantPilot",
  applicationCategory: "BusinessApplication",
  description:
    "AI-powered platform that finds grants and scholarships, drafts applications and essays, and predicts your score. For organizations and students.",
  url: SITE_URL,
  operatingSystem: "Web",
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
    { "@type": "Offer", name: "Student Pro", price: "9.99", priceCurrency: "USD" },
    { "@type": "Offer", name: "Pro", price: "79", priceCurrency: "USD" },
    { "@type": "Offer", name: "Organization", price: "249", priceCurrency: "USD" },
  ],
  featureList: [
    "AI grant and scholarship matching",
    "Smart Fill — auto-draft proposals and essays",
    "Score prediction before you submit",
    "141+ scholarship database for students",
    "Federal, state, and foundation grants for organizations",
    "Success fee pricing — pay only when you win",
  ],
};

const faqs = [
  {
    q: "What types of grants and scholarships do you cover?",
    a: "For organizations: federal (SAM.gov, Grants.gov), state, and foundation grants — SBIR/STTR, NIH, NSF, USDA, DOE, and 2,000+ programs across 12 real-time sources. For students: 141+ scholarships including merit, need-based, STEM, minority-focused, essay contests, and niche awards.",
  },
  {
    q: "How does Smart Fill actually work?",
    a: "Smart Fill reads the complete RFP or scholarship prompt, maps every scoring criterion, then drafts each section using your organization's data or student profile. It auto-optimizes up to 3 rounds until every criterion scores maximum points. You see exactly what the AI changed, why, and how it maps to the rubric.",
  },
  {
    q: "What is the success fee?",
    a: "You pay nothing until you win. Students on the free plan pay 8% of any scholarship won through GrantPilot; Student Pro reduces it to 3%. Organizations pay 2-5% depending on plan. Every plan includes a success fee — we earn when you earn. Compared to grant consultants who charge $5K-$15K per application, our model is a fraction of the cost.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Your data is encrypted in transit (TLS 1.3) and at rest. Hosted on Vercel and Supabase with enterprise-grade infrastructure. Your data is never shared or used to train AI models.",
  },
  {
    q: "Can students really auto-apply to multiple scholarships at once?",
    a: "Yes. Build your profile once, and our AI drafts a personalized essay for each scholarship using your personal statement and activities. Review them in a batch queue — approve, edit, or skip — then submit all approved applications in one click.",
  },
  {
    q: "What's the Grant Guarantee?",
    a: "We're building toward a Grant Guarantee for Pro plans: if you don't win within 12 months, we'll extend your subscription free. This will launch once we have enough data to back it. For now, all paid plans include a 21-day free trial — cancel anytime if you're not seeing results.",
  },
];

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const destinationHref = "/dashboard";
  const ctaHref = isLoggedIn ? destinationHref : "/signup";
  const ctaLabel = isLoggedIn ? "Go to dashboard" : "Start free";

  return (
    <EditorialShell>
      <Script id="json-ld" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(jsonLd)}
      </Script>

      <EditorialNav state={{ loggedIn: isLoggedIn, destinationHref }} />

      <EditorialHero primaryCtaHref={ctaHref} primaryCtaLabel={ctaLabel} />

      <FoundersNote />

      <section
        id="how-it-works"
        className="container mx-auto px-4 sm:px-6 py-20 md:py-32"
      >
        <HowItWorksStep
          number="01"
          title="We index the funders."
          body={
            <p>
              We watch 12 live sources — Grants.gov, SAM.gov, NIH Reporter,
              NSF, SBIR, plus federal, state, and foundation databases — and
              bring the relevant opportunities into one place. Over 2,000
              grants and 141+ scholarships, updated every morning.
            </p>
          }
          imageSrc="/landing/howitworks-1.webp"
          imageAlt="Schematic of GrantPilot's 12 live grant data sources flowing into a unified index."
        />
        <HowItWorksStep
          number="02"
          title="We match what you'd actually win."
          body={
            <p>
              Tell us about your work once. We filter out the grants you
              don&apos;t qualify for and rank the ones you do by predicted
              match score — so you spend time on the applications you can
              actually win.
            </p>
          }
          imageSrc="/landing/howitworks-2.webp"
          imageAlt="GrantPilot's match-score interface showing ranked grants for an example nonprofit profile."
          reverse
        />
        <HowItWorksStep
          number="03"
          title="We draft against the rubric."
          body={
            <p>
              Smart Fill reads the complete RFP, maps every scoring criterion
              to your data, drafts each section, and auto-optimizes up to
              three rounds until every criterion scores maximum points.
            </p>
          }
          imageSrc="/landing/howitworks-3.webp"
          imageAlt="Side-by-side of an RFP's scoring rubric and the draft sections produced by Smart Fill."
        />
      </section>

      <SmartFillProof />

      <section className="border-t border-rule container mx-auto px-4 sm:px-6 py-20 md:py-32">
        <div className="max-w-[60ch] mx-auto text-center">
          <p className="text-[13px] font-medium tracking-[0.16em] uppercase text-ink-2 mb-6">
            Pricing
          </p>
          <h2 className="font-display text-[clamp(36px,5vw,64px)] leading-[1.05] tracking-[-0.02em] text-ink mb-6">
            You only pay when you win.
          </h2>
          <p className="text-[18px] leading-[1.625] text-ink-2 mb-10">
            Compared to grant consultants who charge $5K–$15K per
            application, we earn 2–5% on a win — and nothing if you don&apos;t.
          </p>
          <a
            href="/pricing"
            className="text-accent hover:text-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]"
          >
            See full pricing →
          </a>
        </div>
      </section>

      <EditorialFAQ items={faqs} />

      <section className="container mx-auto px-4 sm:px-6 py-20 md:py-32 text-center">
        <h2 className="font-display text-[clamp(36px,5vw,64px)] leading-[1.05] tracking-[-0.02em] text-ink mb-10 max-w-[20ch] mx-auto">
          Find the grant you&apos;d almost have given up on.
        </h2>
        <a
          href={ctaHref}
          className="inline-flex items-center gap-2 bg-accent text-surface px-8 py-4 font-medium tracking-tight hover:bg-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]"
        >
          {ctaLabel}
        </a>
      </section>

      <EditorialFooter />
    </EditorialShell>
  );
}
