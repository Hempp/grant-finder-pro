import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "GrantPilot privacy policy — how we collect, use, and protect your data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
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
          Privacy Policy
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

        <LegalSection title="1. Information we collect">
          <p>
            <Strong>Account data:</Strong> name, email address, password (hashed), and authentication tokens when you create an account or sign in.
          </p>
          <p>
            <Strong>Organization data:</Strong> organization name, mission, EIN, address, team size, annual budget, and other profile details you provide.
          </p>
          <p>
            <Strong>Documents &amp; content:</Strong> files you upload, Content Library entries, grant application drafts, and any text you enter into the platform.
          </p>
          <p>
            <Strong>Usage data:</Strong> pages visited, features used, application outcomes you report, timestamps, browser type, IP address, and device information.
          </p>
        </LegalSection>

        <LegalSection title="2. How we use your information">
          <p>
            We use your data to: (a) match you with relevant grant opportunities, (b) generate and optimize grant applications using AI, (c) populate your Content Library for reuse across applications, (d) send grant alerts and deadline reminders, (e) process payments and manage your subscription, (f) improve our algorithms and platform features, and (g) communicate product updates and support responses.
          </p>
          <p>
            <Strong>We never sell your personal data to third parties.</Strong>
          </p>
        </LegalSection>

        <LegalSection title="3. AI processing">
          <p>
            Your Content Library data, uploaded documents, and organization profile are processed by Anthropic&apos;s Claude API to generate and optimize grant applications. This data is sent to Anthropic&apos;s servers for processing. Per Anthropic&apos;s data policy, API inputs are <Strong>not used to train AI models</Strong>. Data is retained by Anthropic for up to 30 days for safety monitoring, then deleted. See{" "}
            <ExtLink href="https://www.anthropic.com/privacy">Anthropic&apos;s privacy policy</ExtLink>{" "}
            for details.
          </p>
        </LegalSection>

        <LegalSection title="4. Cookies &amp; tracking">
          <p>
            <Strong>Essential cookies:</Strong> session authentication tokens and CSRF protection. Required for the platform to function.
          </p>
          <p>
            <Strong>Preference cookies:</Strong> UI settings such as sidebar state and notification preferences.
          </p>
          <p>
            <Strong>Analytics:</Strong> we use privacy-respecting analytics to understand feature usage and improve the platform. We do not use third-party advertising trackers.
          </p>
        </LegalSection>

        <LegalSection title="5. Data sharing &amp; third parties">
          <p>We share data only with the following service providers, solely for the purposes described:</p>
          <ul className="list-disc pl-6 space-y-1.5" style={{ color: "var(--ink-2)" }}>
            <li>
              <Strong>Anthropic</Strong> — AI processing for grant application generation
            </li>
            <li>
              <Strong>Stripe</Strong> — payment processing and subscription management
            </li>
            <li>
              <Strong>Vercel</Strong> — application hosting and edge delivery
            </li>
            <li>
              <Strong>Supabase / PostgreSQL</Strong> — database hosting
            </li>
          </ul>
          <p>
            We may disclose data if required by law, subpoena, or court order, or to protect the rights and safety of our users.
          </p>
        </LegalSection>

        <LegalSection title="6. Data security">
          <p>
            We use industry-standard encryption: <Strong>TLS 1.3</Strong> for data in transit and <Strong>AES-256</Strong> for data at rest. Passwords are hashed with bcrypt (12 rounds). Payment information is processed by Stripe and never stored on our servers. We conduct regular security reviews and maintain access controls that limit employee access to user data on a need-to-know basis.
          </p>
        </LegalSection>

        <LegalSection title="7. Data retention">
          <p>
            <Strong>Active accounts:</Strong> we retain your data for as long as your account is active.
          </p>
          <p>
            <Strong>Account deletion:</Strong> when you delete your account, we permanently remove your personal data, documents, and Content Library within 30 days. Anonymized usage analytics may be retained.
          </p>
          <p>
            <Strong>Legal obligations:</Strong> we may retain certain records as required by law (e.g., payment records for tax compliance, typically 7 years).
          </p>
        </LegalSection>

        <LegalSection title="8. Your rights">
          <p>Depending on your jurisdiction, you may have the following rights:</p>
          <p>
            <Strong>GDPR (EU/EEA residents):</Strong> right to access, rectify, erase, restrict processing, data portability, and object to processing. You may also lodge a complaint with your local data protection authority.
          </p>
          <p>
            <Strong>CCPA (California residents):</Strong> right to know what data we collect, right to delete, right to opt out of sale (we do not sell data), and right to non-discrimination for exercising your rights.
          </p>
          <p>
            <Strong>All users:</Strong> you can export your data, update your profile, or delete your account from your dashboard settings at any time.
          </p>
        </LegalSection>

        <LegalSection title="9. How to exercise your rights">
          <p>
            Email <ExtLink href="mailto:privacy@grantpilot.dev">privacy@grantpilot.dev</ExtLink> with your request. We will respond within <Strong>30 days</Strong>. We may ask you to verify your identity before processing requests.
          </p>
        </LegalSection>

        <LegalSection title="10. International data transfers">
          <p>
            GrantPilot is based in the United States. If you access our platform from outside the US, your data will be transferred to and processed in the US. We rely on Standard Contractual Clauses (SCCs) and other lawful transfer mechanisms to ensure adequate protection of your data.
          </p>
        </LegalSection>

        <LegalSection title="11. Children's privacy">
          <p>
            GrantPilot is not intended for individuals under 16 years of age. We do not knowingly collect data from children. If you believe a child has provided us with personal data, contact us and we will delete it promptly.
          </p>
        </LegalSection>

        <LegalSection title="12. Changes to this policy">
          <p>
            We may update this policy from time to time. For material changes, we will notify you by email or through the platform at least 30 days before the changes take effect. Continued use after changes constitutes acceptance.
          </p>
        </LegalSection>

        <LegalSection title="13. Contact us">
          <p>
            For privacy questions or data requests, contact us at{" "}
            <ExtLink href="mailto:privacy@grantpilot.dev">privacy@grantpilot.dev</ExtLink>.
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
