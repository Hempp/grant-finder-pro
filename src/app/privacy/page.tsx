import { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "GrantPilot privacy policy — how we collect, use, and protect your data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-emerald-400" />
            <span className="font-bold text-white text-lg">GrantPilot</span>
          </Link>
          <Link href="/" className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition-colors duration-200">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-slate max-w-none space-y-6">
          <p className="text-slate-400 leading-7">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>

          <h2 className="text-xl font-bold text-white mt-8">1. Information We Collect</h2>
          <p className="text-slate-400 leading-7">
            <strong className="text-slate-200">Account Data:</strong> Name, email address, password (hashed), and authentication tokens when you create an account or sign in via Google/GitHub OAuth.
          </p>
          <p className="text-slate-400 leading-7">
            <strong className="text-slate-200">Organization Data:</strong> Organization name, mission, EIN, address, team size, annual budget, and other profile details you provide.
          </p>
          <p className="text-slate-400 leading-7">
            <strong className="text-slate-200">Documents & Content:</strong> Files you upload, Content Library entries, grant application drafts, and any text you enter into the platform.
          </p>
          <p className="text-slate-400 leading-7">
            <strong className="text-slate-200">Usage Data:</strong> Pages visited, features used, application outcomes you report, timestamps, browser type, IP address, and device information.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">2. How We Use Your Information</h2>
          <p className="text-slate-400 leading-7">
            We use your data to: (a) match you with relevant grant opportunities, (b) generate and optimize grant applications using AI, (c) populate your Content Library for reuse across applications, (d) send grant alerts and deadline reminders, (e) process payments and manage your subscription, (f) improve our algorithms and platform features, and (g) communicate product updates and support responses.
          </p>
          <p className="text-slate-400 leading-7">
            <strong className="text-slate-200">We never sell your personal data to third parties.</strong>
          </p>

          <h2 className="text-xl font-bold text-white mt-8">3. AI Processing</h2>
          <p className="text-slate-400 leading-7">
            Your Content Library data, uploaded documents, and organization profile are processed by Anthropic&apos;s Claude API to generate and optimize grant applications. This data is sent to Anthropic&apos;s servers for processing. Per Anthropic&apos;s data policy, API inputs are <strong className="text-slate-200">not used to train AI models</strong>. Data is retained by Anthropic for up to 30 days for safety monitoring, then deleted. See <a href="https://www.anthropic.com/privacy" className="text-emerald-400 hover:text-emerald-300" target="_blank" rel="noopener noreferrer">Anthropic&apos;s privacy policy</a> for details.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">4. Cookies & Tracking</h2>
          <p className="text-slate-400 leading-7">
            <strong className="text-slate-200">Essential Cookies:</strong> Session authentication tokens and CSRF protection. Required for the platform to function.
          </p>
          <p className="text-slate-400 leading-7">
            <strong className="text-slate-200">Preference Cookies:</strong> UI settings such as sidebar state and notification preferences.
          </p>
          <p className="text-slate-400 leading-7">
            <strong className="text-slate-200">Analytics:</strong> We use privacy-respecting analytics to understand feature usage and improve the platform. We do not use third-party advertising trackers.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">5. Data Sharing & Third Parties</h2>
          <p className="text-slate-400 leading-7">
            We share data only with the following service providers, solely for the purposes described:
          </p>
          <ul className="text-slate-400 leading-7 list-disc pl-6 space-y-2">
            <li><strong className="text-slate-200">Anthropic</strong> — AI processing for grant application generation</li>
            <li><strong className="text-slate-200">Stripe</strong> — Payment processing and subscription management</li>
            <li><strong className="text-slate-200">Vercel</strong> — Application hosting and edge delivery</li>
            <li><strong className="text-slate-200">Supabase/PostgreSQL</strong> — Database hosting</li>
          </ul>
          <p className="text-slate-400 leading-7">
            We may disclose data if required by law, subpoena, or court order, or to protect the rights and safety of our users.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">6. Data Security</h2>
          <p className="text-slate-400 leading-7">
            We use industry-standard encryption: <strong className="text-slate-200">TLS 1.3</strong> for data in transit and <strong className="text-slate-200">AES-256</strong> for data at rest. Passwords are hashed with bcrypt (12 rounds). Payment information is processed by Stripe and never stored on our servers. We conduct regular security reviews and maintain access controls that limit employee access to user data on a need-to-know basis.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">7. Data Retention</h2>
          <p className="text-slate-400 leading-7">
            <strong className="text-slate-200">Active accounts:</strong> We retain your data for as long as your account is active.
          </p>
          <p className="text-slate-400 leading-7">
            <strong className="text-slate-200">Account deletion:</strong> When you delete your account, we permanently remove your personal data, documents, and Content Library within 30 days. Anonymized usage analytics may be retained.
          </p>
          <p className="text-slate-400 leading-7">
            <strong className="text-slate-200">Legal obligations:</strong> We may retain certain records as required by law (e.g., payment records for tax compliance, typically 7 years).
          </p>

          <h2 className="text-xl font-bold text-white mt-8">8. Your Rights</h2>
          <p className="text-slate-400 leading-7">
            Depending on your jurisdiction, you may have the following rights:
          </p>
          <p className="text-slate-400 leading-7">
            <strong className="text-slate-200">GDPR (EU/EEA residents):</strong> Right to access, rectify, erase, restrict processing, data portability, and object to processing. You may also lodge a complaint with your local data protection authority.
          </p>
          <p className="text-slate-400 leading-7">
            <strong className="text-slate-200">CCPA (California residents):</strong> Right to know what data we collect, right to delete, right to opt out of sale (we do not sell data), and right to non-discrimination for exercising your rights.
          </p>
          <p className="text-slate-400 leading-7">
            <strong className="text-slate-200">All users:</strong> You can export your data, update your profile, or delete your account from your dashboard settings at any time.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">9. How to Exercise Your Rights</h2>
          <p className="text-slate-400 leading-7">
            Email <a href="mailto:privacy@grantpilot.ai" className="text-emerald-400 hover:text-emerald-300">privacy@grantpilot.ai</a> with your request. We will respond within <strong className="text-slate-200">30 days</strong>. We may ask you to verify your identity before processing requests.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">10. International Data Transfers</h2>
          <p className="text-slate-400 leading-7">
            GrantPilot is based in the United States. If you access our platform from outside the US, your data will be transferred to and processed in the US. We rely on Standard Contractual Clauses (SCCs) and other lawful transfer mechanisms to ensure adequate protection of your data.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">11. Children&apos;s Privacy</h2>
          <p className="text-slate-400 leading-7">
            GrantPilot is not intended for individuals under 16 years of age. We do not knowingly collect data from children. If you believe a child has provided us with personal data, contact us and we will delete it promptly.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">12. Changes to This Policy</h2>
          <p className="text-slate-400 leading-7">
            We may update this policy from time to time. For material changes, we will notify you by email or through the platform at least 30 days before the changes take effect. Continued use after changes constitutes acceptance.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">13. Contact Us</h2>
          <p className="text-slate-400 leading-7">
            For privacy questions or data requests, contact us at <a href="mailto:privacy@grantpilot.ai" className="text-emerald-400 hover:text-emerald-300">privacy@grantpilot.ai</a>.
          </p>
        </div>
      </main>
    </div>
  );
}
