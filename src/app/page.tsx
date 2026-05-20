import Script from "next/script";
import { auth } from "@/lib/auth";
import {
  EditorialShell,
  EditorialNav,
  EditorialHero,
  HowItWorksStep,
  HowItWorksMockup1,
  HowItWorksMockup2,
  HowItWorksMockup3,
  SmartFillProof,
  EditorialFAQ,
  EditorialFooter,
  CtaBanner,
  ComparisonSection,
  PricingCards,
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
    q: "How is this different from hiring a $5K–$15K grant consultant?",
    a: "Consultants charge upfront whether you win or lose, often $5K–$15K per application. GrantPilot charges nothing until you win. Organizations pay 2–5% on grants won; students pay 8% on the free plan or 3% on Student Pro. If you don't win, we don't either.",
  },
  {
    q: "What types of grants and scholarships do you cover?",
    a: "For organizations: federal (SAM.gov, Grants.gov), state, and foundation grants — SBIR/STTR, NIH, NSF, USDA, DOE, and 2,000+ programs across 12 real-time sources. For students: 141+ scholarships including merit, need-based, STEM, minority-focused, essay contests, and niche awards.",
  },
  {
    q: "How does Smart Fill actually work?",
    a: "Smart Fill reads the complete RFP or scholarship prompt, maps every scoring criterion, then drafts each section using your organization's data or student profile. It auto-optimizes up to 3 rounds until every criterion scores maximum points. You see exactly what the AI changed, why, and how it maps to the rubric.",
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
    q: "What if my work doesn't have many matches yet?",
    a: "Tell us your work, location, and audience once. We'll surface every grant and scholarship you qualify for across 12 live sources, ranked by predicted score. If we can't find at least three relevant matches in your first week, we'll work with you to expand your profile or refund any plan charges — no questions.",
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
          mockup={<HowItWorksMockup1 />}
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
          mockup={<HowItWorksMockup2 />}
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
          mockup={<HowItWorksMockup3 />}
        />
      </section>

      <SmartFillProof />

      <ComparisonSection />
      <PricingCards ctaHref={ctaHref} ctaLabel={ctaLabel} />

      <EditorialFAQ items={faqs} />

      <CtaBanner ctaHref={ctaHref} ctaLabel={ctaLabel} />

      <EditorialFooter />
    </EditorialShell>
  );
}
