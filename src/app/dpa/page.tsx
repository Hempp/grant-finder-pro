import { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-emerald-400" aria-hidden="true" />
            <span className="font-bold text-white text-lg">GrantPilot</span>
          </Link>
          <Link
            href="/"
            className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
          </Link>
        </div>
      </header>

      <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Data Processing Agreement</h1>
        <p className="text-slate-500 text-sm mb-8">Last updated: {lastUpdated}</p>

        <div className="prose prose-invert prose-slate max-w-none space-y-6">
          <p className="text-slate-400 leading-7">
            This Data Processing Agreement (&quot;DPA&quot;) forms part of the{" "}
            <Link href="/terms" className="text-emerald-400 hover:text-emerald-300">
              Terms of Service
            </Link>{" "}
            between the customer (the &quot;Controller&quot;) and GrantPilot, operated by Hempp LLC
            (the &quot;Processor&quot;), and governs the Processor&apos;s handling of Personal Data on
            behalf of the Controller. It is designed to satisfy Article 28 of the EU General Data
            Protection Regulation (GDPR), the UK GDPR, and analogous provisions of the California
            Consumer Privacy Act (CCPA).
          </p>

          <h2 className="text-xl font-bold text-white mt-8">1. Definitions</h2>
          <p className="text-slate-400 leading-7">
            &quot;Personal Data,&quot; &quot;Controller,&quot; &quot;Processor,&quot;
            &quot;Processing,&quot; &quot;Data Subject,&quot; and &quot;Subprocessor&quot; have the
            meanings given in the GDPR. &quot;Services&quot; means the GrantPilot platform and
            related features accessed by the Controller under the Terms of Service.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">2. Roles and Scope</h2>
          <p className="text-slate-400 leading-7">
            The Controller determines the purposes and means of processing the Personal Data it
            submits to the Services. The Processor processes that Personal Data solely to provide,
            maintain, and secure the Services, and in accordance with the Controller&apos;s
            documented instructions as reflected in the Terms of Service, this DPA, and
            Controller&apos;s use of the Services configuration.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">3. Categories of Data and Data Subjects</h2>
          <p className="text-slate-400 leading-7">
            <strong className="text-slate-200">Categories of Personal Data:</strong> contact details
            (name, email), organizational profile (mission, EIN, address), user-submitted grant
            content, uploaded documents, application drafts, billing metadata (via Stripe), and
            usage / telemetry records.
          </p>
          <p className="text-slate-400 leading-7">
            <strong className="text-slate-200">Categories of Data Subjects:</strong> the
            Controller&apos;s employees, contractors, board members, and any individuals whose
            information the Controller chooses to include in grant narratives (e.g., key personnel
            bios).
          </p>

          <h2 className="text-xl font-bold text-white mt-8">4. Processing Purposes and Duration</h2>
          <p className="text-slate-400 leading-7">
            Processing occurs for the duration of the Controller&apos;s subscription and for any
            retention period required to comply with the Processor&apos;s legal obligations. Upon
            termination, the Processor will delete or return Personal Data within 30 days at the
            Controller&apos;s written request, except for audit log entries retained for forensic
            and compliance purposes.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">5. Confidentiality</h2>
          <p className="text-slate-400 leading-7">
            The Processor ensures that personnel authorized to process Personal Data are bound by
            appropriate confidentiality obligations (whether by contract or statutory duty).
            Production access is limited to named engineers with business need and requires MFA.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">6. Security Measures</h2>
          <p className="text-slate-400 leading-7">
            The Processor implements the technical and organizational measures described in the{" "}
            <Link href="/trust" className="text-emerald-400 hover:text-emerald-300">
              Trust Center
            </Link>
            , including encryption in transit (TLS 1.2+), encryption at rest (provider-managed and,
            for sensitive PII fields, AES-256-GCM application-side), audit logging, row-level
            authorization, CSRF and SSRF defenses, and a documented incident response program.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">7. Subprocessors</h2>
          <p className="text-slate-400 leading-7">
            The Controller provides general authorization for the Processor to engage the
            Subprocessors listed in the Trust Center. Each Subprocessor is bound by data protection
            obligations substantially similar to those in this DPA. The Processor will provide 30
            days&apos; notice of any intended change to its Subprocessors, during which the
            Controller may object on reasonable data-protection grounds.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">8. International Transfers</h2>
          <p className="text-slate-400 leading-7">
            To the extent Personal Data is transferred from the European Economic Area, United
            Kingdom, or Switzerland to the United States, the parties agree that the Standard
            Contractual Clauses (EU Commission Implementing Decision 2021/914) Module Two
            (Controller-to-Processor) are incorporated by reference into this DPA and apply to
            those transfers. The Processor maintains supplementary measures consistent with the
            recommendations of the European Data Protection Board.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">9. Data Subject Rights</h2>
          <p className="text-slate-400 leading-7">
            The Services enable the Controller to respond to Data Subject requests for access,
            rectification, erasure, portability, and restriction directly through the product
            (account export and deletion endpoints). Where the Controller requires additional
            assistance to respond to a Data Subject request, the Processor will cooperate in good
            faith at no additional charge within the scope reasonable for the complexity and
            volume of the request.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">10. Personal Data Breaches</h2>
          <p className="text-slate-400 leading-7">
            The Processor will notify the Controller without undue delay, and in any event within
            72 hours, after becoming aware of a Personal Data Breach affecting the Controller&apos;s
            data. The notification will include the nature of the breach, the categories and
            approximate volume of records affected (where known), the likely consequences, and
            the measures taken or proposed to mitigate.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">11. Audits</h2>
          <p className="text-slate-400 leading-7">
            On reasonable request, the Processor will make available information necessary to
            demonstrate compliance with Article 28 obligations, including current SOC 2 reports
            (when available) and a written summary of security controls. The Controller may
            conduct audits no more than annually and at its own expense, subject to 30 days&apos;
            notice and reasonable confidentiality protections.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">12. Return and Deletion</h2>
          <p className="text-slate-400 leading-7">
            On termination of the Services, the Processor will, at the Controller&apos;s choice,
            delete or return all Personal Data within 30 days, unless retention is required by
            applicable law. Audit log rows may be retained for the retention period required for
            legal compliance.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">13. Liability and Indemnity</h2>
          <p className="text-slate-400 leading-7">
            Each party&apos;s liability under this DPA is subject to the limitations and exclusions
            set forth in the Terms of Service. Nothing in this DPA limits either party&apos;s
            liability to Data Subjects under Article 82 of the GDPR.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">14. Precedence</h2>
          <p className="text-slate-400 leading-7">
            In case of conflict between this DPA and the Terms of Service, this DPA controls with
            respect to the processing of Personal Data.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">15. Contact</h2>
          <p className="text-slate-400 leading-7">
            Data protection questions or DPA execution requests:{" "}
            <a
              href="mailto:privacy@grantpilot.ai"
              className="text-emerald-400 hover:text-emerald-300"
            >
              privacy@grantpilot.ai
            </a>
            . Security reports:{" "}
            <a
              href="mailto:security@grantpilot.ai"
              className="text-emerald-400 hover:text-emerald-300"
            >
              security@grantpilot.ai
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
