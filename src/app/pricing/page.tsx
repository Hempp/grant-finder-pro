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
} from "lucide-react";
import { Card, CardContent, CardHeader, Button, Badge } from "@/components/ui";
import { useSubscription } from "@/hooks/useSubscription";

const plans = [
  {
    id: "free",
    name: "Free",
    description: "Get started with grant discovery",
    price: 0,
    priceAnnual: 0,
    features: [
      { text: "3 grant matches per month", included: true },
      { text: "Basic search filters", included: true },
      { text: "Save up to 5 grants", included: true },
      { text: "Email alerts (weekly)", included: true },
      { text: "Auto-Apply AI drafts", included: false },
      { text: "Advanced AI matching", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Current Plan",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For serious grant seekers",
    price: 49,
    priceAnnual: 490,
    features: [
      { text: "Unlimited grant matches", included: true },
      { text: "Advanced AI matching", included: true },
      { text: "5 Auto-Apply drafts per month", included: true },
      { text: "Unlimited saved grants", included: true },
      { text: "Daily email alerts", included: true },
      { text: "Priority support", included: true },
      { text: "Team collaboration", included: false },
    ],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    id: "teams",
    name: "Teams",
    description: "For organizations and consultants",
    price: 149,
    priceAnnual: 1490,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited Auto-Apply drafts", included: true },
      { text: "Team collaboration (up to 5)", included: true },
      { text: "Grant success analytics", included: true },
      { text: "Application pipeline tracking", included: true },
      { text: "Dedicated success manager", included: true },
      { text: "API access", included: true },
    ],
    cta: "Upgrade to Teams",
    popular: false,
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
      // Redirect to dashboard after short delay
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
            <span className="font-bold text-white text-lg">Grant Finder Pro</span>
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
              Your 14-day Pro trial has started! Redirecting to dashboard...
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
                Save 17%
              </Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
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
                  {plan.id === "pro" && <Zap className="h-5 w-5 text-emerald-400" />}
                  {plan.id === "teams" && <Users className="h-5 w-5 text-cyan-400" />}
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
                          ${plan.priceAnnual}/year (2 months free)
                        </p>
                      )}
                    </>
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
                          Start 14-Day Free Trial
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

        {/* FAQ / Trust Signals */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-8 flex-wrap text-slate-400 text-sm">
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
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-white font-medium mb-2">
                  What happens when I hit my monthly limit?
                </h3>
                <p className="text-slate-400">
                  You can upgrade to a higher plan anytime to unlock more features.
                  Your usage resets at the start of each billing cycle.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-white font-medium mb-2">
                  Can I change plans later?
                </h3>
                <p className="text-slate-400">
                  Yes! You can upgrade or downgrade at any time. Changes take effect
                  immediately, and we'll prorate your billing.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-white font-medium mb-2">
                  What is Auto-Apply?
                </h3>
                <p className="text-slate-400">
                  Auto-Apply uses AI to automatically draft grant applications based
                  on your organization profile and documents. It saves hours of
                  writing time and ensures professional, tailored responses.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Grant Finder Pro. All rights reserved.</p>
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
