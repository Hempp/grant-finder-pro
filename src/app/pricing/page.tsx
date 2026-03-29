"use client";

import { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Check,
  X,
  Sparkles,
  Zap,
  Users,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  Gift,
  Shield,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, Button, Badge } from "@/components/ui";
import { useSubscription } from "@/hooks/useSubscription";

const plans = [
  {
    id: "free",
    name: "Starter",
    description: "Get started with grant discovery",
    price: 0,
    priceAnnual: 0,
    successFee: null as string | null,
    features: [
      { text: "5 grant matches per month", included: true },
      { text: "Manual apply only", included: true },
      { text: "Save up to 10 grants", included: true },
      { text: "Weekly email digest", included: true },
      { text: "Basic Grant Readiness Score", included: true },
      { text: "Smart Fill (AI auto-apply)", included: false },
      { text: "Content Library", included: false },
    ],
    cta: "Get Started Free",
    popular: false,
    icon: Sparkles,
    iconColor: "text-slate-400",
  },
  {
    id: "growth",
    name: "Growth",
    description: "For growing organizations",
    price: 29,
    priceAnnual: 228,
    successFee: "5% on grants $10K+",
    features: [
      { text: "25 grant matches per month", included: true },
      { text: "5 Smart Fills per month", included: true },
      { text: "Content Library (50 blocks)", included: true },
      { text: "Website import", included: true },
      { text: "Daily email alerts", included: true },
      { text: "Full Grant Readiness Score", included: true },
      { text: "No fee on grants under $10K", included: true },
    ],
    cta: "Start Growing",
    popular: false,
    icon: Zap,
    iconColor: "text-emerald-400",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For serious grant seekers",
    price: 79,
    priceAnnual: 708,
    successFee: "3% on grants won",
    features: [
      { text: "Unlimited grant matches", included: true },
      { text: "25 Smart Fills per month", included: true },
      { text: "Unlimited Content Library", included: true },
      { text: "Auto-optimize to 100/100", included: true },
      { text: "Scoring + diff transparency", included: true },
      { text: "Grant Guarantee: win or 3 months free", included: true },
      { text: "Up to 3 team members", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Go Pro",
    popular: true,
    icon: Shield,
    iconColor: "text-amber-400",
  },
  {
    id: "organization",
    name: "Organization",
    description: "For teams and consultants",
    price: 249,
    priceAnnual: 2388,
    successFee: "2% on grants won",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "100 Smart Fills per month", included: true },
      { text: "Up to 10 team members", included: true },
      { text: "Lowest success fee (2%)", included: true },
      { text: "Smart Budget Builder", included: true },
      { text: "Competitive Intelligence", included: true },
      { text: "Custom AI tone & templates", included: true },
      { text: "Dedicated success manager", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
    icon: Building2,
    iconColor: "text-cyan-400",
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

  const canceled = searchParams.get("canceled");

  const handleStartTrial = async () => {
    if (!session) {
      router.push("/login?redirect=/pricing");
      return;
    }

    setLoading("trial");
    const result = await startTrial();
    setLoading(null);

    if (result.success) {
      setTrialStarted(true);
      setTimeout(() => {
        router.push("/dashboard?trial=started");
      }, 2000);
    } else {
      alert(result.error || "Failed to start trial");
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!session) {
      router.push("/login?redirect=/pricing");
      return;
    }

    if (planId === "free") return;

    setLoading(planId);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, interval: billingInterval }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-slate-900" />
            </div>
            <span className="font-bold text-white text-lg">GrantPilot</span>
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link href="/signup">
                  <Button>Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Canceled Banner */}
        {canceled && (
          <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400" />
            <p className="text-amber-400">
              Checkout was canceled. No charges were made.
            </p>
          </div>
        )}

        {/* Trial Started Banner */}
        {trialStarted && (
          <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <p className="text-emerald-400">
              Your 21-day Pro trial has started! Redirecting to dashboard...
            </p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="info" className="mb-4">
            <Zap className="h-3 w-3 mr-1" />
            Simple, transparent pricing
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            Find grants faster,{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-transparent bg-clip-text">
              win more funding
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
            All paid plans include a 21-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setBillingInterval("monthly")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                billingInterval === "monthly"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("annual")}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                billingInterval === "annual"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Annual
              <Badge variant="success" className="text-xs">
                Save up to 21%
              </Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular
                  ? "border-emerald-500/50 bg-gradient-to-b from-emerald-500/10 to-transparent"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="success">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <plan.icon className={`h-5 w-5 ${plan.iconColor}`} />
                </div>
                <p className="text-slate-400 text-sm">{plan.description}</p>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-6">
                  {billingInterval === "monthly" ? (
                    <>
                      <span className="text-4xl font-bold text-white">${plan.price}</span>
                      <span className="text-slate-400">/month</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-white">
                        ${plan.priceAnnual > 0 ? Math.round(plan.priceAnnual / 12) : 0}
                      </span>
                      <span className="text-slate-400">/month</span>
                      {plan.priceAnnual > 0 && (
                        <p className="text-sm text-emerald-400 mt-1">
                          ${plan.priceAnnual}/year
                        </p>
                      )}
                    </>
                  )}
                  {plan.successFee && (
                    <p className="text-xs text-amber-400/80 mt-2 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-amber-400" />
                      + {plan.successFee}
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />
                      )}
                      <span
                        className={
                          feature.included ? "text-slate-300" : "text-slate-500"
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Show trial button for Pro plan if eligible */}
                {plan.id === "pro" && canStartTrial && !isOnTrial ? (
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      variant="primary"
                      disabled={loading !== null}
                      onClick={handleStartTrial}
                    >
                      {loading === "trial" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Gift className="h-4 w-4 mr-2" />
                          Start 21-Day Free Trial
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-slate-400 text-center">
                      No credit card required
                    </p>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.popular ? "primary" : "secondary"}
                    disabled={plan.id === "free" || loading !== null || (plan.id === subscription?.plan)}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {loading === plan.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : plan.id === "free" ? (
                      session ? (
                        subscription?.plan === "free" ? "Current Plan" : "Downgrade"
                      ) : (
                        <>
                          Get Started Free
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )
                    ) : plan.id === subscription?.plan ? (
                      isOnTrial ? "Trial Active" : "Current Plan"
                    ) : (
                      <>
                        {plan.cta}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Signals */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap text-slate-400 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              Cancel anytime
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              No hidden fees
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              Secure payment via Stripe
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-400" />
              Grant Guarantee on Pro+
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 sm:mt-20 max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-6 sm:mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-white font-medium mb-2">
                  What is the Grant Guarantee?
                </h3>
                <p className="text-slate-400">
                  Pro and Organization plans include our Grant Guarantee: if you don&apos;t
                  win a grant within 12 months of subscribing (after submitting at least
                  10 applications using Smart Fill), we&apos;ll extend your subscription
                  3 months free. We only succeed when you succeed.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-white font-medium mb-2 text-sm sm:text-base">
                  What is AI Application Intelligence?
                </h3>
                <p className="text-slate-400">
                  Our AI reads the grant RFP, extracts every requirement and scoring criterion,
                  then drafts your application section-by-section using your organization&apos;s
                  data. You see a predicted score before you submit, with specific recommendations
                  to strengthen weak areas.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-white font-medium mb-2 text-sm sm:text-base">
                  What happens when I hit my monthly limit?
                </h3>
                <p className="text-slate-400">
                  You can upgrade to a higher plan anytime to unlock more features.
                  Your usage resets at the start of each billing cycle.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-white font-medium mb-2 text-sm sm:text-base">
                  Can I change plans later?
                </h3>
                <p className="text-slate-400">
                  Yes! You can upgrade or downgrade at any time. Changes take effect
                  immediately, and we&apos;ll prorate your billing.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-white font-medium mb-2 text-sm sm:text-base">
                  How does the success fee work?
                </h3>
                <p className="text-slate-400">
                  When you win a grant using GrantPilot, a small success fee applies based
                  on your plan (2-5%). The fee is automatically invoiced only when you report
                  a win. Starter plans have no success fee. Growth plans have no fee on
                  grants under $10K. This aligns our incentives — we only earn when you win.
                  Compared to grant consultants who charge $5K-$15K per application, our
                  success fee is a fraction of the cost.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-white font-medium mb-2 text-sm sm:text-base">
                  What is Smart Fill?
                </h3>
                <p className="text-slate-400">
                  Smart Fill is our AI engine that generates complete grant applications scored
                  to 100/100. It reads the grant&apos;s scoring criteria, pulls from your Content
                  Library (company data, team bios, impact metrics), and auto-optimizes each
                  section up to 3 rounds until every criterion is addressed. You see exactly
                  what the AI changed and why, tied to the scoring rubric.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} GrantPilot. All rights reserved.</p>
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
