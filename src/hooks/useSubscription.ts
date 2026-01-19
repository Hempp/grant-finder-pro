"use client";

import { useState, useEffect, useCallback } from "react";
import { PlanType, PLANS } from "@/lib/stripe";

interface TrialInfo {
  isActive: boolean;
  endsAt: string | null;
  daysRemaining: number;
  hasUsedTrial: boolean;
  canStartTrial: boolean;
}

interface SubscriptionData {
  plan: PlanType;
  planName: string;
  features: string[];
  limits: {
    matchesPerMonth: number;
    savedGrants: number;
    autoApplyPerMonth: number;
    documents: number;
  };
  usage: {
    matchesUsed: number;
    autoApplyUsed: number;
    matchesRemaining: number | "unlimited";
    autoApplyRemaining: number | "unlimited";
  };
  billingPeriodEnd: string | null;
  daysUntilReset: number;
  trial: TrialInfo;
  hasPaidSubscription: boolean;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stripe/subscription");
      if (!res.ok) {
        throw new Error("Failed to fetch subscription");
      }
      const data = await res.json();
      setSubscription(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching subscription:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      // Default to free plan on error
      setSubscription({
        plan: "free",
        planName: "Free",
        features: [...PLANS.free.features],
        limits: { ...PLANS.free.limits },
        usage: {
          matchesUsed: 0,
          autoApplyUsed: 0,
          matchesRemaining: PLANS.free.limits.matchesPerMonth,
          autoApplyRemaining: 0,
        },
        billingPeriodEnd: null,
        daysUntilReset: 30,
        trial: {
          isActive: false,
          endsAt: null,
          daysRemaining: 0,
          hasUsedTrial: false,
          canStartTrial: true,
        },
        hasPaidSubscription: false,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const canUseFeature = useCallback(
    (feature: "matches" | "autoApply" | "documents") => {
      if (!subscription) return false;

      const limits = subscription.limits;
      const usage = subscription.usage;

      switch (feature) {
        case "matches":
          return (
            limits.matchesPerMonth === -1 ||
            usage.matchesRemaining === "unlimited" ||
            (typeof usage.matchesRemaining === "number" && usage.matchesRemaining > 0)
          );
        case "autoApply":
          return (
            limits.autoApplyPerMonth === -1 ||
            usage.autoApplyRemaining === "unlimited" ||
            (typeof usage.autoApplyRemaining === "number" && usage.autoApplyRemaining > 0)
          );
        case "documents":
          return limits.documents === -1;
        default:
          return false;
      }
    },
    [subscription]
  );

  const isPro = subscription?.plan === "pro" || subscription?.plan === "teams";
  const isTeams = subscription?.plan === "teams";
  const isOnTrial = subscription?.trial?.isActive ?? false;
  const canStartTrial = subscription?.trial?.canStartTrial ?? false;

  const startTrial = useCallback(async () => {
    try {
      const res = await fetch("/api/stripe/trial", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start trial");
      }

      // Refetch subscription to get updated data
      await fetchSubscription();
      return { success: true, message: data.message };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start trial";
      return { success: false, error: message };
    }
  }, [fetchSubscription]);

  return {
    subscription,
    loading,
    error,
    refetch: fetchSubscription,
    canUseFeature,
    isPro,
    isTeams,
    // Trial
    isOnTrial,
    canStartTrial,
    trialDaysRemaining: subscription?.trial?.daysRemaining ?? 0,
    startTrial,
  };
}
