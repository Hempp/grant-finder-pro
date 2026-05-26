import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "GrantPilot terms of service — usage terms, success fees, and grant guarantee conditions.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div
      data-theme="editorial"
      style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}
    >
      <header style={{ borderBottom: "1px solid var(--rule)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center" aria-label="GrantPilot home">
            <img src="/logo.svg" alt="" height={28} style={{ height: 28, width: "auto" }} />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1 transition-colors hover:underline"
            style={{ color: "var(--ink-2)", fontSize: "var(--text-body-sm)" }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1
          className="font-semibold tracking-tight mb-3"
          style={{ fontSize: "var(--text-display)", color: "var(--ink)", lineHeight: 1.1 }}
        >
          Terms of Service
        </h1>
        <p
          className="mb-10"
          style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
        >
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>

        <LegalSection title="1. Service description">
          <p>
            GrantPilot is an AI-powered platform that helps organizations discover, match, and apply for grants. Our Smart Fill technology generates grant applications using your organization&apos;s data and optimizes them for each funder&apos;s scoring criteria. We also provide a Content Library, grant matching, deadline alerts, and application tracking.
          </p>
        </LegalSection>

        <LegalSection title="2. Eligibility">
          <p>
            You must be at least 18 years old and authorized to bind your organization to these terms. By creating an account, you represent that you have the authority to enter into this agreement on behalf of your organization.
          </p>
        </LegalSection>

        <LegalSection title="3. Account responsibilities">
          <p>
            You are responsible for maintaining the security of your account credentials, providing accurate information, and all activity under your account. One account per organization unless on an Organization plan with team seats. Notify us immediately at{" "}
            <ExtLink href="mailto:support@grantpilot.dev">support@grantpilot.dev</ExtLink> if you suspect unauthorized access.
          </p>
        </LegalSection>

        <LegalSection title="4. Subscription plans &amp; billing">
          <p>
            <Strong>Plans:</Strong> Starter (free), Growth ($29/mo), Pro ($79/mo), Organization ($249/mo). Annual billing is available at a discount.
          </p>
          <p>
            <Strong>Auto-renewal:</Strong> paid subscriptions renew automatically. You can cancel anytime from your dashboard settings. Cancellation takes effect at the end of the current billing period.
          </p>
          <p>
            <Strong>Refunds:</Strong> we offer a full refund within 14 days of your first paid subscription if you are unsatisfied. After 14 days, no refunds are provided for partial billing periods.
          </p>
        </LegalSection>

        <LegalSection title="5. Success fees">
          <p>
            Paid plans include a success fee on grants won using GrantPilot&apos;s Smart Fill feature. Rates by plan: <Strong>Growth (5%)</Strong> on grants $10K+, <Strong>Pro (3%)</Strong>, <Strong>Organization (2%)</Strong>. Success fees are invoiced when you report a grant award. You must report grant outcomes within 30 days of notification. Failure to report may result in estimated fees based on the grant&apos;s listed amount.
          </p>
        </LegalSection>

        <LegalSection title="6. Grant guarantee">
          <p>
            Pro and Organization plans include the Grant Guarantee: if you do not win a grant within 12 months of subscribing, we extend your subscription 3 months free. To qualify, you must submit at least 10 applications using Smart Fill during the 12-month period. The guarantee does not apply to grants where the applicant was deemed ineligible by the funder.
          </p>
        </LegalSection>

        <LegalSection title="7. Acceptable use">
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1.5" style={{ color: "var(--ink-2)" }}>
            <li>Submit fraudulent or materially false information in grant applications</li>
            <li>Misrepresent your organization&apos;s qualifications, capacity, or track record</li>
            <li>Use the platform to apply for grants you know you are ineligible for</li>
            <li>Scrape, reverse-engineer, or attempt to extract source code from the platform</li>
            <li>Share account access with unauthorized parties or resell platform access</li>
            <li>Interfere with platform operations or circumvent security measures</li>
          </ul>
        </LegalSection>

        <LegalSection title="8. Intellectual property">
          <p>
            <Strong>GrantPilot owns:</Strong> the platform, algorithms, UI/UX, brand assets, and all proprietary technology.
          </p>
          <p>
            <Strong>You own:</Strong> your organization data, uploaded documents, Content Library entries, and the grant applications generated for you. You grant us a limited license to process this content solely to provide our services.
          </p>
        </LegalSection>

        <LegalSection title="9. AI-generated content disclaimer">
          <p>
            AI-generated grant applications are <Strong>drafts that require human review</Strong>. GrantPilot does not guarantee the accuracy, completeness, or suitability of any AI-generated content. You are solely responsible for reviewing, editing, and approving all application content before submission. GrantPilot is not a law firm, financial advisor, or grant consultant — our platform is a productivity tool, not professional advice.
          </p>
        </LegalSection>

        <LegalSection title="10. Limitation of liability">
          <p>
            To the maximum extent permitted by law, GrantPilot&apos;s total liability to you for any claims arising from or related to these terms or the service shall not exceed the <Strong>total fees you paid in the 12 months preceding the claim</Strong>. We are not liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, lost data, or loss of grant funding opportunities.
          </p>
        </LegalSection>

        <LegalSection title="11. Indemnification">
          <p>
            You agree to indemnify and hold harmless GrantPilot from any claims, damages, or expenses arising from: (a) your use of the platform, (b) false or misleading information you provide in grant applications, (c) your violation of these terms, or (d) your violation of any applicable law or regulation.
          </p>
        </LegalSection>

        <LegalSection title="12. Termination">
          <p>
            <Strong>By you:</Strong> cancel your subscription anytime from dashboard settings. Your account remains active until the end of the billing period.
          </p>
          <p>
            <Strong>By us:</Strong> we may suspend or terminate your account immediately for material breach of these terms (fraud, abuse, non-payment). For other reasons, we will provide 30 days notice.
          </p>
          <p>
            <Strong>Data export:</Strong> upon termination, you have 30 days to export your data. After that period, we permanently delete your account data.
          </p>
        </LegalSection>

        <LegalSection title="13. Dispute resolution">
          <p>
            Any disputes arising from these terms shall be resolved through <Strong>binding arbitration</Strong> under the rules of the American Arbitration Association, conducted in Delaware. You may opt out of arbitration for claims that qualify for small claims court. Class actions and class arbitrations are waived. These terms are governed by the laws of the State of Delaware.
          </p>
        </LegalSection>

        <LegalSection title="14. Force majeure">
          <p>
            Neither party shall be liable for failures caused by events beyond reasonable control, including natural disasters, government actions, internet outages, or third-party service failures.
          </p>
        </LegalSection>

        <LegalSection title="15. Severability">
          <p>
            If any provision of these terms is found unenforceable, the remaining provisions continue in full force and effect.
          </p>
        </LegalSection>

        <LegalSection title="16. Entire agreement">
          <p>
            These terms, together with our{" "}
            <Link href="/privacy" className="hover:underline" style={{ color: "var(--accent)" }}>
              Privacy Policy
            </Link>
            , constitute the entire agreement between you and GrantPilot. They supersede all prior agreements and understandings.
          </p>
        </LegalSection>

        <LegalSection title="17. Contact">
          <p>
            For questions about these terms, contact us at{" "}
            <ExtLink href="mailto:legal@grantpilot.dev">legal@grantpilot.dev</ExtLink>.
          </p>
        </LegalSection>
      </main>
    </div>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2
        className="font-semibold tracking-tight mb-4"
        style={{ fontSize: "var(--text-title)", color: "var(--ink)" }}
      >
        {title}
      </h2>
      <div
        className="space-y-4"
        style={{ fontSize: "var(--text-body)", color: "var(--ink-2)", lineHeight: 1.7 }}
      >
        {children}
      </div>
    </section>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return (
    <strong className="font-semibold" style={{ color: "var(--ink)" }}>
      {children}
    </strong>
  );
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isMailto = href.startsWith("mailto:");
  return (
    <a
      href={href}
      target={isMailto ? undefined : "_blank"}
      rel={isMailto ? undefined : "noopener noreferrer"}
      className="hover:underline"
      style={{ color: "var(--accent)" }}
    >
      {children}
    </a>
  );
}
