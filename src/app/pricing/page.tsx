"use client";

import { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Check,
  X,
  Sparkles,
  Zap,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  Gift,
  Shield,
  Building2,
  GraduationCap,
  ChevronDown,
  Star,
  TrendingUp,
  Clock,
  Award,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { useSubscription } from "@/hooks/useSubscription";

/* ─── Plan data ─── */
const plans = [
  {
    id: "free",
    name: "Starter",
    audience: "For individuals exploring grants",
    price: 0,
    priceAnnual: 0,
    successFee: null as string | null,
    highlight: null as string | null,
    features: [
      { text: "5 grant matches per month", included: true },
      { text: "Manual apply only", included: true },
      { text: "Save up to 10 grants", included: true },
      { text: "Weekly email digest", included: true },
      { text: "Basic Grant Readiness Score", included: true },
      { text: "Smart Fill (AI auto-apply)", included: false },
      { text: "Content Library", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Get Started Free",
    popular: false,
    icon: Sparkles,
    gradient: "from-slate-600 to-slate-500",
    ring: "ring-slate-700",
    iconBg: "bg-slate-800",
  },
  {
    id: "growth",
    name: "Growth",
    audience: "For growing organizations",
    price: 29,
    priceAnnual: 228,
    successFee: "5% on grants $10K+",
    highlight: "No fee on grants under $10K",
    features: [
      { text: "50 grant matches per month", included: true },
      { text: "10 Smart Fills per month", included: true },
      { text: "Content Library (100 blocks)", included: true },
      { text: "Website intelligence import", included: true },
      { text: "Daily email alerts", included: true },
      { text: "Full Grant Readiness Score", included: true },
      { text: "No fee on grants under $10K", included: true },
      { text: "Priority support", included: false },
    ],
    cta: "Start Growing",
    popular: false,
    icon: TrendingUp,
    gradient: "from-emerald-400 to-cyan-500",
    ring: "ring-cyan-500/30",
    iconBg: "bg-cyan-500/10",
  },
  {
    id: "pro",
    name: "Pro",
    audience: "For serious grant seekers",
    price: 79,
    priceAnnual: 708,
    successFee: "3% on grants won",
    highlight: null as string | null,
    features: [
      { text: "200 grant matches per month", included: true },
      { text: "50 Smart Fills per month", included: true },
      { text: "Content Library (500 blocks)", included: true },
      { text: "Auto-optimize to 100/100", included: true },
      { text: "Scoring + diff transparency", included: true },
      { text: "Up to 3 team members", included: true },
      { text: "Priority support", included: true },
      { text: "Cancel anytime, prorated refunds", included: true },
    ],
    cta: "Go Pro",
    popular: true,
    icon: Shield,
    gradient: "from-emerald-500 to-teal-400",
    ring: "ring-emerald-500/40",
    iconBg: "bg-emerald-500/10",
  },
  {
    id: "organization",
    name: "Organization",
    audience: "For teams and consultants",
    price: 249,
    priceAnnual: 2388,
    successFee: "2% on grants won",
    highlight: "Lowest success fee rate",
    features: [
      { text: "500 grant matches per month", included: true },
      { text: "200 Smart Fills per month", included: true },
      { text: "Content Library (1,000 blocks)", included: true },
      { text: "Up to 10 team members", included: true },
      { text: "Lowest success fee (2%)", included: true },
      { text: "Smart Budget Builder", included: true },
      { text: "Custom AI tone & templates", included: true },
      { text: "Dedicated success manager", included: true },
    ],
    cta: "Get Organization",
    popular: false,
    icon: Building2,
    gradient: "from-teal-500 to-emerald-600",
    ring: "ring-teal-500/30",
    iconBg: "bg-teal-500/10",
  },
];

const studentPlan = {
  id: "student_pro",
  name: "Student Pro",
  price: 9.99,
  priceAnnual: 96,
  freeFeatures: [
    "141+ scholarship database",
    "10 matches per month",
    "5 AI essay drafts per month",
    "8% success fee on wins",
  ],
  proFeatures: [
    "100 scholarship matches per month",
    "25 AI essay drafts per month",
    "25 batch auto-applies per month",
    "Reduced 3% success fee",
    "Personal statement coaching",
    "Winner verification system",
  ],
};

/* ─── FAQ data ─── */
const faqs = [
  {
    q: "Is there a money-back guarantee?",
    a: "All paid plans include a 21-day free trial — no credit card required. Cancel anytime during the trial and you won't be charged. We're building toward a formal Grant Guarantee for Pro plans and will announce it once we have enough data.",
  },
  {
    q: "How does Smart Fill work?",
    a: "Smart Fill reads the grant's scoring criteria, pulls from your Content Library (company data, team bios, impact metrics), and drafts your application section-by-section. It auto-optimizes up to 3 rounds until every criterion is addressed — you see exactly what the AI changed and why.",
  },
  {
    q: "How does the success fee work?",
    a: "When you win a grant using GrantPilot, a small success fee applies based on your plan (2-5%). The fee is invoiced only when you report a win. Starter plans have no success fee. Growth plans have no fee on grants under $10K. Compared to grant consultants who charge $5K-$15K per application, our fee is a fraction of the cost.",
  },
  {
    q: "Can I change plans later?",
    a: "Yes. Upgrade or downgrade at any time. Changes take effect immediately with prorated billing. You can also cancel anytime — no contracts.",
  },
  {
    q: "What happens to my annual plan if I cancel mid-year?",
    a: "Annual plans renew yearly. If you cancel before the renewal date, you keep access through the end of the period you've already paid for, and we issue a prorated refund for any remaining unused full months. Refund requests go to support@grantpilot.ai.",
  },
  {
    q: "When does the success fee get charged?",
    a: "Only when you self-report a grant as awarded. We send you an itemized invoice within 24 hours of your win-report — showing the awarded amount, the fee percentage, the fee dollar amount, and your net. Nothing is auto-charged from a guess. If a funder later reduces or rescinds the award, contact support and we'll prorate the fee.",
  },
  {
    q: "What's included in the student plan?",
    a: "Students get access to 141+ scholarships, AI-powered essay drafts personalized to each prompt, batch auto-apply to submit multiple applications at once, and winner verification. Free students pay an 8% success fee; Student Pro ($9.99/mo) reduces it to just 3% — saving you 63% on every win.",
  },
  {
    q: "Is my data secure?",
    a: "Your data is encrypted in transit (TLS 1.3) and at rest. Hosted on Vercel and Supabase with enterprise-grade infrastructure. Your data is never shared or used to train AI models.",
  },
];

function PricingContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { subscription, canStartTrial, startTrial, isOnTrial } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);
  const [trialStarted, setTrialStarted] = useState(false);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "annual">("monthly");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [pendingPlan, setPendingPlan] = useState<typeof plans[number] | null>(null);

  const canceled = searchParams.get("canceled");

  const handleStartTrial = async () => {
    if (!session) { router.push("/login?redirect=/pricing"); return; }
    setLoading("trial");
    const result = await startTrial();
    setLoading(null);
    if (result.success) {
      setTrialStarted(true);
      setTimeout(() => router.push("/dashboard?trial=started"), 2000);
    } else {
      alert(result.error || "Failed to start trial");
    }
  };

  const handleSubscribe = (planId: string) => {
    if (!session) { router.push("/login?redirect=/pricing"); return; }
    if (planId === "free") return;
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    setPendingPlan(plan);
  };

  const confirmCheckout = async () => {
    if (!pendingPlan) return;
    const planId = pendingPlan.id;
    setLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, interval: billingInterval }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { throw new Error(data.error || "Failed to create checkout session"); }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
      setLoading(null);
    }
  };

  const annualSavings = (monthly: number, annual: number) => {
    if (monthly === 0) return 0;
    return Math.round(((monthly * 12 - annual) / (monthly * 12)) * 100);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid-pattern opacity-10 pointer-events-none" aria-hidden="true" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />

      {/* Header */}
      <header className="relative border-b border-slate-800/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Image src="/logo.svg" alt="GrantPilot" width={32} height={32} className="group-hover:scale-105 transition-transform" priority />
            <span className="font-bold text-white text-lg">
              Grant<span className="text-emerald-400">Pilot</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {session ? (
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
                <Link href="/signup"><Button size="sm">Sign up free</Button></Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Banners */}
        {canceled && (
          <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <p className="text-amber-400 text-sm">Checkout was canceled. No charges were made.</p>
          </div>
        )}
        {trialStarted && (
          <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <p className="text-emerald-400 text-sm">Your 21-day Pro trial has started! Redirecting to dashboard...</p>
          </div>
        )}

        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Only pay when you win
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight">
            Plans that{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-transparent bg-clip-text">
              grow with you
            </span>
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Start free. Upgrade when you&apos;re ready. Every paid plan includes a 21-day trial.
          </p>

          {/* Billing Toggle */}
          <div className="mt-10 inline-flex items-center bg-slate-900/80 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setBillingInterval("monthly")}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                billingInterval === "monthly"
                  ? "bg-slate-700 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
              aria-pressed={billingInterval === "monthly"}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("annual")}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                billingInterval === "annual"
                  ? "bg-slate-700 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
              aria-pressed={billingInterval === "annual"}
            >
              Annual
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                Save up to 34%
              </span>
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Annual plans renew yearly. Cancel any time for a prorated refund of unused months.
          </p>
        </div>

        {/* ═══ Organization Plans ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === subscription?.plan;
            const savings = annualSavings(plan.price, plan.priceAnnual);

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border transition-all duration-300 ${
                  plan.popular
                    ? "border-emerald-500/50 bg-gradient-to-b from-emerald-500/[0.08] via-slate-900/80 to-slate-900/60 shadow-xl shadow-emerald-500/10 scale-[1.02] lg:scale-105"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/30">
                      <Star className="h-3 w-3 fill-current" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {/* Plan header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2.5 rounded-xl ${plan.iconBg}`}>
                      <plan.icon
                        className="h-5 w-5"
                        style={{
                          color: plan.popular
                            ? "#34d399"
                            : plan.id === "growth"
                            ? "#22d3ee"
                            : plan.id === "organization"
                            ? "#14b8a6"
                            : "#94a3b8",
                        }}
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                      <p className="text-xs text-slate-500">{plan.audience}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {billingInterval === "monthly" ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">${plan.price}</span>
                        <span className="text-slate-500 text-sm">/mo</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-white">
                            ${plan.priceAnnual > 0 ? Math.round(plan.priceAnnual / 12) : 0}
                          </span>
                          <span className="text-slate-500 text-sm">/mo</span>
                        </div>
                        {plan.priceAnnual > 0 && (
                          <p className="text-xs text-slate-500 mt-1">
                            ${plan.priceAnnual}/year
                            {savings > 0 && (
                              <span className="text-emerald-400 font-medium ml-1.5">Save {savings}%</span>
                            )}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Success fee callout */}
                    {plan.successFee && (
                      <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <Award className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                        <span className="text-xs text-amber-400/90">+ {plan.successFee}</span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  {plan.id === "pro" && canStartTrial && !isOnTrial ? (
                    <div className="mb-6">
                      <Button
                        className="w-full"
                        variant="gradient"
                        size="lg"
                        disabled={loading !== null}
                        onClick={handleStartTrial}
                      >
                        {loading === "trial" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Gift className="h-4 w-4" />
                            Start 21-Day Free Trial
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-slate-500 text-center mt-2">No credit card required</p>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <Button
                        className="w-full"
                        variant={plan.popular ? "primary" : "secondary"}
                        size="lg"
                        disabled={loading !== null || isCurrentPlan}
                        onClick={() => {
                          if (plan.id === "free") {
                            if (!session) router.push("/signup");
                            return;
                          }
                          handleSubscribe(plan.id);
                        }}
                        aria-label={`${plan.cta} — ${plan.name} plan`}
                      >
                        {loading === plan.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isCurrentPlan ? (
                          isOnTrial ? "Trial Active" : "Current Plan"
                        ) : plan.id === "free" && session && subscription?.plan !== "free" ? (
                          "Downgrade to Starter"
                        ) : (
                          <>
                            {plan.cta} <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Highlight callout */}
                  {plan.highlight && (
                    <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="text-xs text-emerald-400 font-medium">{plan.highlight}</span>
                    </div>
                  )}

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-4 w-4 text-slate-700 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm leading-5 ${feature.included ? "text-slate-300" : "text-slate-600"}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══ Student Plans ═══ */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4">
              <GraduationCap className="h-4 w-4" />
              For Students
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Win scholarships,{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                not stress
              </span>
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              141+ scholarships. AI-powered essays. Batch apply in one click.
            </p>
          </div>

          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Student Free */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-slate-800">
                  <GraduationCap className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Student Free</h3>
                  <p className="text-xs text-slate-500">Get started with scholarships</p>
                </div>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-slate-500 text-sm">/mo</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10 mb-6">
                <Award className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                <span className="text-xs text-amber-400/90">8% success fee on wins</span>
              </div>
              <Button
                className="w-full mb-6"
                variant="secondary"
                size="lg"
                onClick={() => session ? router.push("/student") : router.push("/signup")}
              >
                Start Free <ArrowRight className="h-4 w-4" />
              </Button>
              <ul className="space-y-3">
                {studentPlan.freeFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Student Pro */}
            <div className="relative rounded-2xl border border-purple-500/40 bg-gradient-to-b from-purple-500/[0.08] via-slate-900/80 to-slate-900/60 p-6 shadow-lg shadow-purple-500/5">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                <Badge variant="success">Best for students</Badge>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-purple-500/10">
                  <GraduationCap className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Student Pro</h3>
                  <p className="text-xs text-slate-500">Maximize your scholarship wins</p>
                </div>
              </div>
              <div className="mb-2">
                {billingInterval === "monthly" ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">${studentPlan.price}</span>
                    <span className="text-slate-500 text-sm">/mo</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">${Math.round(studentPlan.priceAnnual / 12)}</span>
                      <span className="text-slate-500 text-sm">/mo</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      ${studentPlan.priceAnnual}/year
                      <span className="text-purple-400 font-medium ml-1.5">Save 20%</span>
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 mb-6">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                <span className="text-xs text-emerald-400 font-medium">Only 3% success fee — save 63% vs Free</span>
              </div>
              <Button
                className="w-full mb-6"
                variant="primary"
                size="lg"
                disabled={loading !== null}
                onClick={() => handleSubscribe("student_pro")}
              >
                {loading === "student_pro" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Upgrade to Pro <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
              <ul className="space-y-3">
                {studentPlan.proFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ═══ How GrantPilot pays for itself ═══ */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">How GrantPilot pays for itself</h2>
            <p className="text-slate-400 text-sm">A single funded grant covers years of subscription. You only owe the success fee when you actually win.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { value: "Win → 3%", label: "Pro success fee on funded grants", icon: TrendingUp, sub: "vs. $5K–$15K consultants charge per application" },
              { value: "Auto → 100", label: "Smart Fill optimizes to top score", icon: Award, sub: "Up to 3 rounds, with diff transparency" },
              { value: "21 days", label: "Free trial, no card required", icon: Clock, sub: "Cancel anytime — keep what you draft" },
            ].map((stat, i) => (
              <div key={i} className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/50">
                <stat.icon className="h-5 w-5 text-emerald-400 mb-3" />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-300 mt-1">{stat.label}</p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ Trust Signals ═══ */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap text-slate-400 text-sm mb-20">
          {[
            { icon: CheckCircle, text: "Cancel anytime", color: "text-emerald-400" },
            { icon: CheckCircle, text: "21-day free trial", color: "text-emerald-400" },
            { icon: Shield, text: "Secure via Stripe", color: "text-emerald-400" },
            { icon: Award, text: "Success fee — we earn when you win", color: "text-amber-400" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <item.icon className={`h-4 w-4 ${item.color}`} />
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        {/* ═══ FAQ ═══ */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
            Frequently asked questions
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/30 transition-colors"
                >
                  <span className="text-sm font-medium text-white pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-500 flex-shrink-0 transition-transform duration-200 ${
                      expandedFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaq === i && (
                  <div className="px-5 pb-5 -mt-1">
                    <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ═══ Bottom CTA ═══ */}
        <div className="text-center py-16 px-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900/50 to-cyan-500/10 border border-emerald-500/20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Ready to win more funding?
          </h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Start free in 30 seconds. Upgrade only when GrantPilot has earned you funding.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/signup">
              <Button variant="gradient" size="lg">
                Get started free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            {canStartTrial && (
              <Button variant="outline" size="lg" onClick={handleStartTrial} disabled={loading !== null}>
                {loading === "trial" ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <><Gift className="h-4 w-4" /> Start Pro trial</>
                )}
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* ═══ Success Fee Disclosure Modal ═══ */}
      {pendingPlan && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="fee-disclosure-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setPendingPlan(null)}
        >
          <div
            className="relative max-w-md w-full rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="fee-disclosure-title" className="text-xl font-bold text-white mb-1">
              Confirm your {pendingPlan.name} subscription
            </h3>
            <p className="text-sm text-slate-400 mb-5">
              Before we send you to Stripe, here&apos;s exactly what you&apos;re agreeing to:
            </p>

            <dl className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between p-3 rounded-lg bg-slate-800/50">
                <dt className="text-slate-400">Subscription</dt>
                <dd className="text-white font-medium">
                  ${billingInterval === "monthly" ? pendingPlan.price : Math.round(pendingPlan.priceAnnual / 12)}
                  /month
                  {billingInterval === "annual" && (
                    <span className="text-xs text-slate-500 ml-1">(billed ${pendingPlan.priceAnnual}/yr)</span>
                  )}
                </dd>
              </div>
              {pendingPlan.successFee && (
                <div className="flex justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <dt className="text-amber-300">Success fee</dt>
                  <dd className="text-amber-200 font-medium text-right">
                    {pendingPlan.successFee}
                    <div className="text-xs text-amber-400/70 mt-0.5">
                      Charged only after a grant is awarded
                    </div>
                  </dd>
                </div>
              )}
              <div className="flex justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <dt className="text-emerald-300">Trial &amp; cancellation</dt>
                <dd className="text-emerald-200 font-medium text-right">
                  21-day trial
                  <div className="text-xs text-emerald-400/70 mt-0.5">
                    Cancel anytime, prorated refund
                  </div>
                </dd>
              </div>
            </dl>

            <div className="text-xs text-slate-500 mb-5 leading-relaxed">
              No setup fees. No cancellation fees. No per-application charges. Payments are securely processed by Stripe — your card details never touch GrantPilot servers.
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => setPendingPlan(null)}
                disabled={loading !== null}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={confirmCheckout}
                disabled={loading !== null}
              >
                {loading === pendingPlan.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Continue to Stripe <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} GrantPilot. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}
