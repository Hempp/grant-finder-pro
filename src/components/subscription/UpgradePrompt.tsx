"use client";

import Link from "next/link";
import { Zap, Lock, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
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
      <div className="flex items-center gap-2 text-sm">
        <Lock className="h-4 w-4 text-slate-500" />
        <span className="text-slate-400">{feature} requires Pro</span>
        <Link
          href="/pricing"
          className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
        >
          {canStartTrial ? "Start free trial" : "Upgrade"}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className="bg-gradient-to-r from-purple-500/10 to-emerald-500/10 border border-purple-500/20 rounded-lg p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-white">{feature}</p>
              {description && (
                <p className="text-sm text-slate-400">{description}</p>
              )}
            </div>
          </div>
          <Link href="/pricing">
            <Button variant="primary" size="sm">
              <Zap className="h-4 w-4 mr-1" />
              {canStartTrial ? "Start Free Trial" : "Upgrade to Pro"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Default: card variant
  return (
    <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-emerald-500/5">
      <CardContent className="p-6 text-center">
        <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
          <Zap className="h-6 w-6 text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Unlock {feature}
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          {description || `Upgrade to Pro to access ${feature.toLowerCase()} and more powerful features.`}
        </p>
        <Link href="/pricing" className="block">
          <Button variant="primary" className="w-full">
            {canStartTrial ? (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Start 14-Day Free Trial
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </>
            )}
          </Button>
        </Link>
        {canStartTrial && (
          <p className="text-xs text-slate-500 mt-2">No credit card required</p>
        )}
      </CardContent>
    </Card>
  );
}
