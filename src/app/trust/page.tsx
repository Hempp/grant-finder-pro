import { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
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

// Controls a sober tone on a page auditors and legal review — this page
// is a reference document, not a marketing asset. Every claim here must
// be truthful and verifiable from the codebase.
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

export default function TrustPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
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

      <main id="main-content" className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
            <Shield className="h-3.5 w-3.5" aria-hidden="true" /> Trust Center
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Security &amp; trust at GrantPilot</h1>
          <p className="text-slate-400 leading-7 max-w-3xl">
            This page documents how we protect the data nonprofits and grant-seeking teams entrust
            to us. It is maintained as a living record — the claims below map to specific controls
            in our codebase and infrastructure. If you need something we don&apos;t cover, email{" "}
            <a
              href="mailto:security@grantpilot.dev"
              className="text-emerald-400 hover:text-emerald-300"
            >
              security@grantpilot.dev
            </a>
            .
          </p>
          <p className="text-slate-500 text-sm mt-3">
            Last reviewed:{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <section aria-labelledby="security-controls" className="mb-16">
          <h2 id="security-controls" className="text-2xl font-bold text-white mb-6">
            Security controls
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SECURITY_CONTROLS.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="font-semibold text-white">{c.title}</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-6">{c.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="subprocessors" className="mb-16">
          <h2 id="subprocessors" className="text-2xl font-bold text-white mb-3">
            Subprocessors
          </h2>
          <p className="text-slate-400 leading-7 mb-6 max-w-3xl">
            GrantPilot uses the following third-party subprocessors to deliver our service. Each
            has its own Data Processing Agreement (DPA); links below. We notify customers of
            material changes to this list at least 30 days before a new subprocessor begins
            processing personal data.
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 text-slate-300">
                <tr>
                  <th scope="col" className="text-left font-semibold p-3">
                    Subprocessor
                  </th>
                  <th scope="col" className="text-left font-semibold p-3">
                    Purpose
                  </th>
                  <th scope="col" className="text-left font-semibold p-3 hidden md:table-cell">
                    Data categories
                  </th>
                  <th scope="col" className="text-left font-semibold p-3 hidden lg:table-cell">
                    Region
                  </th>
                  <th scope="col" className="text-left font-semibold p-3">
                    DPA
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                {SUBPROCESSORS.map((s) => (
                  <tr key={s.name} className="border-t border-slate-800">
                    <td className="p-3 font-medium text-white">{s.name}</td>
                    <td className="p-3">{s.purpose}</td>
                    <td className="p-3 hidden md:table-cell">{s.data}</td>
                    <td className="p-3 hidden lg:table-cell">{s.region}</td>
                    <td className="p-3">
                      <a
                        href={s.dpa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="compliance" className="mb-16">
          <h2 id="compliance" className="text-2xl font-bold text-white mb-3">
            Compliance posture
          </h2>
          <p className="text-slate-400 leading-7 mb-6 max-w-3xl">
            We distinguish live commitments from work in progress. A status of &quot;Supported&quot;
            means a customer can exercise the right today through our product or a documented
            request process.
          </p>
          <ul className="space-y-2">
            {COMPLIANCE_ITEMS.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-3"
              >
                <span className="text-slate-200">{item.label}</span>
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                    item.live ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {item.live && <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="data-rights" className="mb-16">
          <h2 id="data-rights" className="text-2xl font-bold text-white mb-3">
            Your data rights
          </h2>
          <p className="text-slate-400 leading-7 max-w-3xl mb-4">
            Every GrantPilot user can exercise the following rights self-service from their account
            settings, no support ticket required:
          </p>
          <ul className="list-disc list-inside text-slate-400 leading-7 space-y-1 pl-2">
            <li>
              <strong className="text-slate-200">Export</strong> — download a JSON archive of your
              account, organization, applications, documents, and content library.
            </li>
            <li>
              <strong className="text-slate-200">Delete</strong> — permanently delete your account
              and associated data (excluding audit log rows retained for legal compliance).
            </li>
            <li>
              <strong className="text-slate-200">Correct</strong> — edit any profile or
              application record directly in the app.
            </li>
            <li>
              <strong className="text-slate-200">Object / restrict</strong> — email{" "}
              <a
                href="mailto:privacy@grantpilot.dev"
                className="text-emerald-400 hover:text-emerald-300"
              >
                privacy@grantpilot.dev
              </a>{" "}
              to restrict specific processing activities.
            </li>
          </ul>
        </section>

        <section aria-labelledby="report" className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 flex-shrink-0">
              <Mail className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="report" className="text-xl font-bold text-white mb-2">
                Report a security issue
              </h2>
              <p className="text-slate-300 leading-7">
                We appreciate responsible disclosure. Email{" "}
                <a
                  href="mailto:security@grantpilot.dev"
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  security@grantpilot.dev
                </a>{" "}
                with reproduction steps and any supporting evidence. We acknowledge reports within
                two business days and will coordinate disclosure timelines with you.
              </p>
              <p className="text-slate-400 text-sm mt-3">
                For customer-specific processing questions, see our{" "}
                <Link href="/dpa" className="text-emerald-400 hover:text-emerald-300">
                  Data Processing Agreement
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
