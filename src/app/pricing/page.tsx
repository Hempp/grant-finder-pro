"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
import { Button } from "@/components/ui";
import { Dialog } from "@/components/ui/Dialog";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { CtaBanner } from "@/components/landing";
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
    cta: "Get started free",
    popular: false,
    icon: Sparkles,
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
    cta: "Start growing",
    popular: false,
    icon: TrendingUp,
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
    a: "Annual plans renew yearly. If you cancel before the renewal date, you keep access through the end of the period you've already paid for, and we issue a prorated refund for any remaining unused full months. Refund requests go to support@grantpilot.dev.",
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
  const highlightedPlan = searchParams.get("plan");

  // Scroll the deep-linked plan into view when arriving from /dashboard/team
  // (?plan=pro or ?plan=organization). Smooth + centered so the CTA is in
  // the user's primary focus zone.
  useEffect(() => {
    if (!highlightedPlan) return;
    const el = document.getElementById(`plan-${highlightedPlan}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedPlan]);

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
    <main id="main-content">
      {/* Hero — quiet. Marine eyebrow + display heading. */}
      <section
        style={{
          paddingTop: "var(--section-py)",
          paddingBottom: "var(--section-py-tight)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {canceled && (
            <div
              className="mb-8 p-4 flex items-start gap-2.5"
              style={{
                background: "var(--warn-soft)",
                border: "1px solid var(--warn)",
                color: "var(--warn)",
                borderRadius: "var(--radius-control)",
              }}
            >
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <p style={{ fontSize: "var(--text-body-sm)" }}>
                Checkout was canceled. No charges were made.
              </p>
            </div>
          )}
          {trialStarted && (
            <div
              className="mb-8 p-4 flex items-start gap-2.5"
              style={{
                background: "var(--success-soft)",
                border: "1px solid var(--success)",
                color: "var(--success)",
                borderRadius: "var(--radius-control)",
              }}
            >
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <p style={{ fontSize: "var(--text-body-sm)" }}>
                Your 21-day Pro trial has started. Redirecting to dashboard…
              </p>
            </div>
          )}

          <div className="text-center">
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
              <Zap className="h-3.5 w-3.5" aria-hidden="true" />
              Only pay when you win
            </div>
            <h1
              className="font-semibold tracking-tight"
              style={{
                fontSize: "clamp(36px, 5vw, 60px)",
                color: "var(--ink)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              Plans that grow with you
            </h1>
            <p
              className="mt-5 mx-auto max-w-2xl"
              style={{
                fontSize: "var(--text-body-lg)",
                color: "var(--ink-2)",
                lineHeight: 1.6,
              }}
            >
              Start free. Upgrade when you&apos;re ready. Every paid plan includes a 21-day trial.
            </p>

            {/* Billing Toggle */}
            <div
              className="mt-10 inline-flex items-center p-1"
              style={{
                background: "var(--bg-soft)",
                border: "1px solid var(--rule)",
                borderRadius: "var(--radius-control)",
              }}
            >
              <button
                onClick={() => setBillingInterval("monthly")}
                className="px-5 py-2.5 rounded-md font-medium transition-all"
                style={
                  billingInterval === "monthly"
                    ? {
                        background: "var(--surface)",
                        color: "var(--ink)",
                        fontSize: "var(--text-body-sm)",
                        boxShadow: "var(--shadow-card-soft)",
                      }
                    : {
                        background: "transparent",
                        color: "var(--ink-2)",
                        fontSize: "var(--text-body-sm)",
                      }
                }
                aria-pressed={billingInterval === "monthly"}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval("annual")}
                className="px-5 py-2.5 rounded-md font-medium transition-all inline-flex items-center gap-2"
                style={
                  billingInterval === "annual"
                    ? {
                        background: "var(--surface)",
                        color: "var(--ink)",
                        fontSize: "var(--text-body-sm)",
                        boxShadow: "var(--shadow-card-soft)",
                      }
                    : {
                        background: "transparent",
                        color: "var(--ink-2)",
                        fontSize: "var(--text-body-sm)",
                      }
                }
                aria-pressed={billingInterval === "annual"}
              >
                Annual
                <span
                  className="px-2 py-0.5 rounded-full font-semibold"
                  style={{
                    background: "var(--success-soft)",
                    color: "var(--success)",
                    fontSize: "var(--text-micro)",
                  }}
                >
                  Save up to 34%
                </span>
              </button>
            </div>
            <p
              className="mt-3"
              style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
            >
              Annual plans renew yearly. Cancel any time for a prorated refund of unused months.
            </p>
          </div>
        </div>
      </section>

      {/* Org plans — band on tint-1, white cards with accent-soft popular tint. */}
      <section
        style={{
          paddingTop: "var(--section-py-tight)",
          paddingBottom: "var(--section-py)",
          background: "var(--bg-soft)",
          borderTop: "1px solid var(--rule)",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((plan) => {
              const isCurrentPlan = plan.id === subscription?.plan;
              const savings = annualSavings(plan.price, plan.priceAnnual);
              const isHighlighted = plan.id === highlightedPlan;
              const isAccented = plan.popular || isHighlighted;

              return (
                <div
                  key={plan.id}
                  id={`plan-${plan.id}`}
                  className="relative scroll-mt-24 transition-all"
                  style={{
                    background: isAccented ? "var(--accent-soft)" : "var(--surface)",
                    border: `${isAccented ? "2px" : "1px"} solid ${isAccented ? "var(--accent)" : "var(--rule)"}`,
                    borderRadius: "var(--radius-card)",
                    boxShadow: "var(--shadow-card-soft)",
                  }}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                      <div
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold"
                        style={{
                          background: "var(--accent)",
                          color: "white",
                          fontSize: "var(--text-micro)",
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                        Most popular
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Plan header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="p-2.5 inline-flex"
                        style={{
                          background: isAccented ? "var(--surface)" : "var(--accent-soft)",
                          color: "var(--accent)",
                          borderRadius: "var(--radius-control)",
                        }}
                      >
                        <plan.icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h3
                          className="font-semibold"
                          style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
                        >
                          {plan.name}
                        </h3>
                        <p
                          style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
                        >
                          {plan.audience}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      {billingInterval === "monthly" ? (
                        <div className="flex items-baseline gap-1">
                          <span
                            className="font-mono tabular-nums font-semibold"
                            style={{ fontSize: "var(--text-display)", color: "var(--ink)" }}
                          >
                            ${plan.price}
                          </span>
                          <span style={{ color: "var(--ink-2)", fontSize: "var(--text-body-sm)" }}>
                            /mo
                          </span>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span
                              className="font-mono tabular-nums font-semibold"
                              style={{ fontSize: "var(--text-display)", color: "var(--ink)" }}
                            >
                              ${plan.priceAnnual > 0 ? Math.round(plan.priceAnnual / 12) : 0}
                            </span>
                            <span style={{ color: "var(--ink-2)", fontSize: "var(--text-body-sm)" }}>
                              /mo
                            </span>
                          </div>
                          {plan.priceAnnual > 0 && (
                            <p
                              className="mt-1"
                              style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
                            >
                              ${plan.priceAnnual}/year
                              {savings > 0 && (
                                <span
                                  className="ml-1.5 font-semibold"
                                  style={{ color: "var(--success)" }}
                                >
                                  Save {savings}%
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      )}

                      {plan.successFee && (
                        <div
                          className="mt-3 flex items-center gap-2 px-3 py-2"
                          style={{
                            background: "var(--warn-soft)",
                            border: "1px solid var(--warn)",
                            borderRadius: "var(--radius-control)",
                            color: "var(--warn)",
                            fontSize: "var(--text-caption)",
                          }}
                        >
                          <Award className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                          <span>+ {plan.successFee}</span>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    {plan.id === "pro" && canStartTrial && !isOnTrial ? (
                      <div className="mb-6">
                        <Button
                          className="w-full !text-white"
                          style={{
                            background: "var(--accent)",
                            borderColor: "var(--accent)",
                            borderRadius: "var(--radius-control)",
                          }}
                          size="lg"
                          disabled={loading !== null}
                          onClick={handleStartTrial}
                        >
                          {loading === "trial" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Gift className="h-4 w-4" />
                              Start 21-day free trial
                            </>
                          )}
                        </Button>
                        <p
                          className="text-center mt-2"
                          style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
                        >
                          No credit card required
                        </p>
                      </div>
                    ) : (
                      <div className="mb-6">
                        <Button
                          className={`w-full ${plan.popular ? "!text-white" : ""}`}
                          style={
                            plan.popular
                              ? {
                                  background: "var(--accent)",
                                  borderColor: "var(--accent)",
                                  borderRadius: "var(--radius-control)",
                                }
                              : {
                                  background: "var(--surface)",
                                  color: "var(--ink)",
                                  border: "1px solid var(--rule)",
                                  borderRadius: "var(--radius-control)",
                                }
                          }
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
                            isOnTrial ? "Trial active" : "Current plan"
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
                      <div
                        className="flex items-center gap-2 mb-4 px-3 py-2"
                        style={{
                          background: "var(--success-soft)",
                          border: "1px solid var(--success)",
                          color: "var(--success)",
                          borderRadius: "var(--radius-control)",
                          fontSize: "var(--text-caption)",
                          fontWeight: 500,
                        }}
                      >
                        <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                        <span>{plan.highlight}</span>
                      </div>
                    )}

                    {/* Features */}
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          {feature.included ? (
                            <Check
                              className="h-4 w-4 flex-shrink-0 mt-0.5"
                              style={{ color: "var(--success)" }}
                              aria-hidden="true"
                            />
                          ) : (
                            <X
                              className="h-4 w-4 flex-shrink-0 mt-0.5"
                              style={{ color: "var(--rule)" }}
                              aria-hidden="true"
                            />
                          )}
                          <span
                            style={{
                              fontSize: "var(--text-body-sm)",
                              color: feature.included ? "var(--ink)" : "var(--ink-2)",
                              lineHeight: 1.5,
                            }}
                          >
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
        </div>
      </section>

      {/* Student plans — quiet, no purple. Student Pro accents in marine. */}
      <section
        style={{
          paddingTop: "var(--section-py)",
          paddingBottom: "var(--section-py)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
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
              <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
              For students
            </div>
            <h2
              className="font-semibold tracking-tight"
              style={{
                fontSize: "var(--text-display)",
                color: "var(--ink)",
                lineHeight: 1.1,
              }}
            >
              Win scholarships, not stress
            </h2>
            <p
              className="mt-4 mx-auto max-w-lg"
              style={{
                fontSize: "var(--text-body-lg)",
                color: "var(--ink-2)",
                lineHeight: 1.6,
              }}
            >
              141+ scholarships. AI-powered essays. Batch apply in one click.
            </p>
          </div>

          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Student Free */}
            <div
              className="p-6"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--rule)",
                borderRadius: "var(--radius-card)",
                boxShadow: "var(--shadow-card-soft)",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-2.5 inline-flex"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                    borderRadius: "var(--radius-control)",
                  }}
                >
                  <GraduationCap className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3
                    className="font-semibold"
                    style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
                  >
                    Student Free
                  </h3>
                  <p style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}>
                    Get started with scholarships
                  </p>
                </div>
              </div>
              <div className="flex items-baseline gap-1 mb-3">
                <span
                  className="font-mono tabular-nums font-semibold"
                  style={{ fontSize: "var(--text-display)", color: "var(--ink)" }}
                >
                  $0
                </span>
                <span style={{ color: "var(--ink-2)", fontSize: "var(--text-body-sm)" }}>
                  /mo
                </span>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 mb-6"
                style={{
                  background: "var(--warn-soft)",
                  border: "1px solid var(--warn)",
                  color: "var(--warn)",
                  borderRadius: "var(--radius-control)",
                  fontSize: "var(--text-caption)",
                }}
              >
                <Award className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                <span>8% success fee on wins</span>
              </div>
              <Button
                className="w-full mb-6"
                style={{
                  background: "var(--surface)",
                  color: "var(--ink)",
                  border: "1px solid var(--rule)",
                  borderRadius: "var(--radius-control)",
                }}
                size="lg"
                onClick={() => session ? router.push("/student") : router.push("/signup")}
              >
                Start free <ArrowRight className="h-4 w-4" />
              </Button>
              <ul className="space-y-3">
                {studentPlan.freeFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check
                      className="h-4 w-4 flex-shrink-0 mt-0.5"
                      style={{ color: "var(--success)" }}
                      aria-hidden="true"
                    />
                    <span style={{ fontSize: "var(--text-body-sm)", color: "var(--ink)" }}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Student Pro */}
            <div
              className="relative p-6"
              style={{
                background: "var(--accent-soft)",
                border: "2px solid var(--accent)",
                borderRadius: "var(--radius-card)",
                boxShadow: "var(--shadow-card-soft)",
              }}
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                <div
                  className="px-3 py-1 rounded-full font-semibold"
                  style={{
                    background: "var(--accent)",
                    color: "white",
                    fontSize: "var(--text-micro)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  Best for students
                </div>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-2.5 inline-flex"
                  style={{
                    background: "var(--surface)",
                    color: "var(--accent)",
                    borderRadius: "var(--radius-control)",
                  }}
                >
                  <GraduationCap className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3
                    className="font-semibold"
                    style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
                  >
                    Student Pro
                  </h3>
                  <p style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}>
                    Maximize your scholarship wins
                  </p>
                </div>
              </div>
              <div className="mb-3">
                {billingInterval === "monthly" ? (
                  <div className="flex items-baseline gap-1">
                    <span
                      className="font-mono tabular-nums font-semibold"
                      style={{ fontSize: "var(--text-display)", color: "var(--ink)" }}
                    >
                      ${studentPlan.price}
                    </span>
                    <span style={{ color: "var(--ink-2)", fontSize: "var(--text-body-sm)" }}>
                      /mo
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span
                        className="font-mono tabular-nums font-semibold"
                        style={{ fontSize: "var(--text-display)", color: "var(--ink)" }}
                      >
                        ${Math.round(studentPlan.priceAnnual / 12)}
                      </span>
                      <span style={{ color: "var(--ink-2)", fontSize: "var(--text-body-sm)" }}>
                        /mo
                      </span>
                    </div>
                    <p
                      className="mt-1"
                      style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
                    >
                      ${studentPlan.priceAnnual}/year
                      <span
                        className="ml-1.5 font-semibold"
                        style={{ color: "var(--accent)" }}
                      >
                        Save 20%
                      </span>
                    </p>
                  </div>
                )}
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 mb-6"
                style={{
                  background: "var(--success-soft)",
                  border: "1px solid var(--success)",
                  color: "var(--success)",
                  borderRadius: "var(--radius-control)",
                  fontSize: "var(--text-caption)",
                  fontWeight: 500,
                }}
              >
                <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                <span>Only 3% success fee — save 63% vs Free</span>
              </div>
              <Button
                className="w-full mb-6 !text-white"
                style={{
                  background: "var(--accent)",
                  borderColor: "var(--accent)",
                  borderRadius: "var(--radius-control)",
                }}
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
                    <Check
                      className="h-4 w-4 flex-shrink-0 mt-0.5"
                      style={{ color: "var(--accent)" }}
                      aria-hidden="true"
                    />
                    <span style={{ fontSize: "var(--text-body-sm)", color: "var(--ink)" }}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it pays for itself — ScoreRing on the two scored stats. */}
      <section
        style={{
          paddingTop: "var(--section-py-tight)",
          paddingBottom: "var(--section-py)",
          background: "var(--bg-soft)",
          borderTop: "1px solid var(--rule)",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2
              className="font-semibold tracking-tight"
              style={{ fontSize: "var(--text-title)", color: "var(--ink)" }}
            >
              How GrantPilot pays for itself
            </h2>
            <p
              className="mt-3 mx-auto max-w-2xl"
              style={{ fontSize: "var(--text-body)", color: "var(--ink-2)", lineHeight: 1.65 }}
            >
              A single funded grant covers years of subscription. You only owe the success fee
              when you actually win.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {/* Win → 3% — ScoreRing at 97 (the "kept" share of every win). */}
            <div
              className="p-6 flex flex-col items-center text-center"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--rule)",
                borderRadius: "var(--radius-card)",
                boxShadow: "var(--shadow-card-soft)",
              }}
            >
              <ScoreRing score={97} size="md" label="You keep 97%" />
              <p
                className="mt-4 font-semibold"
                style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
              >
                You keep 97%
              </p>
              <p
                className="mt-1"
                style={{ fontSize: "var(--text-body-sm)", color: "var(--ink-2)" }}
              >
                Pro success fee on funded grants
              </p>
              <p
                className="mt-3"
                style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)", lineHeight: 1.5 }}
              >
                vs. $5K–$15K consultants charge per application
              </p>
            </div>

            {/* Auto → 100 — ScoreRing at 100 (the optimization target). */}
            <div
              className="p-6 flex flex-col items-center text-center"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--rule)",
                borderRadius: "var(--radius-card)",
                boxShadow: "var(--shadow-card-soft)",
              }}
            >
              <ScoreRing score={100} size="md" label="Auto-optimized to top score" />
              <p
                className="mt-4 font-semibold"
                style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
              >
                Auto-optimized
              </p>
              <p
                className="mt-1"
                style={{ fontSize: "var(--text-body-sm)", color: "var(--ink-2)" }}
              >
                Smart Fill targets a perfect score
              </p>
              <p
                className="mt-3"
                style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)", lineHeight: 1.5 }}
              >
                Up to 3 rounds, with diff transparency
              </p>
            </div>

            {/* Trial — plain numeral, no score */}
            <div
              className="p-6 flex flex-col items-center text-center"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--rule)",
                borderRadius: "var(--radius-card)",
                boxShadow: "var(--shadow-card-soft)",
              }}
            >
              <div className="inline-flex items-center justify-center w-[72px] h-[72px]">
                <Clock
                  className="h-9 w-9"
                  style={{ color: "var(--accent)" }}
                  aria-hidden="true"
                />
              </div>
              <p
                className="mt-4 font-semibold"
                style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
              >
                21 days free
              </p>
              <p
                className="mt-1"
                style={{ fontSize: "var(--text-body-sm)", color: "var(--ink-2)" }}
              >
                No credit card required
              </p>
              <p
                className="mt-3"
                style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)", lineHeight: 1.5 }}
              >
                Cancel anytime — keep what you draft
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust signals — quiet row. */}
      <section
        style={{
          paddingTop: "var(--section-py-tight)",
          paddingBottom: "var(--section-py-tight)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div
            className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap"
            style={{ fontSize: "var(--text-body-sm)", color: "var(--ink-2)" }}
          >
            {[
              { icon: CheckCircle, text: "Cancel anytime", color: "var(--success)" },
              { icon: CheckCircle, text: "21-day free trial", color: "var(--success)" },
              { icon: Shield, text: "Secure via Stripe", color: "var(--success)" },
              { icon: Award, text: "Success fee — we earn when you win", color: "var(--warn)" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <item.icon className="h-4 w-4" style={{ color: item.color }} aria-hidden="true" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — quiet on white, accordion preserved. */}
      <section
        style={{
          paddingTop: "var(--section-py-tight)",
          paddingBottom: "var(--section-py)",
        }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2
            className="font-semibold tracking-tight text-center mb-10"
            style={{ fontSize: "var(--text-title)", color: "var(--ink)" }}
          >
            Frequently asked questions
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="overflow-hidden"
                style={{
                  border: "1px solid var(--rule)",
                  background: "var(--surface)",
                  borderRadius: "var(--radius-control)",
                }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left transition-colors"
                  style={{ background: "transparent" }}
                  aria-expanded={expandedFaq === i}
                >
                  <span
                    className="font-medium pr-4"
                    style={{ fontSize: "var(--text-body)", color: "var(--ink)" }}
                  >
                    {faq.q}
                  </span>
                  <ChevronDown
                    className="h-4 w-4 flex-shrink-0 transition-transform"
                    style={{
                      color: "var(--ink-2)",
                      transform: expandedFaq === i ? "rotate(180deg)" : "none",
                    }}
                    aria-hidden="true"
                  />
                </button>
                {expandedFaq === i && (
                  <div className="px-5 pb-5 -mt-1">
                    <p
                      style={{
                        fontSize: "var(--text-body-sm)",
                        color: "var(--ink-2)",
                        lineHeight: 1.65,
                      }}
                    >
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA peak — landing's CtaBanner. */}
      <CtaBanner ctaHref="/signup" ctaLabel="Get started free" />

      {/* Success Fee Disclosure Modal — preserved logic, restyled to marine. */}
      <Dialog
        open={!!pendingPlan}
        onOpenChange={(open) => !open && setPendingPlan(null)}
        title={pendingPlan ? `Confirm your ${pendingPlan.name} subscription` : ""}
        description="Before we send you to Stripe, here's exactly what you're agreeing to:"
        size="sm"
      >
        {pendingPlan && (
          <>
            <dl className="space-y-3 mb-6">
              <div
                className="flex justify-between p-3"
                style={{
                  background: "var(--bg-soft)",
                  borderRadius: "var(--radius-control)",
                }}
              >
                <dt style={{ color: "var(--ink-2)", fontSize: "var(--text-body-sm)" }}>
                  Subscription
                </dt>
                <dd
                  className="font-medium text-right"
                  style={{ color: "var(--ink)", fontSize: "var(--text-body-sm)" }}
                >
                  ${billingInterval === "monthly" ? pendingPlan.price : Math.round(pendingPlan.priceAnnual / 12)}/month
                  {billingInterval === "annual" && (
                    <span
                      className="ml-1"
                      style={{ color: "var(--ink-2)", fontSize: "var(--text-caption)" }}
                    >
                      (billed ${pendingPlan.priceAnnual}/yr)
                    </span>
                  )}
                </dd>
              </div>
              {pendingPlan.successFee && (
                <div
                  className="flex justify-between p-3"
                  style={{
                    background: "var(--warn-soft)",
                    border: "1px solid var(--warn)",
                    borderRadius: "var(--radius-control)",
                  }}
                >
                  <dt style={{ color: "var(--warn)", fontSize: "var(--text-body-sm)" }}>
                    Success fee
                  </dt>
                  <dd
                    className="text-right font-medium"
                    style={{ color: "var(--warn)", fontSize: "var(--text-body-sm)" }}
                  >
                    {pendingPlan.successFee}
                    <div className="mt-0.5" style={{ fontSize: "var(--text-caption)", opacity: 0.85 }}>
                      Charged only after a grant is awarded
                    </div>
                  </dd>
                </div>
              )}
              <div
                className="flex justify-between p-3"
                style={{
                  background: "var(--success-soft)",
                  border: "1px solid var(--success)",
                  borderRadius: "var(--radius-control)",
                }}
              >
                <dt style={{ color: "var(--success)", fontSize: "var(--text-body-sm)" }}>
                  Trial &amp; cancellation
                </dt>
                <dd
                  className="text-right font-medium"
                  style={{ color: "var(--success)", fontSize: "var(--text-body-sm)" }}
                >
                  21-day trial
                  <div className="mt-0.5" style={{ fontSize: "var(--text-caption)", opacity: 0.85 }}>
                    Cancel anytime, prorated refund
                  </div>
                </dd>
              </div>
            </dl>

            <p
              className="mb-5"
              style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)", lineHeight: 1.6 }}
            >
              No setup fees. No cancellation fees. No per-application charges. Payments are
              securely processed by Stripe — your card details never touch GrantPilot servers.
            </p>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1"
                style={{
                  background: "var(--surface)",
                  color: "var(--ink)",
                  border: "1px solid var(--rule)",
                  borderRadius: "var(--radius-control)",
                }}
                onClick={() => setPendingPlan(null)}
                disabled={loading !== null}
              >
                Cancel
              </Button>
              <Button
                size="lg"
                className="flex-1 !text-white"
                style={{
                  background: "var(--accent)",
                  borderColor: "var(--accent)",
                  borderRadius: "var(--radius-control)",
                }}
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
          </>
        )}
      </Dialog>
    </main>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--accent)" }} />
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
