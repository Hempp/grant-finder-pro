import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Data Processing Agreement",
  description:
    "GrantPilot's Data Processing Agreement (DPA) defining the controller/processor relationship, processing purposes, security measures, and data subject rights.",
  alternates: { canonical: "/dpa" },
};

export default function DpaPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

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

      <main id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1
          className="font-semibold tracking-tight mb-3"
          style={{ fontSize: "var(--text-display)", color: "var(--ink)", lineHeight: 1.1 }}
        >
          Data Processing Agreement
        </h1>
        <p
          className="mb-10"
          style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
        >
          Last updated: {lastUpdated}
        </p>

        <div
          className="space-y-4 mb-10"
          style={{ fontSize: "var(--text-body)", color: "var(--ink-2)", lineHeight: 1.7 }}
        >
          <p>
            This Data Processing Agreement (&quot;DPA&quot;) forms part of the{" "}
            <Link href="/terms" className="hover:underline" style={{ color: "var(--accent)" }}>
              Terms of Service
            </Link>{" "}
            between the customer (the &quot;Controller&quot;) and GrantPilot, operated by Hempp LLC (the &quot;Processor&quot;), and governs the Processor&apos;s handling of Personal Data on behalf of the Controller. It is designed to satisfy Article 28 of the EU General Data Protection Regulation (GDPR), the UK GDPR, and analogous provisions of the California Consumer Privacy Act (CCPA).
          </p>
        </div>

        <LegalSection title="1. Definitions">
          <p>
            &quot;Personal Data,&quot; &quot;Controller,&quot; &quot;Processor,&quot; &quot;Processing,&quot; &quot;Data Subject,&quot; and &quot;Subprocessor&quot; have the meanings given in the GDPR. &quot;Services&quot; means the GrantPilot platform and related features accessed by the Controller under the Terms of Service.
          </p>
        </LegalSection>

        <LegalSection title="2. Roles and scope">
          <p>
            The Controller determines the purposes and means of processing the Personal Data it submits to the Services. The Processor processes that Personal Data solely to provide, maintain, and secure the Services, and in accordance with the Controller&apos;s documented instructions as reflected in the Terms of Service, this DPA, and Controller&apos;s use of the Services configuration.
          </p>
        </LegalSection>

        <LegalSection title="3. Categories of data and data subjects">
          <p>
            <Strong>Categories of Personal Data:</Strong> contact details (name, email), organizational profile (mission, EIN, address), user-submitted grant content, uploaded documents, application drafts, billing metadata (via Stripe), and usage / telemetry records.
          </p>
          <p>
            <Strong>Categories of Data Subjects:</Strong> the Controller&apos;s employees, contractors, board members, and any individuals whose information the Controller chooses to include in grant narratives (e.g., key personnel bios).
          </p>
        </LegalSection>

        <LegalSection title="4. Processing purposes and duration">
          <p>
            Processing occurs for the duration of the Controller&apos;s subscription and for any retention period required to comply with the Processor&apos;s legal obligations. Upon termination, the Processor will delete or return Personal Data within 30 days at the Controller&apos;s written request, except for audit log entries retained for forensic and compliance purposes.
          </p>
        </LegalSection>

        <LegalSection title="5. Confidentiality">
          <p>
            The Processor ensures that personnel authorized to process Personal Data are bound by appropriate confidentiality obligations (whether by contract or statutory duty). Production access is limited to named engineers with business need and requires MFA.
          </p>
        </LegalSection>

        <LegalSection title="6. Security measures">
          <p>
            The Processor implements the technical and organizational measures described in the{" "}
            <Link href="/trust" className="hover:underline" style={{ color: "var(--accent)" }}>
              Trust Center
            </Link>
            , including encryption in transit (TLS 1.2+), encryption at rest (provider-managed and, for sensitive PII fields, AES-256-GCM application-side), audit logging, row-level authorization, CSRF and SSRF defenses, and a documented incident response program.
          </p>
        </LegalSection>

        <LegalSection title="7. Subprocessors">
          <p>
            The Controller provides general authorization for the Processor to engage the Subprocessors listed in the Trust Center. Each Subprocessor is bound by data protection obligations substantially similar to those in this DPA. The Processor will provide 30 days&apos; notice of any intended change to its Subprocessors, during which the Controller may object on reasonable data-protection grounds.
          </p>
        </LegalSection>

        <LegalSection title="8. International transfers">
          <p>
            To the extent Personal Data is transferred from the European Economic Area, United Kingdom, or Switzerland to the United States, the parties agree that the Standard Contractual Clauses (EU Commission Implementing Decision 2021/914) Module Two (Controller-to-Processor) are incorporated by reference into this DPA and apply to those transfers. The Processor maintains supplementary measures consistent with the recommendations of the European Data Protection Board.
          </p>
        </LegalSection>

        <LegalSection title="9. Data subject rights">
          <p>
            The Services enable the Controller to respond to Data Subject requests for access, rectification, erasure, portability, and restriction directly through the product (account export and deletion endpoints). Where the Controller requires additional assistance to respond to a Data Subject request, the Processor will cooperate in good faith at no additional charge within the scope reasonable for the complexity and volume of the request.
          </p>
        </LegalSection>

        <LegalSection title="10. Personal data breaches">
          <p>
            The Processor will notify the Controller without undue delay, and in any event within 72 hours, after becoming aware of a Personal Data Breach affecting the Controller&apos;s data. The notification will include the nature of the breach, the categories and approximate volume of records affected (where known), the likely consequences, and the measures taken or proposed to mitigate.
          </p>
        </LegalSection>

        <LegalSection title="11. Audits">
          <p>
            On reasonable request, the Processor will make available information necessary to demonstrate compliance with Article 28 obligations, including current SOC 2 reports (when available) and a written summary of security controls. The Controller may conduct audits no more than annually and at its own expense, subject to 30 days&apos; notice and reasonable confidentiality protections.
          </p>
        </LegalSection>

        <LegalSection title="12. Return and deletion">
          <p>
            On termination of the Services, the Processor will, at the Controller&apos;s choice, delete or return all Personal Data within 30 days, unless retention is required by applicable law. Audit log rows may be retained for the retention period required for legal compliance.
          </p>
        </LegalSection>

        <LegalSection title="13. Liability and indemnity">
          <p>
            Each party&apos;s liability under this DPA is subject to the limitations and exclusions set forth in the Terms of Service. Nothing in this DPA limits either party&apos;s liability to Data Subjects under Article 82 of the GDPR.
          </p>
        </LegalSection>

        <LegalSection title="14. Precedence">
          <p>
            In case of conflict between this DPA and the Terms of Service, this DPA controls with respect to the processing of Personal Data.
          </p>
        </LegalSection>

        <LegalSection title="15. Contact">
          <p>
            Data protection questions or DPA execution requests:{" "}
            <a
              href="mailto:privacy@grantpilot.dev"
              className="hover:underline"
              style={{ color: "var(--accent)" }}
            >
              privacy@grantpilot.dev
            </a>
            . Security reports:{" "}
            <a
              href="mailto:security@grantpilot.dev"
              className="hover:underline"
              style={{ color: "var(--accent)" }}
            >
              security@grantpilot.dev
            </a>
            .
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
