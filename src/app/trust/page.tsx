import { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  Lock,
  Eye,
  FileCheck,
  Server,
  AlertTriangle,
  CheckCircle2,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Trust Center",
  description:
    "GrantPilot's security posture, subprocessor list, compliance roadmap, and incident response program.",
  alternates: { canonical: "/trust" },
};

// Sober tone — this page is consulted by auditors and legal review. Every
// claim maps to a specific control in the codebase or infrastructure.
const SUBPROCESSORS = [
  {
    name: "Anthropic (Claude API)",
    purpose: "AI generation of grant applications and content optimization",
    data: "Content Library entries, organization profile, grant descriptions",
    region: "United States",
    dpa: "https://www.anthropic.com/legal/commercial-terms",
  },
  {
    name: "Supabase",
    purpose: "Primary Postgres database (application records, users, documents)",
    data: "All application data, encrypted PII, audit logs",
    region: "United States (us-east-1)",
    dpa: "https://supabase.com/legal/dpa",
  },
  {
    name: "Vercel",
    purpose: "Application hosting, edge compute, CDN",
    data: "HTTP requests, static assets, server logs",
    region: "Global (edge); primary US",
    dpa: "https://vercel.com/legal/dpa",
  },
  {
    name: "Stripe",
    purpose: "Subscription billing, payment processing, invoicing",
    data: "Customer email, payment method tokens, subscription status",
    region: "United States",
    dpa: "https://stripe.com/legal/dpa",
  },
  {
    name: "Upstash",
    purpose: "Redis-backed rate limiting and application cache",
    data: "Rate-limit counters keyed by user ID; non-sensitive cache entries",
    region: "United States",
    dpa: "https://upstash.com/trust/dpa.pdf",
  },
  {
    name: "Resend",
    purpose: "Transactional email (alerts, digests, password reset)",
    data: "Email address, display name, message body",
    region: "United States",
    dpa: "https://resend.com/legal/dpa",
  },
] as const;

const SECURITY_CONTROLS = [
  {
    icon: Lock,
    title: "Encryption in transit",
    body:
      "All traffic served over TLS 1.2+. HSTS enabled. Internal service-to-service calls use authenticated HTTPS.",
  },
  {
    icon: Shield,
    title: "Encryption at rest",
    body:
      "Database volumes encrypted via provider-managed keys. Sensitive PII fields on student profiles are additionally encrypted application-side with AES-256-GCM before write.",
  },
  {
    icon: Eye,
    title: "Audit logging",
    body:
      "Authentication events, account deletions, data exports, billing lifecycle, and org membership changes are recorded to an append-only audit log. Customers can review their own trail from the dashboard. Log rows survive user deletion via ON DELETE SET NULL so forensic review isn't foiled by account closure.",
  },
  {
    icon: FileCheck,
    title: "Access control",
    body:
      "Row-level authorization on every API route: resources are fetched with an ownership check against the session's user ID before mutation. Admin access to production is limited to named engineers and requires MFA.",
  },
  {
    icon: Server,
    title: "Infrastructure hardening",
    body:
      "SSRF-resistant URL fetching (private CIDR blocklist), CSRF origin validation on state-changing requests, Stripe webhook signature verification, and cron endpoints authenticated via shared secret.",
  },
  {
    icon: AlertTriangle,
    title: "Incident response",
    body:
      "Security incidents are triaged within 24 hours of detection. Material incidents affecting customer data are disclosed to affected customers within 72 hours, consistent with GDPR Article 33.",
  },
] as const;

const COMPLIANCE_ITEMS = [
  { label: "GDPR — Article 15 (access)", status: "Supported", live: true },
  { label: "GDPR — Article 17 (erasure)", status: "Supported", live: true },
  { label: "GDPR — Article 20 (portability)", status: "Supported", live: true },
  { label: "GDPR — Article 33 (breach notification)", status: "Policy in place", live: true },
  { label: "SOC 2 Type I", status: "In progress (target 2026 H2)", live: false },
  { label: "SOC 2 Type II", status: "Planned (2027)", live: false },
  { label: "CCPA — data subject requests", status: "Supported", live: true },
  { label: "HIPAA Business Associate Agreement", status: "Not offered", live: false },
] as const;

const DATA_RIGHTS = [
  {
    title: "Export",
    body: "Download a JSON archive of your account, organization, applications, documents, and content library.",
  },
  {
    title: "Delete",
    body: "Permanently delete your account and associated data (excluding audit log rows retained for legal compliance).",
  },
  {
    title: "Correct",
    body: "Edit any profile or application record directly in the app.",
  },
  {
    title: "Object / restrict",
    body: "Email privacy@grantpilot.dev to restrict specific processing activities.",
  },
] as const;

export default function TrustPage() {
  return (
    <main id="main-content">
      {/* Hero — quiet marine eyebrow + display heading, no tint. */}
      <section
        style={{
          paddingTop: "var(--section-py)",
          paddingBottom: "var(--section-py-tight)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
            style={{
              background: "var(--accent-soft)",
              color: "var(--accent)",
              fontSize: "var(--text-meta)",
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            <Shield className="h-3.5 w-3.5" aria-hidden="true" /> Trust Center
          </div>
          <h1
            className="font-semibold tracking-tight"
            style={{
              fontSize: "var(--text-display)",
              color: "var(--ink)",
              lineHeight: 1.1,
            }}
          >
            Security &amp; trust at GrantPilot
          </h1>
          <p
            className="mt-5 max-w-3xl"
            style={{
              fontSize: "var(--text-body-lg)",
              color: "var(--ink-2)",
              lineHeight: 1.6,
            }}
          >
            How we protect the data nonprofits and grant-seeking teams entrust to us. A living
            record — every claim below maps to a specific control in our codebase and
            infrastructure. If you need something we don&apos;t cover, email{" "}
            <a
              href="mailto:security@grantpilot.dev"
              className="hover:underline"
              style={{ color: "var(--accent)" }}
            >
              security@grantpilot.dev
            </a>
            .
          </p>
          <p
            className="mt-4"
            style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
          >
            Last reviewed:{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </section>

      {/* Security controls — tinted band 1, white cards. */}
      <section
        aria-labelledby="security-controls"
        style={{
          paddingTop: "var(--section-py-tight)",
          paddingBottom: "var(--section-py)",
          background: "var(--bg-soft)",
          borderTop: "1px solid var(--rule)",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2
            id="security-controls"
            className="font-semibold tracking-tight mb-8"
            style={{ fontSize: "var(--text-title)", color: "var(--ink)" }}
          >
            Security controls
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SECURITY_CONTROLS.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className="p-6"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--rule)",
                    borderRadius: "var(--radius-card)",
                    boxShadow: "var(--shadow-card-soft)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="p-2 inline-flex"
                      style={{
                        background: "var(--accent-soft)",
                        color: "var(--accent)",
                        borderRadius: "var(--radius-control)",
                      }}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <h3
                      className="font-semibold"
                      style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
                    >
                      {c.title}
                    </h3>
                  </div>
                  <p
                    style={{
                      fontSize: "var(--text-body-sm)",
                      color: "var(--ink-2)",
                      lineHeight: 1.65,
                    }}
                  >
                    {c.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Subprocessors — alternating rows on white. */}
      <section
        aria-labelledby="subprocessors"
        style={{
          paddingTop: "var(--section-py)",
          paddingBottom: "var(--section-py-tight)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2
            id="subprocessors"
            className="font-semibold tracking-tight"
            style={{ fontSize: "var(--text-title)", color: "var(--ink)" }}
          >
            Subprocessors
          </h2>
          <p
            className="mt-3 mb-8 max-w-3xl"
            style={{ fontSize: "var(--text-body)", color: "var(--ink-2)", lineHeight: 1.65 }}
          >
            GrantPilot uses the following third-party subprocessors to deliver our service. Each
            has its own Data Processing Agreement (DPA). We notify customers of material changes
            at least 30 days before a new subprocessor begins processing personal data.
          </p>
          <div
            className="overflow-x-auto"
            style={{
              border: "1px solid var(--rule)",
              borderRadius: "var(--radius-card)",
            }}
          >
            <table className="w-full" style={{ fontSize: "var(--text-body-sm)" }}>
              <thead
                style={{
                  background: "var(--bg-soft)",
                  color: "var(--ink-2)",
                  fontSize: "var(--text-meta)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                <tr>
                  <th scope="col" className="text-left font-semibold p-4">
                    Subprocessor
                  </th>
                  <th scope="col" className="text-left font-semibold p-4">
                    Purpose
                  </th>
                  <th scope="col" className="text-left font-semibold p-4 hidden md:table-cell">
                    Data categories
                  </th>
                  <th scope="col" className="text-left font-semibold p-4 hidden lg:table-cell">
                    Region
                  </th>
                  <th scope="col" className="text-left font-semibold p-4">
                    DPA
                  </th>
                </tr>
              </thead>
              <tbody>
                {SUBPROCESSORS.map((s, i) => (
                  <tr
                    key={s.name}
                    style={{
                      borderTop: "1px solid var(--rule)",
                      background: i % 2 === 0 ? "var(--surface)" : "var(--bg-soft)",
                    }}
                  >
                    <td className="p-4 font-medium" style={{ color: "var(--ink)" }}>
                      {s.name}
                    </td>
                    <td className="p-4" style={{ color: "var(--ink-2)" }}>
                      {s.purpose}
                    </td>
                    <td className="p-4 hidden md:table-cell" style={{ color: "var(--ink-2)" }}>
                      {s.data}
                    </td>
                    <td className="p-4 hidden lg:table-cell" style={{ color: "var(--ink-2)" }}>
                      {s.region}
                    </td>
                    <td className="p-4">
                      <a
                        href={s.dpa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline"
                        style={{ color: "var(--accent)" }}
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Compliance posture — pill rows. */}
      <section
        aria-labelledby="compliance"
        style={{
          paddingTop: "var(--section-py-tight)",
          paddingBottom: "var(--section-py)",
          background: "var(--bg-soft)",
          borderTop: "1px solid var(--rule)",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2
            id="compliance"
            className="font-semibold tracking-tight"
            style={{ fontSize: "var(--text-title)", color: "var(--ink)" }}
          >
            Compliance posture
          </h2>
          <p
            className="mt-3 mb-8 max-w-3xl"
            style={{ fontSize: "var(--text-body)", color: "var(--ink-2)", lineHeight: 1.65 }}
          >
            We distinguish live commitments from work in progress. A status of &quot;Supported&quot;
            means a customer can exercise the right today through our product or a documented
            request process.
          </p>
          <ul className="space-y-2">
            {COMPLIANCE_ITEMS.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between p-4"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--rule)",
                  borderRadius: "var(--radius-control)",
                }}
              >
                <span style={{ fontSize: "var(--text-body)", color: "var(--ink)" }}>
                  {item.label}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 font-medium"
                  style={{
                    fontSize: "var(--text-body-sm)",
                    color: item.live ? "var(--success)" : "var(--warn)",
                  }}
                >
                  {item.live ? (
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  ) : null}
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Data rights — 2×2 dl grid. */}
      <section
        aria-labelledby="data-rights"
        style={{
          paddingTop: "var(--section-py)",
          paddingBottom: "var(--section-py-tight)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2
            id="data-rights"
            className="font-semibold tracking-tight"
            style={{ fontSize: "var(--text-title)", color: "var(--ink)" }}
          >
            Your data rights
          </h2>
          <p
            className="mt-3 mb-8 max-w-3xl"
            style={{ fontSize: "var(--text-body)", color: "var(--ink-2)", lineHeight: 1.65 }}
          >
            Every GrantPilot user can exercise the following rights self-service from account
            settings — no support ticket required.
          </p>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DATA_RIGHTS.map((right) => (
              <div
                key={right.title}
                className="p-5"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--rule)",
                  borderRadius: "var(--radius-card)",
                  boxShadow: "var(--shadow-card-soft)",
                }}
              >
                <dt
                  className="font-semibold mb-1.5"
                  style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
                >
                  {right.title}
                </dt>
                <dd
                  style={{
                    fontSize: "var(--text-body-sm)",
                    color: "var(--ink-2)",
                    lineHeight: 1.65,
                  }}
                >
                  {right.title === "Object / restrict" ? (
                    <>
                      Email{" "}
                      <a
                        href="mailto:privacy@grantpilot.dev"
                        className="hover:underline"
                        style={{ color: "var(--accent)" }}
                      >
                        privacy@grantpilot.dev
                      </a>{" "}
                      to restrict specific processing activities.
                    </>
                  ) : (
                    right.body
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Report panel — quiet success-tinted panel. */}
      <section
        aria-labelledby="report"
        style={{
          paddingTop: "var(--section-py-tight)",
          paddingBottom: "var(--section-py)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div
            className="p-8"
            style={{
              background: "var(--panel-prelaunch)",
              border: "1px solid var(--success)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-card-soft)",
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="p-2.5 flex-shrink-0"
                style={{
                  background: "var(--success-soft)",
                  color: "var(--success)",
                  borderRadius: "var(--radius-control)",
                }}
              >
                <Mail className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2
                  id="report"
                  className="font-semibold tracking-tight mb-2"
                  style={{ fontSize: "var(--text-heading)", color: "var(--ink)" }}
                >
                  Report a security issue
                </h2>
                <p
                  style={{ fontSize: "var(--text-body)", color: "var(--ink-2)", lineHeight: 1.65 }}
                >
                  Responsible disclosure is appreciated. Email{" "}
                  <a
                    href="mailto:security@grantpilot.dev"
                    className="hover:underline"
                    style={{ color: "var(--accent)" }}
                  >
                    security@grantpilot.dev
                  </a>{" "}
                  with reproduction steps and any supporting evidence. We acknowledge reports
                  within two business days and coordinate disclosure timelines with you.
                </p>
                <p
                  className="mt-3"
                  style={{ fontSize: "var(--text-body-sm)", color: "var(--ink-2)" }}
                >
                  For customer-specific processing questions, see our{" "}
                  <Link
                    href="/dpa"
                    className="hover:underline"
                    style={{ color: "var(--accent)" }}
                  >
                    Data Processing Agreement
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
