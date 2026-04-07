"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle,
  SkipForward,
  RefreshCw,
  Send,
  ArrowRight,
  Loader2,
  Sparkles,
  FileText,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";

// ── Types ──────────────────────────────────────────────────────────────────

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  amountMax: number | null;
  amountMin: number | null;
  amount: string | null;
  deadline: string | null;
  essayPrompt: string | null;
  essayWordLimit: number | null;
  submissionMethod: string;
}

interface Application {
  id: string;
  scholarshipId: string;
  scholarship: Scholarship;
  status: string;
  essayDraft: string | null;
  essayFinal: string | null;
  submissionMethod: string | null;
  successFeePercent: number;
}

type Decision = "approved" | "skipped";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

function formatScholarshipAmount(s: Scholarship): string {
  if (s.amountMax) return formatCurrency(s.amountMax);
  if (s.amountMin) return formatCurrency(s.amountMin);
  if (s.amount) return s.amount;
  return "Varies";
}

function formatDeadline(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getSubmissionBadge(method: string | null) {
  switch (method) {
    case "auto":
      return {
        label: "Auto-submit",
        icon: "checkmark",
        classes:
          "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      };
    case "paste":
      return {
        label: "Paste-ready",
        icon: "clipboard",
        classes: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      };
    default:
      return {
        label: "Manual",
        icon: "manual",
        classes: "bg-slate-500/10 text-slate-400 border-slate-500/20",
      };
  }
}

// ── Loading Skeleton ──────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto w-full">
      <Skeleton width={280} height={32} />
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton width={300} height={24} />
          <Skeleton width={100} height={28} />
        </div>
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={16} />
        <div className="space-y-2">
          <Skeleton width={120} height={14} />
          <Skeleton lines={3} />
        </div>
        <div className="space-y-2">
          <Skeleton width={100} height={14} />
          <Skeleton width="100%" height={200} />
        </div>
        <div className="flex gap-3">
          <Skeleton width={120} height={44} />
          <Skeleton width={100} height={44} />
          <Skeleton width={110} height={44} />
        </div>
      </div>
      <Skeleton width="100%" height={8} />
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function BatchApplyQueuePage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [decisions, setDecisions] = useState<Map<string, Decision>>(new Map());
  const [editedEssays, setEditedEssays] = useState<Map<string, string>>(
    new Map()
  );
  const [redrafting, setRedrafting] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitTotal, setSubmitTotal] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [hasPaymentMethod, setHasPaymentMethod] = useState<boolean | null>(null);
  const [needsPaymentMethod, setNeedsPaymentMethod] = useState(false);
  const [addingPaymentMethod, setAddingPaymentMethod] = useState(false);
  const [paymentMethodAdded, setPaymentMethodAdded] = useState(false);

  // Fetch draft applications + payment method status
  useEffect(() => {
    async function fetchDrafts() {
      try {
        const res = await fetch("/api/student/applications?status=draft");
        if (!res.ok) return;
        const data: Application[] = await res.json();
        // Only show applications that have an essay draft
        const withEssays = data.filter((a) => a.essayDraft);
        setApplications(withEssays);

        // Check payment method
        const pmRes = await fetch("/api/student/payment-method");
        const pmData = await pmRes.json();
        setHasPaymentMethod(pmData.hasPaymentMethod);
        // Check if user needs payment method (free tier with fee > 0)
        const needsPM = withEssays.some((a) => a.successFeePercent > 0) && !pmData.hasPaymentMethod;
        setNeedsPaymentMethod(needsPM);
      } catch (err) {
        console.error("Failed to fetch draft applications:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDrafts();
  }, []);

  // Current application
  const currentApp = applications[currentIndex] ?? null;
  const totalApps = applications.length;
  const reviewedCount = decisions.size;
  const allReviewed = reviewedCount === totalApps && totalApps > 0;

  // Get the current essay text (edited or original draft)
  const getCurrentEssay = useCallback(
    (app: Application) => {
      return editedEssays.get(app.id) ?? app.essayDraft ?? "";
    },
    [editedEssays]
  );

  // Decisions
  const approvedApps = applications.filter(
    (a) => decisions.get(a.id) === "approved"
  );
  const skippedCount = applications.filter(
    (a) => decisions.get(a.id) === "skipped"
  ).length;

  // ── Actions ──────────────────────────────────────────────────────────────

  function handleDecision(decision: Decision) {
    if (!currentApp) return;
    setDecisions((prev) => {
      const next = new Map(prev);
      next.set(currentApp.id, decision);
      return next;
    });
    // Advance to next unreviewed, or go to summary
    advanceToNext();
  }

  function advanceToNext() {
    // Find next unreviewed application
    for (let i = currentIndex + 1; i < totalApps; i++) {
      if (!decisions.has(applications[i].id)) {
        setCurrentIndex(i);
        return;
      }
    }
    // Wrap around from start
    for (let i = 0; i < currentIndex; i++) {
      if (!decisions.has(applications[i].id)) {
        setCurrentIndex(i);
        return;
      }
    }
    // All reviewed - stay at current index (summary will show)
    setCurrentIndex(currentIndex);
  }

  async function handleRedraft(app: Application) {
    setRedrafting(app.id);
    try {
      // Reset to draft status
      await fetch(`/api/student/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "draft" }),
      });

      // Call batch endpoint to regenerate essay for this scholarship
      const batchRes = await fetch("/api/student/applications/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scholarshipIds: [app.scholarshipId] }),
      });

      if (batchRes.ok) {
        const batchData = await batchRes.json();
        const updated = batchData.applications?.[0];
        if (updated?.essayDraft) {
          // Update the application in state with the new essay
          setApplications((prev) =>
            prev.map((a) =>
              a.id === app.id ? { ...a, essayDraft: updated.essayDraft } : a
            )
          );
          // Clear any local edits for this app
          setEditedEssays((prev) => {
            const next = new Map(prev);
            next.delete(app.id);
            return next;
          });
        }
      }
    } catch (err) {
      console.error("Failed to redraft:", err);
    } finally {
      setRedrafting(null);
    }
  }

  function handleEssayEdit(appId: string, text: string) {
    setEditedEssays((prev) => {
      const next = new Map(prev);
      next.set(appId, text);
      return next;
    });
  }

  async function handleAddPaymentMethod() {
    setAddingPaymentMethod(true);
    try {
      const res = await fetch("/api/student/payment-method", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setHasPaymentMethod(true);
        setNeedsPaymentMethod(false);
        setPaymentMethodAdded(true);
      }
    } catch (err) {
      console.error("Failed to add payment method:", err);
    } finally {
      setAddingPaymentMethod(false);
    }
  }

  async function handleSubmitAll() {
    const toSubmit = approvedApps;
    if (toSubmit.length === 0) return;

    setSubmitting(true);
    setSubmitProgress(0);
    setSubmitTotal(toSubmit.length);

    let successCount = 0;

    for (let i = 0; i < toSubmit.length; i++) {
      const app = toSubmit[i];
      setSubmitProgress(i + 1);
      try {
        const essayText = getCurrentEssay(app);
        await fetch(`/api/student/applications/${app.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "submitted",
            essayFinal: essayText,
          }),
        });
        successCount++;
      } catch (err) {
        console.error(`Failed to submit application ${app.id}:`, err);
      }
    }

    setSubmitCount(successCount);
    setSubmitting(false);
    setSubmitted(true);
  }

  // ── Render: Loading ─────────────────────────────────────────────────────

  if (loading) {
    return <LoadingSkeleton />;
  }

  // ── Render: Empty State ─────────────────────────────────────────────────

  if (totalApps === 0) {
    return (
      <div className="p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="bg-slate-800/50 w-20 h-20 rounded-2xl flex items-center justify-center mb-6">
          <FileText className="h-10 w-10 text-slate-600" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          No applications ready for review
        </h2>
        <p className="text-slate-400 text-sm mb-6 text-center max-w-md">
          Draft applications with AI-generated essays will appear here for you
          to review, edit, and submit.
        </p>
        <Link href="/student/scholarships">
          <Button variant="primary">
            <Sparkles className="h-4 w-4 mr-2" />
            Find Scholarships
          </Button>
        </Link>
      </div>
    );
  }

  // ── Render: Payment Method Gate ─────────────────────────────────────────

  if (needsPaymentMethod && !hasPaymentMethod) {
    return (
      <div className="p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 max-w-md w-full space-y-6">
          {/* Icon + Title */}
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-3 rounded-xl">
              <CreditCard className="h-6 w-6 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Add a Payment Method to Continue
            </h2>
          </div>

          {/* Explanation */}
          <p className="text-slate-400 text-sm leading-relaxed">
            You won&apos;t be charged until you win a scholarship. We keep your
            card on file to collect the{" "}
            <span className="text-white font-medium">8% success fee</span> on
            awards.
          </p>

          {/* Success message after adding */}
          {paymentMethodAdded && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <p className="text-emerald-400 text-sm">
                Card setup initiated — your payment method will be confirmed
                shortly.
              </p>
            </div>
          )}

          {/* Primary CTA */}
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleAddPaymentMethod}
            isLoading={addingPaymentMethod}
            loadingText="Setting up..."
            disabled={addingPaymentMethod || paymentMethodAdded}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-slate-500 text-xs uppercase tracking-wide">or</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          {/* Upgrade CTA */}
          <div className="text-center space-y-2">
            <p className="text-slate-400 text-sm">
              Upgrade to Pro ($9.99/mo) for{" "}
              <span className="text-white font-medium">0% fees</span>
            </p>
            <Link href="/student/upgrade">
              <Button variant="outline" className="w-full">
                Upgrade to Pro
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Submitted Celebration ────────────────────────────────────────

  if (submitted) {
    return (
      <div className="p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-6xl mb-6">&#127881;</div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {submitCount} application{submitCount !== 1 ? "s" : ""} submitted!
        </h2>
        <p className="text-slate-400 text-sm mb-8 text-center max-w-md">
          Your applications are on their way. You can track their status from
          your applications page.
        </p>
        <Link href="/student/applications">
          <Button variant="primary">
            <ArrowRight className="h-4 w-4 mr-2" />
            View My Applications
          </Button>
        </Link>
      </div>
    );
  }

  // ── Render: Submitting Progress ──────────────────────────────────────────

  if (submitting) {
    return (
      <div className="p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <Loader2 className="h-12 w-12 text-emerald-400 animate-spin mb-6" />
        <h2 className="text-xl font-bold text-white mb-2">
          Submitting applications...
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Submitting {submitProgress} of {submitTotal}...
        </p>
        <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
            style={{
              width: `${(submitProgress / submitTotal) * 100}%`,
            }}
          />
        </div>
      </div>
    );
  }

  // ── Render: Summary (All Reviewed) ───────────────────────────────────────

  if (allReviewed) {
    return (
      <div className="p-6 lg:p-8 flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <CheckCircle className="h-7 w-7 text-emerald-400" />
          Review Complete
        </h1>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">
                {approvedApps.length}
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">
                Approved
              </div>
            </div>
            <div className="w-px h-12 bg-slate-700" />
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-500">
                {skippedCount}
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">
                Skipped
              </div>
            </div>
          </div>

          {approvedApps.length > 0 && (
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                Ready to Submit
              </h3>
              {approvedApps.map((app) => {
                const badge = getSubmissionBadge(
                  app.submissionMethod ??
                    app.scholarship.submissionMethod
                );
                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate text-sm">
                        {app.scholarship.title}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {app.scholarship.provider}
                        {" -- "}
                        {formatScholarshipAmount(app.scholarship)}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-lg border ${badge.classes}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-3">
            {approvedApps.length > 0 && (
              <Button variant="primary" size="lg" onClick={handleSubmitAll}>
                <Send className="h-4 w-4 mr-2" />
                Submit All Approved ({approvedApps.length})
              </Button>
            )}
            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                setDecisions(new Map());
                setCurrentIndex(0);
              }}
            >
              Start Over
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Review Queue ─────────────────────────────────────────────────

  const essay = currentApp ? getCurrentEssay(currentApp) : "";
  const wordCount = countWords(essay);
  const wordLimit = currentApp?.scholarship.essayWordLimit ?? 500;
  const overLimit = wordCount > wordLimit;
  const deadline = currentApp
    ? formatDeadline(currentApp.scholarship.deadline)
    : null;
  const submissionBadge = currentApp
    ? getSubmissionBadge(
        currentApp.submissionMethod ??
          currentApp.scholarship.submissionMethod
      )
    : null;
  const isRedrafting = redrafting === currentApp?.id;

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto w-full">
      {/* Header */}
      <h1 className="text-2xl font-bold text-white flex items-center gap-3">
        <FileText className="h-7 w-7 text-emerald-400" />
        Review &amp; Submit
        <span className="text-slate-400 text-lg font-normal">
          ({totalApps} application{totalApps !== 1 ? "s" : ""})
        </span>
      </h1>

      {/* Application Card */}
      {currentApp && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-5">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white leading-tight">
                {currentApp.scholarship.title}
              </h2>
              <p className="text-emerald-400 font-semibold mt-1">
                {formatScholarshipAmount(currentApp.scholarship)}
              </p>
            </div>
            {submissionBadge && (
              <span
                className={`text-xs px-3 py-1.5 rounded-lg border whitespace-nowrap ${submissionBadge.classes}`}
              >
                {submissionBadge.label}
              </span>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <span>{currentApp.scholarship.provider}</span>
            {deadline && (
              <span className="flex items-center gap-1">
                Due: {deadline}
              </span>
            )}
          </div>

          {/* Essay Prompt */}
          {currentApp.scholarship.essayPrompt && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Essay Prompt
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/30 rounded-xl p-4 border border-slate-700/50 italic">
                &ldquo;{currentApp.scholarship.essayPrompt}&rdquo;
              </p>
            </div>
          )}

          {/* AI Draft Editor */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              AI Draft
            </h3>
            <textarea
              value={essay}
              onChange={(e) =>
                handleEssayEdit(currentApp.id, e.target.value)
              }
              disabled={isRedrafting}
              rows={12}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-300 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors disabled:opacity-50"
              placeholder="Essay draft will appear here..."
            />
            <div className="flex justify-end mt-1">
              <span
                className={`text-xs ${
                  overLimit ? "text-red-400 font-semibold" : "text-slate-500"
                }`}
              >
                {wordCount}/{wordLimit} words
                {overLimit && " (over limit)"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              variant="primary"
              onClick={() => handleDecision("approved")}
              disabled={isRedrafting}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleDecision("skipped")}
              disabled={isRedrafting}
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Skip
            </Button>
            <Button
              variant="outline"
              onClick={() => handleRedraft(currentApp)}
              isLoading={isRedrafting}
              loadingText="Redrafting..."
              disabled={isRedrafting}
              className="border-blue-500 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Redraft
            </Button>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Progress</span>
          <span>
            {reviewedCount}/{totalApps}
          </span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
            style={{
              width: `${
                totalApps > 0 ? (reviewedCount / totalApps) * 100 : 0
              }%`,
            }}
          />
        </div>
      </div>

      {/* Submit All Approved (shortcut when some are approved) */}
      {approvedApps.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Jump to summary by marking remaining as skipped
              applications.forEach((a) => {
                if (!decisions.has(a.id)) {
                  setDecisions((prev) => {
                    const next = new Map(prev);
                    next.set(a.id, "skipped");
                    return next;
                  });
                }
              });
            }}
            className="text-emerald-400 hover:text-emerald-300"
          >
            <Send className="h-4 w-4 mr-1" />
            Skip remaining &amp; review approved ({approvedApps.length})
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
