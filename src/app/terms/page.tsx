import { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "GrantPilot terms of service — usage terms, success fees, and grant guarantee conditions.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="prose prose-invert prose-slate max-w-none space-y-6">
          <p className="text-slate-400 leading-7">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>

          <h2 className="text-xl font-bold text-white mt-8">1. Service Description</h2>
          <p className="text-slate-400 leading-7">
            GrantPilot is an AI-powered platform that helps organizations discover, match, and apply for grants. Our Smart Fill technology generates grant applications using your organization&apos;s data and optimizes them for each funder&apos;s scoring criteria. We also provide a Content Library, grant matching, deadline alerts, and application tracking.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">2. Eligibility</h2>
          <p className="text-slate-400 leading-7">
            You must be at least 18 years old and authorized to bind your organization to these terms. By creating an account, you represent that you have the authority to enter into this agreement on behalf of your organization.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">3. Account Responsibilities</h2>
          <p className="text-slate-400 leading-7">
            You are responsible for maintaining the security of your account credentials, providing accurate information, and all activity under your account. One account per organization unless on an Organization plan with team seats. Notify us immediately at <a href="mailto:support@grantpilot.dev" className="text-emerald-400 hover:text-emerald-300">support@grantpilot.dev</a> if you suspect unauthorized access.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">4. Subscription Plans & Billing</h2>
          <p className="text-slate-400 leading-7">
            <strong className="text-slate-200">Plans:</strong> Starter (free), Growth ($29/mo), Pro ($79/mo), Organization ($249/mo). Annual billing is available at a discount.
          </p>
          <p className="text-slate-400 leading-7">
            <strong className="text-slate-200">Auto-renewal:</strong> Paid subscriptions renew automatically. You can cancel anytime from your dashboard settings. Cancellation takes effect at the end of the current billing period.
          </p>
          <p className="text-slate-400 leading-7">
            <strong className="text-slate-200">Refunds:</strong> We offer a full refund within 14 days of your first paid subscription if you are unsatisfied. After 14 days, no refunds are provided for partial billing periods.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">5. Success Fees</h2>
          <p className="text-slate-400 leading-7">
            Paid plans include a success fee on grants won using GrantPilot&apos;s Smart Fill feature. Rates by plan: <strong className="text-slate-200">Growth (5%)</strong> on grants $10K+, <strong className="text-slate-200">Pro (3%)</strong>, <strong className="text-slate-200">Organization (2%)</strong>. Success fees are invoiced when you report a grant award. You must report grant outcomes within 30 days of notification. Failure to report may result in estimated fees based on the grant&apos;s listed amount.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">6. Grant Guarantee</h2>
          <p className="text-slate-400 leading-7">
            Pro and Organization plans include the Grant Guarantee: if you do not win a grant within 12 months of subscribing, we extend your subscription 3 months free. To qualify, you must submit at least 10 applications using Smart Fill during the 12-month period. The guarantee does not apply to grants where the applicant was deemed ineligible by the funder.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">7. Acceptable Use</h2>
          <p className="text-slate-400 leading-7">You agree not to:</p>
          <ul className="text-slate-400 leading-7 list-disc pl-6 space-y-2">
            <li>Submit fraudulent or materially false information in grant applications</li>
            <li>Misrepresent your organization&apos;s qualifications, capacity, or track record</li>
            <li>Use the platform to apply for grants you know you are ineligible for</li>
            <li>Scrape, reverse-engineer, or attempt to extract source code from the platform</li>
            <li>Share account access with unauthorized parties or resell platform access</li>
            <li>Interfere with platform operations or circumvent security measures</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8">8. Intellectual Property</h2>
          <p className="text-slate-400 leading-7">
            <strong className="text-slate-200">GrantPilot owns:</strong> The platform, algorithms, UI/UX, brand assets, and all proprietary technology.
          </p>
          <p className="text-slate-400 leading-7">
            <strong className="text-slate-200">You own:</strong> Your organization data, uploaded documents, Content Library entries, and the grant applications generated for you. You grant us a limited license to process this content solely to provide our services.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">9. AI-Generated Content Disclaimer</h2>
          <p className="text-slate-400 leading-7">
            AI-generated grant applications are <strong className="text-slate-200">drafts that require human review</strong>. GrantPilot does not guarantee the accuracy, completeness, or suitability of any AI-generated content. You are solely responsible for reviewing, editing, and approving all application content before submission. GrantPilot is not a law firm, financial advisor, or grant consultant — our platform is a productivity tool, not professional advice.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">10. Limitation of Liability</h2>
          <p className="text-slate-400 leading-7">
            To the maximum extent permitted by law, GrantPilot&apos;s total liability to you for any claims arising from or related to these terms or the service shall not exceed the <strong className="text-slate-200">total fees you paid in the 12 months preceding the claim</strong>. We are not liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, lost data, or loss of grant funding opportunities.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">11. Indemnification</h2>
          <p className="text-slate-400 leading-7">
            You agree to indemnify and hold harmless GrantPilot from any claims, damages, or expenses arising from: (a) your use of the platform, (b) false or misleading information you provide in grant applications, (c) your violation of these terms, or (d) your violation of any applicable law or regulation.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">12. Termination</h2>
          <p className="text-slate-400 leading-7">
            <strong className="text-slate-200">By you:</strong> Cancel your subscription anytime from dashboard settings. Your account remains active until the end of the billing period.
          </p>
          <p className="text-slate-400 leading-7">
            <strong className="text-slate-200">By us:</strong> We may suspend or terminate your account immediately for material breach of these terms (fraud, abuse, non-payment). For other reasons, we will provide 30 days notice.
          </p>
          <p className="text-slate-400 leading-7">
            <strong className="text-slate-200">Data export:</strong> Upon termination, you have 30 days to export your data. After that period, we permanently delete your account data.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">13. Dispute Resolution</h2>
          <p className="text-slate-400 leading-7">
            Any disputes arising from these terms shall be resolved through <strong className="text-slate-200">binding arbitration</strong> under the rules of the American Arbitration Association, conducted in Delaware. You may opt out of arbitration for claims that qualify for small claims court. Class actions and class arbitrations are waived. These terms are governed by the laws of the State of Delaware.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">14. Force Majeure</h2>
          <p className="text-slate-400 leading-7">
            Neither party shall be liable for failures caused by events beyond reasonable control, including natural disasters, government actions, internet outages, or third-party service failures.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">15. Severability</h2>
          <p className="text-slate-400 leading-7">
            If any provision of these terms is found unenforceable, the remaining provisions continue in full force and effect.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">16. Entire Agreement</h2>
          <p className="text-slate-400 leading-7">
            These terms, together with our <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300">Privacy Policy</Link>, constitute the entire agreement between you and GrantPilot. They supersede all prior agreements and understandings.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">17. Contact</h2>
          <p className="text-slate-400 leading-7">
            For questions about these terms, contact us at <a href="mailto:legal@grantpilot.dev" className="text-emerald-400 hover:text-emerald-300">legal@grantpilot.dev</a>.
          </p>
        </div>
      </main>
    </div>
  );
}
