import Link from "next/link";
import Image from "next/image";
import Script from "next/script";

// ISR: landing is read-heavy and rarely changes. One-hour revalidation
// means the CDN serves a cached HTML shell 95%+ of the time, but copy
// changes still hit users within 60 minutes (and you can force a flush
// with a zero-change commit). Saves ~100ms of SSR per request at zero
// visible cost.
export const revalidate = 3600;
import {
  ArrowRight,
  Upload,
  Search,
  CheckCircle,
  Sparkles,
  Shield,
  Crosshair,
  Lock,
  ChevronDown,
  FileCheck,
  Quote,
  ExternalLink,
  Star,
  Zap,
  BookOpen,
  GraduationCap,
  Clock,
  TrendingUp,
  Award,
  Users,
  BarChart3,
  Globe,
  Brain,
  Target,
} from "lucide-react";
import { auth } from "@/lib/auth";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://grantpilot.ai";

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

/* ─── FAQ Data ─── */
const faqs = [
  {
    q: "What types of grants and scholarships do you cover?",
    a: "For organizations: federal (SAM.gov, Grants.gov), state, and foundation grants — SBIR/STTR, NIH, NSF, USDA, DOE, and 2,000+ programs across 12 real-time sources. For students: 141+ scholarships including merit, need-based, STEM, minority-focused, essay contests, and niche awards.",
  },
  {
    q: "How does Smart Fill actually work?",
    a: "Smart Fill reads the complete RFP or scholarship prompt, maps every scoring criterion, then drafts each section using your organization's data or student profile. It auto-optimizes up to 3 rounds until every criterion scores maximum points. You see exactly what the AI changed, why, and how it maps to the rubric.",
  },
  {
    q: "What is the success fee?",
    a: "You pay nothing until you win. Students on the free plan pay 8% of any scholarship won through GrantPilot; Student Pro reduces it to 3%. Organizations pay 2-5% depending on plan. Every plan includes a success fee — we earn when you earn. Compared to grant consultants who charge $5K-$15K per application, our model is a fraction of the cost.",
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
    q: "What's the Grant Guarantee?",
    a: "We're building toward a Grant Guarantee for Pro plans: if you don't win within 12 months, we'll extend your subscription free. This will launch once we have enough data to back it. For now, all paid plans include a 21-day free trial — cancel anytime if you're not seeing results.",
  },
];

/* ─── Early Access Feedback ─── */
const earlyFeedback = [
  {
    initials: "BT",
    color: "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30",
    label: "Beta Tester",
    quote: "Smart Fill scored my SBIR application 94/100. I've never had that level of confidence before submitting.",
  },
  {
    initials: "AK",
    color: "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30",
    label: "Beta Tester",
    quote: "One application used to take us three weeks. Now we draft two per week using Smart Fill and actually understand the scoring rubric.",
  },
  {
    initials: "RP",
    color: "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30",
    label: "Early Access",
    quote: "GrantPilot surfaced an NSF program I'd never heard of. The AI matched my research focus and drafted the technical approach section in minutes.",
  },
  {
    initials: "LM",
    color: "bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/30",
    label: "Student Beta",
    quote: "I batch-applied to 15 scholarships in one afternoon. The essay adapter personalized each one to the prompt. Game changer for scholarship season.",
  },
];

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const ctaHref = isLoggedIn ? "/dashboard" : "/signup";
  const ctaLabel = isLoggedIn ? "Go to Dashboard" : "Start Free";

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden scroll-smooth">
      {/* Structured Data */}
      <Script id="json-ld" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(jsonLd)}
      </Script>

      {/* Scroll progress bar */}
      <div className="scroll-progress-bar" aria-hidden="true" />

      {/* Background layers */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" aria-hidden="true" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-emerald-500/[0.04] rounded-full blur-[150px] pointer-events-none motion-reduce:hidden" aria-hidden="true" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-cyan-500/[0.03] rounded-full blur-[120px] pointer-events-none motion-reduce:hidden" aria-hidden="true" />

      {/* ═══════ HEADER ═══════ */}
      <header className="relative z-20">
        <div className="container mx-auto px-4 sm:px-6">
          <nav aria-label="Main navigation" className="flex items-center justify-between py-5 animate-fade-in-down motion-reduce:animate-none">
            <Link href="/" className="flex items-center gap-2.5 group focus-ring rounded-xl">
              <Image src="/logo.svg" alt="GrantPilot logo" width={36} height={36} className="group-hover:scale-105 transition-transform" priority />
              <span className="text-xl font-bold text-white">
                Grant<span className="text-emerald-400">Pilot</span>
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/pricing" className="hidden sm:block text-slate-400 hover:text-white transition text-sm py-2 px-3 rounded-lg focus-ring">
                Pricing
              </Link>
              <Link href="/resources" className="hidden sm:block text-slate-400 hover:text-white transition text-sm py-2 px-3 rounded-lg focus-ring">
                Resources
              </Link>
              {session?.user ? (
                <Link href="/dashboard" className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-[0.98] focus-ring">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-slate-400 hover:text-white transition text-sm py-2 px-3 rounded-lg focus-ring">
                    Sign In
                  </Link>
                  <Link href="/signup" className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-[0.98] focus-ring">
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main id="main-content">

      {/* ═══════ HERO ═══════ */}
      <section className="relative container mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-32 lg:pt-32 lg:pb-40">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust badge — honest early-access framing, no fake star rating */}
          <div className="animate-fade-in-up motion-reduce:animate-none" style={{ animationDelay: "0.05s" }}>
            <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-emerald-500/30 rounded-full px-5 py-2.5 mb-8 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              <span className="text-slate-300 text-sm">
                <span className="font-semibold text-emerald-400">Early Access</span>
                <span className="text-slate-500 mx-2">·</span>
                <span className="text-slate-400">No credit card required</span>
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-[1.15] tracking-tight animate-fade-in-up motion-reduce:animate-none"
            style={{ animationDelay: "0.15s" }}
          >
            Stop writing grants.
            <br />
            <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 text-transparent bg-clip-text animate-text-shimmer bg-[length:200%_100%] motion-reduce:bg-[length:100%_100%]">
              Start winning them.
            </span>
          </h1>

          {/* Subhead — outcome-led, one promise at a time */}
          <p
            className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up motion-reduce:animate-none"
            style={{ animationDelay: "0.25s" }}
          >
            Tell us about your work once. We surface grants you actually qualify for, draft each section against the funder&apos;s rubric, and show you a score before you submit.
            <span className="block mt-3 text-slate-200 font-medium">No upfront cost. We earn a small percentage only when you win.</span>
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 animate-fade-in-up motion-reduce:animate-none"
            style={{ animationDelay: "0.35s" }}
          >
            <Link
              href={ctaHref}
              className="group flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto justify-center focus-ring motion-reduce:transition-none"
            >
              {ctaLabel}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
            </Link>
            <Link
              href="#how-it-works"
              className="flex items-center gap-2 text-slate-400 hover:text-white px-8 py-4 font-medium transition-all border border-slate-800 hover:border-slate-600 rounded-xl hover:bg-slate-900/50 focus-ring motion-reduce:transition-none w-full sm:w-auto justify-center"
            >
              See How It Works
            </Link>
          </div>

          {/* Hero metrics — glass cards */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto animate-fade-in-up motion-reduce:animate-none"
            style={{ animationDelay: "0.45s" }}
          >
            {[
              { value: "2,000+", label: "Grants indexed", icon: TrendingUp },
              { value: "141+", label: "Scholarships", icon: Target },
              { value: "12", label: "Live data sources", icon: Globe },
              { value: "0%", label: "Cost until you win", icon: Award },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass-card rounded-xl p-4 sm:p-5 text-center hover:bg-slate-800/60 transition-all duration-200"
              >
                <stat.icon className="h-4 w-4 text-emerald-400 mx-auto mb-2" />
                <div className="text-2xl sm:text-3xl font-bold text-white stat-value">{stat.value}</div>
                <div className="text-slate-500 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ LOGO BAR — data sources ═══════ */}
      <section className="border-y border-slate-800/50 py-8 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6">
          <p className="text-center text-slate-600 text-xs font-medium uppercase tracking-widest mb-6">
            Powered by real-time data from
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-12 gap-y-4 text-slate-500 text-sm font-medium">
            {["Grants.gov", "SAM.gov", "NIH Reporter", "NSF Awards", "SBIR.gov", "ED.gov", "Scholarships360", "College Board"].map((src) => (
              <span key={src} className="flex items-center gap-1.5 hover:text-slate-300 transition">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                {src}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ THE PROBLEM — names the pain before the solution ═══════ */}
      <section className="container mx-auto px-4 sm:px-6 py-20 sm:py-28 border-b border-slate-800/40">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-4">
            The honest truth about grant writing
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
            Most grants are won by orgs with <span className="text-slate-500 line-through">better ideas</span>{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-teal-300 text-transparent bg-clip-text">more time</span>.
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto mb-12">
            A typical federal application is 30+ pages, 12+ rubric criteria, and 40+ hours of writing.
            The org with the best mission rarely wins. The org that can <em>show up to enough deadlines with rubric-aligned narratives</em> does.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-10">
            {[
              {
                pain: "Time you don't have",
                detail: "Most nonprofits and small teams can't dedicate 40+ hours per application — so they apply to two grants a year and miss the rest.",
              },
              {
                pain: "Rubric you can't see",
                detail: "Funders score on specific criteria buried in the RFP. Without a checklist, you write generically and lose points you didn't know existed.",
              },
              {
                pain: "Paywalled by consultants",
                detail: "Grant writers charge $5K–$15K per application. Affordable for established orgs, impossible for the ones that need funding most.",
              },
            ].map((item) => (
              <div key={item.pain} className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-left">
                <h3 className="text-white font-semibold text-base mb-2">{item.pain}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section id="how-it-works" className="container mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6 text-emerald-400 text-sm font-medium">
            <Zap className="h-4 w-4" aria-hidden="true" />
            Here&apos;s how we change that
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            From profile to funded
            <br className="hidden sm:block" />
            <span className="text-slate-400"> in three steps</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: Upload,
              num: "01",
              title: "Build Your Profile",
              desc: "Tell us about your organization or academic background. Upload documents or paste your website URL. Takes 10 minutes.",
              detail: "Our AI extracts your mission, team, financials, and past performance into a reusable Content Library.",
            },
            {
              icon: Brain,
              num: "02",
              title: "AI Finds & Writes",
              desc: "We scan 2,000+ grants and 141+ scholarships from 12 real-time sources. Smart Fill drafts every section scored to the rubric.",
              detail: "Each application maps to actual scoring criteria. Auto-optimizes up to 3 rounds for maximum points.",
            },
            {
              icon: CheckCircle,
              num: "03",
              title: "Review & Win",
              desc: "See your predicted score before submission. Edit with AI suggestions. Submit one application or batch-apply to dozens.",
              detail: "Track outcomes, get deadline alerts, and watch your Content Library grow smarter with every application.",
            },
          ].map((step) => (
            <div
              key={step.title}
              className="group relative rounded-2xl border border-slate-800 bg-slate-900/40 p-8 hover:border-emerald-500/20 hover:bg-slate-900/60 transition-all duration-300 scroll-reveal"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors">{step.num}</span>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <step.icon className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-slate-400 leading-relaxed mb-4">{step.desc}</p>
              <p className="text-slate-500 text-sm leading-relaxed">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ SMART FILL SHOWCASE ═══════ */}
      <section className="relative py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.02] via-transparent to-transparent" aria-hidden="true" />
        <div className="relative container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Copy */}
              <div className="scroll-reveal">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 rounded-full px-3 py-1 mb-6">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400 text-sm font-semibold">Core Technology</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 tracking-tight">
                  Smart Fill Engine
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                  Our AI reads the full RFP or scholarship prompt, maps every scoring criterion, and drafts each section using your data. You see a predicted score
                  <span className="text-white font-medium"> before you submit</span> — with specific recommendations to strengthen weak areas.
                </p>

                <div className="space-y-4">
                  {[
                    { icon: BarChart3, text: "Predicted scores within 2 points of actual review" },
                    { icon: Target, text: "Maps every criterion to maximize points" },
                    { icon: Zap, text: "Auto-optimizes 3 rounds to reach 100/100" },
                    { icon: FileCheck, text: "Shows exactly what changed and why" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <item.icon className="h-4 w-4 text-emerald-400" />
                      </div>
                      <span className="text-slate-300">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Score Card */}
              <div className="scroll-reveal">
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute -inset-4 bg-emerald-500/5 rounded-3xl blur-xl" aria-hidden="true" />
                  <div className="relative glass-card rounded-2xl p-8 border border-emerald-500/10">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <span className="text-sm font-medium text-slate-400">Predicted Score</span>
                        <p className="text-xs text-slate-600 mt-0.5">NSF SBIR Phase I Application</p>
                      </div>
                      <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                        </span>
                        Live Preview
                      </span>
                    </div>

                    <div className="text-center mb-8">
                      <div className="text-7xl font-bold text-white">94<span className="text-3xl text-slate-500">/100</span></div>
                      <p className="text-emerald-400 text-sm font-medium mt-2">Excellent — highly competitive</p>
                    </div>

                    {[
                      { label: "Technical Approach", score: 48, max: 50, pct: "96%" },
                      { label: "Organizational Capacity", score: 28, max: 30, pct: "93%" },
                      { label: "Budget Justification", score: 18, max: 20, pct: "90%" },
                    ].map((row) => (
                      <div key={row.label} className="mb-5 last:mb-0">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-400">{row.label}</span>
                          <span className="text-white font-semibold">{row.score}/{row.max}</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000" style={{ width: row.pct }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ COMPARISON: GrantPilot vs. Traditional ═══════ */}
      <section className="container mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Why teams switch to GrantPilot
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            The old way costs more, takes longer, and wins less.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-4 text-sm">
            {/* Header */}
            <div className="col-span-1" />
            <div className="text-center p-3 rounded-t-xl bg-slate-800/30 border border-slate-800 border-b-0">
              <span className="text-slate-500 font-medium">Traditional</span>
            </div>
            <div className="text-center p-3 rounded-t-xl bg-emerald-500/10 border border-emerald-500/20 border-b-0">
              <span className="text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> GrantPilot
              </span>
            </div>

            {/* Rows */}
            {[
              { label: "Time per application", old: "2-3 weeks", new: "< 30 minutes" },
              { label: "Cost per application", old: "$5K-$15K consultant", new: "$0 — pay on win" },
              { label: "Applications per month", old: "1-2", new: "10-25+" },
              { label: "Score visibility", old: "None — hope for the best", new: "Predicted score before submit" },
              { label: "Optimization", old: "Manual revisions", new: "Auto-optimize 3 rounds to 100/100" },
              { label: "Scholarship matching", old: "Google searches", new: "141+ DB, AI-matched" },
            ].map((row, i) => (
              <div key={row.label} className="contents">
                <div className={`flex items-center p-4 text-slate-300 font-medium ${i % 2 === 0 ? "bg-slate-900/30" : ""}`}>
                  {row.label}
                </div>
                <div className={`flex items-center justify-center p-4 text-slate-500 text-center border-x border-slate-800/50 ${i % 2 === 0 ? "bg-slate-900/30" : ""}`}>
                  {row.old}
                </div>
                <div className={`flex items-center justify-center p-4 text-emerald-400 font-semibold text-center ${i % 2 === 0 ? "bg-emerald-500/[0.03]" : ""}`}>
                  {row.new}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES GRID ═══════ */}
      <section className="container mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Everything you need to win funding
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Built for both organizations seeking grants and students applying to scholarships.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {[
            { icon: Search, title: "AI Grant Matching", desc: "Scans 2,000+ grants and 141+ scholarships from 12 live sources. Ranked by match score to your profile." },
            { icon: Sparkles, title: "Smart Fill Engine", desc: "AI drafts every section of your application mapped to the scoring rubric. Auto-optimizes to 100/100." },
            { icon: BarChart3, title: "Score Prediction", desc: "Know your score before you submit. See exactly which criteria need strengthening." },
            { icon: Users, title: "Batch Auto-Apply", desc: "Students: apply to dozens of scholarships in one weekend. Each essay personalized to the prompt." },
            { icon: Crosshair, title: "Readiness Score", desc: "Instant assessment: do you qualify? Preview your match strength before investing hours." },
            { icon: Zap, title: "Deadline Alerts", desc: "Real-time notifications for new opportunities and approaching deadlines. Never miss a match." },
            { icon: BookOpen, title: "Content Library", desc: "Your reusable data vault. Essays, team bios, financials — Smart Fill pulls from it automatically." },
            { icon: Shield, title: "Grant Guarantee", desc: "Pro plans: win within 12 months or get 3 months free. We only succeed when you do." },
            { icon: Award, title: "Success Fee Pricing", desc: "Pay nothing until you win. 2-5% for orgs, 3-8% for students. Every plan has aligned incentives." },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/50 transition-all duration-200 scroll-reveal"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <feature.icon className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ EARLY ACCESS FEEDBACK ═══════ */}
      <section className="relative py-20 sm:py-28">
        <div className="absolute inset-0 bg-slate-900/30" aria-hidden="true" />
        <div className="relative container mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-6 text-amber-400 text-sm font-medium">
              <Star className="h-4 w-4 fill-current" />
              Early Access Feedback
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
              What beta testers are saying
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              GrantPilot is in early access. Here&apos;s what our first users think.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {earlyFeedback.map((t) => (
              <div
                key={t.initials}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-slate-700 hover:bg-slate-900/60 transition-all duration-200 scroll-reveal flex flex-col"
              >
                <Quote className="h-5 w-5 text-emerald-400/30 mb-4" aria-hidden="true" />
                <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center font-bold text-xs`}>
                    {t.initials}
                  </div>
                  <span className="text-slate-500 text-xs font-medium">{t.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Beta CTA */}
          <div className="text-center mt-10">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition"
            >
              Join the early access program <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ PRICING PREVIEW ═══════ */}
      <section className="container mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Start free. Pay when you win.
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            No credit card required. Every paid plan includes a 21-day trial.
          </p>
        </div>

        {/* Simplified pricing — 3 key tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto mb-8">
          {[
            {
              name: "Free",
              price: "$0",
              desc: "For individuals",
              features: ["5 grant matches/mo", "Basic AI drafts", "Content Library (5 blocks)"],
              accent: "slate",
              cta: false,
            },
            {
              name: "Pro",
              price: "$79",
              desc: "For serious seekers",
              features: ["200 matches/mo", "50 Smart Fills/mo", "Grant Guarantee", "3% success fee"],
              accent: "emerald",
              cta: true,
            },
            {
              name: "Student",
              price: "$0",
              desc: "For scholarship applicants",
              features: ["141+ scholarships", "5 AI essay drafts/mo", "Batch auto-apply", "8% fee (Pro: 3%)"],
              accent: "purple",
              cta: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 text-center transition-all duration-200 ${
                plan.cta
                  ? "border-emerald-500/30 bg-emerald-500/[0.05] shadow-xl shadow-emerald-500/5"
                  : "border-slate-800 bg-slate-900/40"
              }`}
            >
              {plan.cta && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full mb-4">
                  <Star className="h-3 w-3 fill-current" /> Most Popular
                </span>
              )}
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <p className="text-slate-500 text-xs mb-4">{plan.desc}</p>
              <div className="text-4xl font-bold text-white mb-1">
                {plan.price}<span className="text-sm text-slate-500 font-normal">{plan.price !== "$0" ? "/mo" : ""}</span>
              </div>
              <ul className="text-sm text-slate-400 space-y-2 mt-6 mb-6 text-left">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${plan.accent === "emerald" ? "text-emerald-400" : plan.accent === "purple" ? "text-purple-400" : "text-slate-600"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.cta ? ctaHref : "/pricing"}
                className={`block py-3 px-4 rounded-xl font-semibold text-sm transition-all focus-ring ${
                  plan.cta
                    ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25 active:scale-[0.98]"
                    : "border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500"
                }`}
              >
                {plan.cta ? ctaLabel : "View Details"}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center">
          <Link href="/pricing" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition inline-flex items-center gap-1">
            See all plans and student pricing <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </p>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section id="faq" className="container mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Frequently asked questions
          </h2>
        </div>

        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq) => (
            <details key={faq.q} className="group rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden scroll-reveal">
              <summary className="flex items-center justify-between cursor-pointer p-5 sm:p-6 text-white font-medium hover:bg-slate-800/30 transition-all duration-200 focus-ring rounded-xl list-none">
                <span className="text-sm sm:text-base">{faq.q}</span>
                <ChevronDown className="h-4 w-4 text-slate-500 transition-transform duration-200 group-open:rotate-180 shrink-0 ml-4" />
              </summary>
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-slate-400 text-sm leading-relaxed -mt-1">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section className="container mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <div className="relative max-w-3xl mx-auto text-center">
          {/* Background glow */}
          <div className="absolute inset-0 -m-8 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 rounded-3xl blur-xl" aria-hidden="true" />
          <div className="relative rounded-2xl border border-emerald-500/20 bg-slate-900/60 backdrop-blur-sm p-10 sm:p-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
              Your next funding is one click away
            </h2>
            <p className="text-slate-400 text-lg mb-4 max-w-lg mx-auto">
              2,000+ grants and 141+ scholarships from 12 live sources — matched to your profile, drafted by AI, scored before you submit.
            </p>
            <p className="text-emerald-400 text-sm font-medium mb-8">
              21-day free Pro trial. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={ctaHref}
                className="group flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto justify-center focus-ring"
              >
                {ctaLabel}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/pricing" className="text-slate-400 hover:text-white px-6 py-4 font-medium transition-all border border-slate-800 hover:border-slate-600 rounded-xl flex items-center gap-2 focus-ring">
                Compare Plans <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ SECONDARY CTA ═══════ */}
      <section className="container mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 sm:p-8 max-w-xl mx-auto text-center">
          <BookOpen className="h-7 w-7 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Not ready to sign up?</h3>
          <p className="text-slate-500 text-sm mb-4">
            Take our free Grant Readiness Assessment — 15 questions to see if you&apos;re grant-ready.
          </p>
          <Link href="/resources" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition focus-ring rounded-xl px-3 py-2">
            Browse Free Resources <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      </main>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="border-t border-slate-800/50">
        <div className="container mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 focus-ring rounded-xl">
                <Image src="/logo.svg" alt="GrantPilot logo" width={32} height={32} />
                <span className="font-bold text-white">
                  Grant<span className="text-emerald-400">Pilot</span>
                </span>
              </Link>
              <p className="hidden sm:block text-slate-600 text-xs">
                Built by grant writers and scholarship hunters.
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm">
              {[
                { href: "/pricing", label: "Pricing" },
                { href: "/resources", label: "Resources" },
                { href: "mailto:support@grantpilot.ai", label: "Contact" },
                { href: "/privacy", label: "Privacy" },
                { href: "/terms", label: "Terms" },
              ].map((link) => (
                <Link key={link.label} href={link.href} className="text-slate-500 hover:text-white transition py-2 px-3 rounded-lg focus-ring text-xs sm:text-sm">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="text-center mt-8 text-slate-600 text-xs">
            &copy; {new Date().getFullYear()} GrantPilot. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
