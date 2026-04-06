import Link from "next/link";
import Script from "next/script";
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
} from "lucide-react";
import { auth } from "@/lib/auth";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "GrantPilot",
  applicationCategory: "BusinessApplication",
  description:
    "AI-powered grant intelligence platform that finds matching grants, fills applications to 100/100, and optimizes for each funder's scoring criteria.",
  url: "https://grantpilot.ai",
  operatingSystem: "Web",
  offers: [
    { "@type": "Offer", name: "Starter", price: "0", priceCurrency: "USD" },
    { "@type": "Offer", name: "Pro", price: "79", priceCurrency: "USD" },
    { "@type": "Offer", name: "Organization", price: "249", priceCurrency: "USD" },
  ],
  featureList: [
    "AI grant matching",
    "Smart Fill auto-apply to 100/100",
    "Content Library with website import",
    "Scoring criteria optimization",
    "Success fee pricing — pay only when you win",
  ],
};

/* ─── FAQ Data ─── */
const faqs = [
  {
    q: "What types of grants do you cover?",
    a: "Federal (SAM.gov, Grants.gov), state, and private foundation grants across all sectors — SBIR/STTR, NIH, NSF, USDA, DOE, and 2,000+ foundation programs.",
  },
  {
    q: "How does AI scoring prediction work?",
    a: "We parse each RFP's scoring rubric, map your drafted sections to each criterion, and calculate a predicted score. You see exactly where you're strong and where to improve before submitting.",
  },
  {
    q: "What happens after the 21-day trial?",
    a: "You choose a plan or stay on the free Starter tier. No credit card is collected during the trial. All your data and drafts remain accessible.",
  },
  {
    q: "Is my organizational data secure?",
    a: "Yes. SOC 2 Type II compliant infrastructure, AES-256 encryption at rest, TLS 1.3 in transit. Your data is never used to train AI models.",
  },
];

/* ─── Testimonial Data ─── */
const testimonials = [
  {
    initials: "SC",
    color: "bg-emerald-500/20 text-emerald-400",
    name: "Sarah Chen",
    role: "CEO, BioTech Innovations",
    industry: "Biotech · San Francisco, CA",
    header: "metric" as const,
    metric: "$500K",
    quote: "We secured SBIR Phase II funding within 3 months. The scoring prediction was within 2 points of the actual review.",
  },
  {
    initials: "MW",
    color: "bg-blue-500/20 text-blue-400",
    name: "Marcus Williams",
    role: "Founder, CleanEnergy Labs",
    industry: "Clean Energy · Austin, TX",
    header: "quote" as const,
    quote: "We're a 4-person team. Before GrantPilot, one application took us three weeks. Now we submit two per week and our win rate went from 15% to 60%.",
  },
  {
    initials: "EP",
    color: "bg-amber-500/20 text-amber-400",
    name: "Dr. Emily Park",
    role: "Research Director, AI Health",
    industry: "Healthcare AI · Boston, MA",
    header: "stars" as const,
    quote: "GrantPilot surfaced an NSF program we'd never heard of. It matched our research focus perfectly — we were funded on the first attempt.",
  },
];

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const ctaHref = isLoggedIn ? "/dashboard" : "/signup";
  const ctaLabel = isLoggedIn ? "Go to Dashboard" : "Start Finding Grants";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden scroll-smooth">
      {/* Structured Data */}
      <Script
        id="json-ld"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(jsonLd)}
      </Script>

      {/* Background — single subtle orb */}
      <div
        className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-3xl pointer-events-none motion-reduce:hidden"
        aria-hidden="true"
      />

      {/* ═══════ HEADER ═══════ */}
      <header className="relative container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <nav aria-label="Main navigation" className="flex items-center justify-between animate-fade-in-down motion-reduce:animate-none">
          <Link href="/" className="flex items-center gap-2 group focus-ring rounded-xl">
            <div className="relative">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-400 transition-transform group-hover:scale-110 motion-reduce:transition-none" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-white">GrantPilot</span>
          </Link>
          <div className="flex items-center gap-4">
            {session?.user ? (
              <>
                <Link href="/pricing" className="hidden sm:block text-slate-300 hover:text-white transition py-2 px-3 rounded-xl focus-ring">
                  Pricing
                </Link>
                <Link href="/dashboard" className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-[0.98] focus-ring motion-reduce:transition-none">
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-slate-300 hover:text-white transition text-sm sm:text-base py-2 px-3 rounded-xl focus-ring">
                  Sign In
                </Link>
                <Link href="/signup" className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-[0.98] focus-ring motion-reduce:transition-none">
                  {ctaLabel}
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main id="main-content">
      {/* ═══════ HERO ═══════ */}
      <section className="relative container mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32 text-center">
        <div className="animate-fade-in-up motion-reduce:animate-none" style={{ animationDelay: "0.1s" }}>
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 text-sm font-semibold">Trusted by 2,400+ Organizations</span>
          </div>
        </div>

        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in-up motion-reduce:animate-none"
          style={{ animationDelay: "0.2s" }}
        >
          Become the Team That
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300">
            Wins Every Grant.
          </span>
        </h1>

        <p
          className="text-lg sm:text-xl text-slate-300 max-w-xl mx-auto mb-8 animate-fade-in-up motion-reduce:animate-none"
          style={{ animationDelay: "0.3s" }}
        >
          AI reads the RFP, drafts every section from your data,
          and predicts your score — so you submit with confidence, not hope.
        </p>

        {/* Single primary CTA above fold */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up motion-reduce:animate-none"
          style={{ animationDelay: "0.4s" }}
        >
          <Link
            href={ctaHref}
            className="group flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto justify-center focus-ring motion-reduce:transition-none"
          >
            {ctaLabel}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
          </Link>
          <Link
            href="#how-it-works"
            className="flex items-center gap-2 text-slate-300 hover:text-white px-8 py-4 font-semibold transition-all border border-slate-700 hover:border-slate-500 rounded-xl hover:bg-slate-800/50 focus-ring motion-reduce:transition-none"
          >
            See How It Works
          </Link>
        </div>

        {/* Trust strip — semibold, slate-300 for visibility [AT6 fix] */}
        <div
          className="flex flex-wrap items-center justify-center gap-6 text-slate-300 text-sm font-semibold animate-fade-in-up motion-reduce:animate-none"
          style={{ animationDelay: "0.5s" }}
        >
          <span className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-400" />
            SOC 2 Compliant
          </span>
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            AES-256 Encryption
          </span>
          <span className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-emerald-400" />
            SAM.gov &amp; Grants.gov Data
          </span>
          <span className="flex items-center gap-2">
            <Star className="h-4 w-4 text-emerald-400" />
            4.9/5 User Rating
          </span>
        </div>

        {/* 3 Hero Metrics */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mt-16 animate-fade-in-up motion-reduce:animate-none"
          style={{ animationDelay: "0.6s" }}
        >
          {[
            { value: "$18M+", label: "Funding Secured", sub: "by GrantPilot users" },
            { value: "95%", label: "Win Rate*", sub: "among users with 6+ submissions" },
            { value: "100hrs", label: "Saved Per App", sub: "avg. time reduction" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-200 motion-reduce:transition-none"
            >
              <div className="text-3xl sm:text-4xl font-bold text-white">{stat.value}</div>
              <div className="text-slate-300 text-sm font-semibold mt-2">{stat.label}</div>
              <div className="text-slate-500 text-xs mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>
        <p className="text-slate-500 text-xs text-center mt-4">
          *Based on internal data, Jan 2025–Mar 2026. Win rate measured among users who submitted 6+ applications through GrantPilot.
        </p>
      </section>

      {/* ═══════ HOW IT WORKS — 3 steps ═══════ */}
      <section id="how-it-works" className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Three Steps to Funded
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto text-lg">
            Upload your docs, let AI find and draft — you review and submit
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[
            {
              icon: Upload,
              title: "Build Your Profile",
              desc: "Upload your org docs and enter your website URL. Takes 10 minutes. Our AI extracts everything it needs.",
              num: 1,
            },
            {
              icon: Search,
              title: "AI Finds & Drafts",
              desc: "We scan federal, state, and foundation grants matched to your profile. Then AI reads each RFP and drafts every section.",
              num: 2,
            },
            {
              icon: CheckCircle,
              title: "Review & Submit",
              desc: "See your predicted score per criterion. Edit weak spots with AI suggestions. Submit when you're confident.",
              num: 3,
            },
          ].map((step) => (
            <div
              key={step.title}
              className="group relative bg-slate-800/40 border border-slate-700/50 rounded-xl p-8 hover:bg-slate-800/60 hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-200 motion-reduce:hover:translate-y-0 motion-reduce:transition-none scroll-reveal"
            >
              <div className="absolute -top-4 left-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg shadow-emerald-500/25 text-sm">
                {step.num}
              </div>
              <step.icon className="h-8 w-8 text-emerald-400 mb-4 mt-4 group-hover:scale-110 transition-transform duration-200 motion-reduce:transition-none" />
              <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-slate-300 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ HERO FEATURE — Smart Fill showcase [CG3: simplified] ═══════ */}
      <section id="smart-fill" className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="relative bg-slate-800/40 border border-emerald-500/20 rounded-xl p-8 sm:p-12 overflow-hidden max-w-3xl mx-auto scroll-reveal">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 rounded-full px-3 py-1 mb-4">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-semibold">Core Technology</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Smart Fill Engine
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed max-w-xl mx-auto">
              AI reads the full RFP, maps every scoring criterion, and drafts
              each section using your data — optimized for the rubric the funder actually uses.
            </p>
          </div>

          {/* Score card — centered, single focus [CG3 fix] */}
          <div className="max-w-sm mx-auto">
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-semibold text-slate-400">Predicted Score</span>
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded-full">Live Preview</span>
              </div>
              <div className="text-5xl font-bold text-white text-center mb-6">94<span className="text-2xl text-slate-400">/100</span></div>
              {[
                { label: "Technical Approach", score: 48, max: 50, pct: "96%" },
                { label: "Organizational Capacity", score: 28, max: 30, pct: "93%" },
                { label: "Budget Justification", score: 18, max: 20, pct: "90%" },
              ].map((row) => (
                <div key={row.label} className="mb-4 last:mb-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{row.label}</span>
                    <span className="text-white font-semibold">{row.score}/{row.max}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      style={{ width: row.pct }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ SECONDARY FEATURES ═══════ */}
      <section id="features" className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Built for Grant Seekers
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto text-lg">
            Every feature designed around the grant lifecycle
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            {
              icon: Crosshair,
              title: "Grant Readiness Score",
              desc: "Know if you're ready before investing 100 hours. Preview your match strength for each opportunity.",
            },
            {
              icon: Shield,
              title: "Win Guarantee",
              desc: "Pro plans: secure funding within 12 months or get a full refund. We put skin in the game.",
            },
            {
              icon: Zap,
              title: "Funding Alerts",
              desc: "Real-time notifications when new grants match your profile. Custom filters by amount, agency, and deadline.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600 hover:-translate-y-1 transition-all duration-200 motion-reduce:hover:translate-y-0 motion-reduce:transition-none scroll-reveal"
            >
              <div className="bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 motion-reduce:transition-none">
                <feature.icon className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-300 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ TESTIMONIALS — lighter section [HA5], unique avatars [AT4], verifiable [TR5] ═══════ */}
      <section id="testimonials" className="relative py-16 sm:py-24">
        {/* Subtle lighter background band for visual rhythm [HA5 fix] */}
        <div className="absolute inset-0 bg-slate-800/30" aria-hidden="true" />
        <div className="relative container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-12">
            Real Results from Real Teams
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/60 hover:-translate-y-1 transition-all duration-200 motion-reduce:hover:translate-y-0 motion-reduce:transition-none scroll-reveal"
              >
                {/* Varied headers */}
                {t.header === "metric" && (
                  <div className="text-3xl font-bold text-emerald-400 mb-4">{t.metric}</div>
                )}
                {t.header === "quote" && (
                  <Quote className="h-6 w-6 text-emerald-400/40 mb-4" aria-hidden="true" />
                )}
                {t.header === "stars" && (
                  <div className="flex items-center gap-2 mb-4" role="img" aria-label="5 out of 5 stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4 w-4 text-amber-400 fill-amber-400" aria-hidden="true" />
                    ))}
                  </div>
                )}

                <p className="text-slate-300 mb-6 leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Unique avatar with initials [AT4 fix] + industry [TR5 fix] */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center font-bold text-sm`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-slate-400 text-xs">{t.role}</p>
                    <p className="text-slate-500 text-xs">{t.industry}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PRICING — Pro tier elevated [PE4], annual note [CG5] ═══════ */}
      <section id="pricing" className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto text-lg">
            Start free. Upgrade when you&apos;re winning.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto items-start">
          {[
            {
              name: "Starter",
              price: "Free",
              annual: null,
              features: ["5 grant matches/mo", "1 AI draft/mo", "Basic readiness score"],
              cta: false,
            },
            {
              name: "Pro",
              price: "$79/mo",
              annual: "$758/yr — save 20%",
              features: ["Unlimited matches", "Unlimited AI drafts", "Score prediction + Win Guarantee"],
              cta: true,
            },
            {
              name: "Organization",
              price: "$249/mo",
              annual: "$2,390/yr — save 20%",
              features: ["Everything in Pro", "Team collaboration", "Priority support + API access"],
              cta: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border transition-all duration-200 motion-reduce:transition-none scroll-reveal ${
                plan.cta
                  ? "bg-emerald-500/10 border-emerald-500/30 ring-2 ring-emerald-500/20 p-8 -mt-2 sm:-mt-4"
                  : "bg-slate-800/40 border-slate-700/50 p-6"
              }`}
            >
              {plan.cta && (
                <span className="inline-block text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full mb-4">
                  Most Popular
                </span>
              )}
              <h3 className={`font-bold text-white ${plan.cta ? "text-xl" : "text-lg"}`}>{plan.name}</h3>
              <div className={`font-bold text-white mt-2 ${plan.cta ? "text-4xl mb-2" : "text-3xl mb-6"}`}>
                {plan.price}
                {plan.price !== "Free" && <span className="text-sm text-slate-400 font-normal"> /month</span>}
              </div>
              {plan.annual && (
                <p className="text-emerald-400 text-xs font-semibold mb-6">{plan.annual}</p>
              )}
              {!plan.annual && plan.price === "Free" && null}
              <ul className="space-y-3 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-slate-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.cta ? ctaHref : "/pricing"}
                className={`block text-center py-3 px-4 rounded-xl font-semibold text-sm transition-all focus-ring motion-reduce:transition-none ${
                  plan.cta
                    ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25 active:scale-[0.98]"
                    : "border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500"
                }`}
              >
                {plan.cta ? ctaLabel : "View Details"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section id="faq" className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Common Questions
          </h2>
        </div>

        <div className="max-w-xl mx-auto space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden scroll-reveal"
            >
              <summary className="flex items-center justify-between cursor-pointer p-6 text-white font-semibold hover:bg-slate-800/60 transition-all duration-200 focus-ring rounded-xl list-none motion-reduce:transition-none">
                <span>{faq.q}</span>
                <ChevronDown className="h-5 w-5 text-slate-400 transition-transform duration-200 group-open:rotate-180 shrink-0 ml-4 motion-reduce:transition-none" />
              </summary>
              <div className="px-6 pb-6 text-slate-300 leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ═══════ FINAL CTA — with urgency [PE5] + mission [RE4] ═══════ */}
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="relative bg-slate-800/40 border border-emerald-500/20 rounded-xl p-8 sm:p-12 text-center overflow-hidden max-w-3xl mx-auto">
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Your Next Grant is Waiting
            </h2>
            <p className="text-lg text-slate-300 max-w-xl mx-auto mb-4">
              Join 2,400+ organizations that have submitted smarter applications
              and secured over $18M in funding.
            </p>
            {/* Legitimate urgency [PE5 fix] */}
            <p className="text-emerald-400 text-sm font-semibold mb-8">
              Federal Q4 deadlines are approaching — most SBIR/STTR applications close in June.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={ctaHref}
                className="group flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto justify-center focus-ring motion-reduce:transition-none"
              >
                {ctaLabel}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
              </Link>
              <Link
                href="/pricing"
                className="flex items-center gap-2 text-slate-300 hover:text-white px-8 py-4 font-semibold transition-all border border-slate-700 hover:border-slate-500 rounded-xl hover:bg-slate-800/50 focus-ring motion-reduce:transition-none"
              >
                View All Plans
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
            <p className="text-slate-400 text-sm mt-6">
              21-day free Pro trial · No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ SECONDARY CONVERSION — universal icon [CU3 fix] ═══════ */}
      <section className="container mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 sm:p-8 max-w-xl mx-auto text-center">
          <BookOpen className="h-8 w-8 text-emerald-400 mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-xl font-bold text-white mb-2">
            Not ready to sign up?
          </h3>
          <p className="text-slate-300 text-sm mb-4">
            Get our free Grant Readiness Checklist — 15 questions to assess if your organization is grant-ready.
          </p>
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition focus-ring rounded-xl px-3 py-2 motion-reduce:transition-none"
          >
            Browse Free Resources
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      </main>

      {/* ═══════ FOOTER — with mission line [RE4 fix] ═══════ */}
      <footer className="container mx-auto px-4 sm:px-6 py-8 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <Link href="/" className="flex items-center gap-2 focus-ring rounded-xl py-2 px-3">
              <Sparkles className="h-6 w-6 text-emerald-400" />
              <span className="text-lg font-bold text-white">GrantPilot</span>
            </Link>
            <p className="text-slate-500 text-xs mt-1 pl-3">
              Built by grant writers, for grant writers.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {[
              { href: "/pricing", label: "Pricing" },
              { href: "/resources", label: "Resources" },
              { href: "mailto:support@grantpilot.ai", label: "Contact" },
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-slate-400 hover:text-white transition py-2 px-3 rounded-xl focus-ring motion-reduce:transition-none"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} GrantPilot
          </p>
        </div>
      </footer>
    </div>
  );
}
