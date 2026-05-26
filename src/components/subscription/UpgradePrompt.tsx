"use client";

import Link from "next/link";
import { Zap, Lock, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { useSubscription } from "@/hooks/useSubscription";

interface UpgradePromptProps {
  feature: string;
  description?: string;
  variant?: "card" | "inline" | "banner";
  showWhenTrial?: boolean;
}

export function UpgradePrompt({
  feature,
  description,
  variant = "card",
  showWhenTrial = false,
}: UpgradePromptProps) {
  const { isPro, isOnTrial, canStartTrial } = useSubscription();

  // Don't show if user has Pro (unless they're on trial and we want to show it)
  if (isPro && !isOnTrial) return null;
  if (isOnTrial && !showWhenTrial) return null;

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2" style={{ fontSize: "var(--text-body-sm)" }}>
        <Lock className="h-4 w-4" style={{ color: "var(--ink-2)" }} aria-hidden="true" />
        <span style={{ color: "var(--ink-2)" }}>{feature} requires Pro</span>
        <Link
          href="/pricing"
          className="font-medium flex items-center gap-1 hover:underline"
          style={{ color: "var(--accent)" }}
        >
          {canStartTrial ? "Start free trial" : "Upgrade"}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className="p-4"
        style={{
          background: "var(--accent-soft)",
          border: "1px solid var(--accent)",
          borderRadius: "var(--radius-card)",
        }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center"
              style={{ background: "var(--surface)", color: "var(--accent)" }}
            >
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p
                className="font-semibold"
                style={{ fontSize: "var(--text-body)", color: "var(--ink)" }}
              >
                {feature}
              </p>
              {description && (
                <p style={{ fontSize: "var(--text-body-sm)", color: "var(--ink-2)" }}>
                  {description}
                </p>
              )}
            </div>
          </div>
          <Link href="/pricing">
            <Button
              size="sm"
              className="!text-white"
              style={{
                background: "var(--accent)",
                borderColor: "var(--accent)",
                borderRadius: "var(--radius-control)",
              }}
            >
              <Zap className="h-4 w-4 mr-1" aria-hidden="true" />
              {canStartTrial ? "Start free trial" : "Upgrade to Pro"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Default: card variant
  return (
    <article
      className="text-center p-6"
      style={{
        background: "var(--accent-soft)",
        border: "1px solid var(--accent)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card-soft)",
      }}
    >
      <div
        className="h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ background: "var(--surface)", color: "var(--accent)" }}
      >
        <Zap className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3
        className="font-semibold mb-2"
        style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
      >
        Unlock {feature}
      </h3>
      <p
        className="mb-4"
        style={{ fontSize: "var(--text-body-sm)", color: "var(--ink-2)", lineHeight: 1.6 }}
      >
        {description || `Upgrade to Pro to access ${feature.toLowerCase()} and more powerful features.`}
      </p>
      <Link href="/pricing" className="block">
        <Button
          className="w-full !text-white"
          style={{
            background: "var(--accent)",
            borderColor: "var(--accent)",
            borderRadius: "var(--radius-control)",
          }}
        >
          {canStartTrial ? (
            <>
              <Sparkles className="h-4 w-4 mr-2" aria-hidden="true" />
              Start 21-day free trial
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" aria-hidden="true" />
              Upgrade to Pro
            </>
          )}
        </Button>
      </Link>
      {canStartTrial && (
        <p
          className="mt-2"
          style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
        >
          No credit card required
        </p>
      )}
    </article>
  );
}
