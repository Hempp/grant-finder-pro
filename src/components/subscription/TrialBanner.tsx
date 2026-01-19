"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Sparkles, Clock, Zap } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

export function TrialBanner() {
  const { isOnTrial, trialDaysRemaining, subscription } = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if not on trial, dismissed, or has paid subscription
  if (!isOnTrial || dismissed || subscription?.hasPaidSubscription) {
    return null;
  }

  const isUrgent = trialDaysRemaining <= 3;

  return (
    <div
      className={`relative px-4 py-3 ${
        isUrgent
          ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-amber-500/30"
          : "bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-b border-emerald-500/20"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isUrgent ? (
            <Clock className="h-5 w-5 text-amber-400 animate-pulse" />
          ) : (
            <Sparkles className="h-5 w-5 text-emerald-400" />
          )}
          <p className={`text-sm font-medium ${isUrgent ? "text-amber-200" : "text-slate-200"}`}>
            {isUrgent ? (
              <>
                <span className="font-bold">Trial ending soon!</span> Only{" "}
                <span className="text-amber-400 font-bold">{trialDaysRemaining} day{trialDaysRemaining !== 1 ? "s" : ""}</span>{" "}
                left of your Pro trial.
              </>
            ) : (
              <>
                You&apos;re on a <span className="text-emerald-400 font-semibold">Pro trial</span> -{" "}
                <span className="font-semibold">{trialDaysRemaining} days</span> remaining
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/pricing"
            className={`text-sm font-medium px-4 py-1.5 rounded-full transition flex items-center gap-2 ${
              isUrgent
                ? "bg-amber-500 hover:bg-amber-400 text-slate-900"
                : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
            }`}
          >
            <Zap className="h-4 w-4" />
            {isUrgent ? "Upgrade Now" : "Keep Pro Features"}
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-slate-200 transition"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
