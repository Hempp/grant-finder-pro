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
            We collect information you provide directly: account details (name, email), organization profile
            data, uploaded documents, and grant application content. We also collect usage data including
            pages visited, features used, and application outcomes you report.
          </p>
          <h2 className="text-xl font-bold text-white mt-8">2. How We Use Your Information</h2>
          <p className="text-slate-400 leading-7">
            Your data powers grant matching, AI application generation, and Content Library features.
            We use organization data and uploaded documents to generate tailored grant applications.
            We never sell your data to third parties.
          </p>
          <h2 className="text-xl font-bold text-white mt-8">3. AI Processing</h2>
          <p className="text-slate-400 leading-7">
            Your Content Library data and documents are processed by AI (Anthropic Claude) to generate
            grant applications. This data is sent to Anthropic&apos;s API for processing but is not used
            to train AI models. See Anthropic&apos;s privacy policy for their data handling practices.
          </p>
          <h2 className="text-xl font-bold text-white mt-8">4. Data Security</h2>
          <p className="text-slate-400 leading-7">
            We use industry-standard encryption (TLS 1.3) for data in transit and AES-256 for data at rest.
            Your payment information is processed by Stripe and never stored on our servers.
          </p>
          <h2 className="text-xl font-bold text-white mt-8">5. Contact</h2>
          <p className="text-slate-400 leading-7">
            Questions about this policy? Contact us at privacy@grantpilot.ai.
          </p>
        </div>
      </main>
    </div>
  );
}
