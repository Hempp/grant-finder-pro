"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Sparkles,
  FileText,
  DollarSign,
  Users,
  Target,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  Edit3,
  Calendar,
  Building2,
  Clock,
  Trash2,
  Send,
  Wand2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui";
import { Button } from "@/components/ui";
import { Input, Textarea } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Dialog } from "@/components/ui/Dialog";
import { useSubscription } from "@/hooks/useSubscription";

// Fee schedule mirrors src/lib/stripe.ts SUBSCRIPTION_PLANS — kept in sync so
// the user sees the exact fee they'll be invoiced before they submit a win.
const FEE_SCHEDULE: Record<string, { percent: number; threshold: number }> = {
  free: { percent: 0, threshold: 0 },
  growth: { percent: 5, threshold: 10000 },
  pro: { percent: 3, threshold: 0 },
  organization: { percent: 2, threshold: 0 },
  student_pro: { percent: 3, threshold: 0 },
};

function previewFee(plan: string | undefined, awardDollars: number): {
  percent: number;
  feeAmount: number;
  net: number;
  applies: boolean;
} {
  const config = FEE_SCHEDULE[plan || "free"] ?? FEE_SCHEDULE.free;
  const applies = awardDollars > 0 && awardDollars >= config.threshold && config.percent > 0;
  const feeAmount = applies ? Math.round((awardDollars * config.percent) / 100) : 0;
  return { percent: config.percent, feeAmount, net: awardDollars - feeAmount, applies };
}

const steps = [
  { id: 1, name: "Project Summary", icon: FileText },
  { id: 2, name: "Technical Approach", icon: Target },
  { id: 3, name: "Team & Capabilities", icon: Users },
  { id: 4, name: "Budget", icon: DollarSign },
  { id: 5, name: "Review & Submit", icon: CheckCircle },
];

interface Application {
  id: string;
  grantId: string;
  status: string;
  responses?: string;
  narrative?: string;
  budget?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  outcomeReportedAt?: string | null;
  outcomeNotes?: string | null;
  feedbackReceived?: string | null;
  awardedAt?: string | null;
  rejectedAt?: string | null;
  awardAmount?: number | null;
  successFeePercent?: number | null;
  successFeeAmount?: number | null;
  successFeeStatus?: string | null;
  grant: {
    id: string;
    title: string;
    funder: string;
    amount: number;
    amountMin: number | null;
    amountMax: number | null;
    deadline: string;
    description: string;
    eligibility: string | null;
    requirements: string | null;
  };
}

interface FormData {
  projectTitle: string;
  projectSummary: string;
  problemStatement: string;
  proposedSolution: string;
  expectedOutcomes: string;
  technicalApproach: string;
  innovationDescription: string;
  methodology: string;
  milestones: string;
  teamDescription: string;
  relevantExperience: string;
  keyPersonnel: string;
  totalBudget: string;
  personnelCosts: string;
  equipmentCosts: string;
  otherCosts: string;
  budgetJustification: string;
}

const statusConfig: Record<string, { label: string; color: "default" | "success" | "warning" | "danger" | "info"; icon: React.ElementType }> = {
  draft: { label: "Draft", color: "default", icon: FileText },
  in_progress: { label: "In Progress", color: "warning", icon: AlertCircle },
  ready_for_review: { label: "Ready for Review", color: "info", icon: CheckCircle },
  submitted: { label: "Submitted", color: "success", icon: CheckCircle },
  pending: { label: "Pending Review", color: "info", icon: Clock },
  awarded: { label: "Awarded", color: "success", icon: CheckCircle },
  rejected: { label: "Rejected", color: "danger", icon: AlertCircle },
};

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [currentStep, setCurrentStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Outcome modal state
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const { subscription } = useSubscription();
  const [outcomeResult, setOutcomeResult] = useState<"awarded" | "rejected" | "no_response" | null>(null);
  const [outcomeNotes, setOutcomeNotes] = useState("");
  const [outcomeFeedback, setOutcomeFeedback] = useState("");
  const [outcomeAwardAmount, setOutcomeAwardAmount] = useState("");
  const [submittingOutcome, setSubmittingOutcome] = useState(false);

  // Celebration modal state
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    grantTitle: string;
    awardAmount: number;
    feePercent: number;
    feeAmount: number;
    feeStatus: string | null;
  } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    projectTitle: "",
    projectSummary: "",
    problemStatement: "",
    proposedSolution: "",
    expectedOutcomes: "",
    technicalApproach: "",
    innovationDescription: "",
    methodology: "",
    milestones: "",
    teamDescription: "",
    relevantExperience: "",
    keyPersonnel: "",
    totalBudget: "",
    personnelCosts: "",
    equipmentCosts: "",
    otherCosts: "",
    budgetJustification: "",
  });

  // Fetch application data
  useEffect(() => {
    async function fetchApplication() {
      try {
        const res = await fetch(`/api/applications/${params.id}`);
        if (!res.ok) {
          throw new Error("Application not found");
        }
        const data: Application = await res.json();
        setApplication(data);

        // Parse saved responses into form data
        if (data.responses) {
          try {
            const savedFormData = JSON.parse(data.responses);
            setFormData(savedFormData);
          } catch (e) {
            console.error("Failed to parse saved responses:", e);
          }
        }

        // If application is in progress, start in edit mode
        if (["draft", "in_progress"].includes(data.status)) {
          setMode("edit");
        }
      } catch (err) {
        console.error("Failed to fetch application:", err);
        setError("Application not found");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchApplication();
    }
  }, [params.id]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateWithAI = async (field: string) => {
    if (!application) return;
    setGenerating(true);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field,
          context: formData,
          grantInfo: {
            title: application.grant.title,
            funder: application.grant.funder,
            amount: application.grant.amountMax || application.grant.amount,
            description: application.grant.description,
            requirements: application.grant.requirements,
          },
        }),
      });

      const data = await res.json();
      if (data.content) {
        updateField(field, data.content);
      }
    } catch (err) {
      console.error("AI generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const saveApplication = async (newStatus?: string) => {
    if (!application) return false;
    setSaving(true);

    try {
      const narrative = `
# ${formData.projectTitle || "Untitled Project"}

## Project Summary
${formData.projectSummary}

## Problem Statement
${formData.problemStatement}

## Proposed Solution
${formData.proposedSolution}

## Expected Outcomes
${formData.expectedOutcomes}

## Technical Approach
${formData.technicalApproach}

## Innovation
${formData.innovationDescription}

## Methodology
${formData.methodology}

## Milestones
${formData.milestones}

## Team
${formData.teamDescription}

## Relevant Experience
${formData.relevantExperience}

## Key Personnel
${formData.keyPersonnel}
      `.trim();

      const budget = `
Personnel: $${formData.personnelCosts || 0}
Equipment: $${formData.equipmentCosts || 0}
Other: $${formData.otherCosts || 0}
Total: $${formData.totalBudget || 0}

Justification:
${formData.budgetJustification}
      `.trim();

      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: application.id,
          grantId: application.grantId,
          status: newStatus || application.status,
          narrative,
          budget,
          responses: JSON.stringify(formData),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save application");
      }

      const updated = await res.json();
      setApplication({ ...application, ...updated, status: newStatus || application.status });

      return true;
    } catch (err) {
      console.error("Failed to save application:", err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndContinue = async () => {
    const saved = await saveApplication("in_progress");
    if (saved && currentStep < 5) {
      nextStep();
    }
  };

  const handleMarkReadyForReview = async () => {
    const saved = await saveApplication("ready_for_review");
    if (saved) {
      router.push("/dashboard/applications");
    }
  };

  const [submitting, setSubmitting] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState<string | null>(null);

  const handleSubmitApplication = async () => {
    if (!application) return;
    // Save first, then submit
    const saved = await saveApplication("ready_for_review");
    if (!saved) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/applications/${application.id}/submit`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }
      const data = await res.json();
      setConfirmationNumber(data.confirmationNumber);
      setApplication({ ...application, ...data, status: "submitted", submittedAt: data.submittedAt });
      setMode("view");
    } catch (err) {
      console.error("Failed to submit application:", err);
      alert(err instanceof Error ? err.message : "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!application || !confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/applications/${application.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/dashboard/applications");
      }
    } catch (err) {
      console.error("Failed to delete application:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleOutcomeSubmit = async () => {
    if (!application || !outcomeResult) return;
    setSubmittingOutcome(true);

    try {
      const parsedAward = outcomeAwardAmount ? parseInt(outcomeAwardAmount.replace(/[^0-9]/g, ""), 10) : undefined;

      const res = await fetch(`/api/applications/${application.id}/outcome`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          result: outcomeResult,
          notes: outcomeNotes || undefined,
          feedback: outcomeFeedback || undefined,
          awardAmount: outcomeResult === "awarded" && parsedAward ? parsedAward : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to report outcome");
      }

      const data = await res.json();
      setApplication({ ...application, ...data.application });
      setShowOutcomeModal(false);
      setOutcomeResult(null);
      setOutcomeNotes("");
      setOutcomeFeedback("");
      setOutcomeAwardAmount("");

      // Show celebration modal if awarded
      if (outcomeResult === "awarded" && parsedAward) {
        const fee = data.fee;
        setCelebrationData({
          grantTitle: application.grant.title,
          awardAmount: parsedAward,
          feePercent: fee?.feePercent ?? 0,
          feeAmount: fee?.feeAmount ?? 0,
          feeStatus: fee ? fee.status : null,
        });
        setShowCelebration(true);
      }
    } catch (err) {
      console.error("Failed to submit outcome:", err);
    } finally {
      setSubmittingOutcome(false);
    }
  };

  const renderAIButton = (field: string) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => generateWithAI(field)}
      disabled={generating}
      className="text-emerald-400 hover:text-emerald-300"
    >
      {generating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Sparkles className="h-4 w-4 mr-1" />
          Generate with AI
        </>
      )}
    </Button>
  );

  const renderCopyButton = (text: string, field: string) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => copyToClipboard(text, field)}
      className="text-slate-400 hover:text-white"
    >
      {copied === field ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-4 sm:p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Application Not Found</h2>
            <p className="text-slate-400 mb-4">{error || "Unable to load application details."}</p>
            <Link href="/dashboard/applications">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Applications
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusConfig[application.status] || statusConfig.draft;
  const daysUntil = getDaysUntilDeadline(application.grant.deadline);
  const isEditable = ["draft", "in_progress", "ready_for_review"].includes(application.status);

  // View mode - show application summary
  if (mode === "view") {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/dashboard/applications"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{application.grant.title}</h1>
              <Badge variant={status.color}>
                <status.icon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 text-slate-400 text-sm sm:text-base flex-wrap">
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {application.grant.funder}
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">
                {formatCurrency(application.grant.amountMax || application.grant.amount)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Due {new Date(application.grant.deadline).toLocaleDateString()}
                {daysUntil > 0 && daysUntil <= 14 && (
                  <Badge variant="warning" className="ml-2">{daysUntil} days left</Badge>
                )}
              </span>
            </div>
          </div>

          <div className="flex gap-2 self-start">
            <Link href={`/dashboard/applications/${params.id}/draft`}>
              <Button variant="secondary">
                <Wand2 className="h-4 w-4 mr-2" />
                AI Draft
              </Button>
            </Link>
            {isEditable && (
              <Button onClick={() => setMode("edit")}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Application
              </Button>
            )}
          </div>
        </div>

        {/* Outcome Reporting Banner */}
        {application.status === "submitted" &&
          !application.outcomeReportedAt &&
          new Date(application.grant.deadline) < new Date() && (
            <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-amber-400 font-bold text-sm sm:text-base">
                    Have you heard back?
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">
                    The deadline has passed. Let us know the outcome to help improve recommendations for you and others.
                  </p>
                </div>
                <Button
                  onClick={() => setShowOutcomeModal(true)}
                  className="self-start sm:self-center flex-shrink-0"
                >
                  Report Outcome
                </Button>
              </div>
            </div>
          )}

        {/* Outcome Modal */}
        {showOutcomeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-800 p-4 sm:p-6 shadow-xl">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
                Report Outcome
              </h2>

              <p className="text-slate-400 text-xs sm:text-sm mb-4">
                What was the result of your application for &quot;{application.grant.title}&quot;?
              </p>

              {/* Result Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
                <button
                  onClick={() => setOutcomeResult("awarded")}
                  className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium border transition ${
                    outcomeResult === "awarded"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                      : "border-slate-600 text-slate-400 hover:border-emerald-500/50"
                  }`}
                >
                  Awarded
                </button>
                <button
                  onClick={() => setOutcomeResult("rejected")}
                  className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium border transition ${
                    outcomeResult === "rejected"
                      ? "bg-red-500/20 border-red-500 text-red-400"
                      : "border-slate-600 text-slate-400 hover:border-red-500/50"
                  }`}
                >
                  Rejected
                </button>
                <button
                  onClick={() => setOutcomeResult("no_response")}
                  className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium border transition ${
                    outcomeResult === "no_response"
                      ? "bg-slate-500/20 border-slate-400 text-slate-300"
                      : "border-slate-600 text-slate-400 hover:border-slate-400/50"
                  }`}
                >
                  No Response
                </button>
              </div>

              {/* Award amount (shown when "awarded" is selected) */}
              {outcomeResult === "awarded" && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Award Amount <span className="text-slate-500">(optional, enables fee calculation)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 pl-7 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      placeholder="50,000"
                      value={outcomeAwardAmount}
                      onChange={(e) => setOutcomeAwardAmount(e.target.value)}
                    />
                  </div>
                  {(() => {
                    const parsed = outcomeAwardAmount
                      ? parseInt(outcomeAwardAmount.replace(/[^0-9]/g, ""), 10) || 0
                      : 0;
                    if (parsed <= 0) return null;
                    const fee = previewFee(subscription?.plan, parsed);
                    if (!fee.applies) {
                      return (
                        <p className="mt-2 text-xs text-emerald-400">
                          ✓ No success fee applies on your plan for this award amount.
                        </p>
                      );
                    }
                    return (
                      <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs space-y-1">
                        <div className="flex justify-between text-slate-300">
                          <span>Award</span>
                          <span className="font-medium text-white">${parsed.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-amber-300">
                          <span>Success fee ({fee.percent}%)</span>
                          <span className="font-medium">−${fee.feeAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t border-amber-500/20 pt-1 mt-1 text-emerald-300">
                          <span>You net</span>
                          <span className="font-bold">${fee.net.toLocaleString()}</span>
                        </div>
                        <p className="text-amber-400/70 pt-1">
                          Invoice sent within 24 hours of submission. Refundable if the award is later reduced.
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Rejection / no-response acknowledgement — EMOTION-SAGE's
                  Sage voice. Validates the loss, reframes it as input,
                  points to the next action. Fires ONLY on rejection or
                  no-response so "awarded" keeps its own celebration flow. */}
              {(outcomeResult === "rejected" || outcomeResult === "no_response") && (
                <div className="mb-4 rounded-lg border border-slate-700 bg-slate-800/50 p-3 text-sm">
                  <p className="text-slate-200 font-medium mb-1">
                    {outcomeResult === "rejected" ? "Not this time." : "Still waiting."}
                  </p>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    That happens to strong applications too — it&apos;s part of the process,
                    not a verdict on your work. Save any feedback the funder shared below,
                    then we&apos;ll surface your next best matches.
                  </p>
                </div>
              )}

              {/* Notes */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Notes <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <textarea
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  rows={3}
                  placeholder={
                    outcomeResult === "rejected"
                      ? "What worked? What didn't? Anything you'd do differently next time?"
                      : outcomeResult === "no_response"
                      ? "When did you last hear from them? Any follow-up planned?"
                      : "Any notes about the outcome..."
                  }
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                />
              </div>

              {/* Feedback */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Feedback received <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <textarea
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  rows={3}
                  placeholder={
                    outcomeResult === "rejected"
                      ? "Paste reviewer comments or scoring notes here — we'll help you apply them next time."
                      : "Any feedback from the funder..."
                  }
                  value={outcomeFeedback}
                  onChange={(e) => setOutcomeFeedback(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowOutcomeModal(false);
                    setOutcomeResult(null);
                    setOutcomeNotes("");
                    setOutcomeFeedback("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleOutcomeSubmit}
                  disabled={!outcomeResult || submittingOutcome}
                >
                  {submittingOutcome ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {submittingOutcome ? "Submitting..." : "Submit Outcome"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Celebration Modal — Radix Dialog handles focus restoration so
            the user lands back on the "Report Outcome" button when they
            dismiss. Body content stays the same. */}
        <Dialog
          open={showCelebration && !!celebrationData}
          onOpenChange={(open) => !open && setShowCelebration(false)}
          title={celebrationData ? "🎉 Congratulations!" : ""}
          description={
            celebrationData
              ? `You were awarded the ${celebrationData.grantTitle} grant.`
              : undefined
          }
          size="sm"
        >
          {celebrationData && (
            <>
              {/* Award Amount — cash register roll on the dollar amount */}
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 mb-4 text-center">
                <p className="text-slate-400 text-xs mb-1">Award Amount</p>
                <p className="text-3xl font-bold text-emerald-400">
                  <span className="animate-cash-shake">$</span>
                  <span className="animate-cash-roll inline-block">
                    {celebrationData.awardAmount.toLocaleString("en-US")}
                  </span>
                </p>
              </div>

              {/* Fee breakdown */}
              {celebrationData.feeAmount > 0 ? (
                <div className="rounded-xl bg-slate-700/50 border border-slate-600 p-4 mb-5 text-left space-y-2">
                  <p className="text-slate-300 text-sm font-medium mb-2">GrantPilot Success Fee</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Fee ({celebrationData.feePercent}%)</span>
                    <span className="text-white font-medium">${celebrationData.feeAmount.toLocaleString("en-US")}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-slate-600 pt-2 mt-1">
                    <span className="text-slate-400">You net</span>
                    <span className="text-emerald-400 font-bold">
                      ${(celebrationData.awardAmount - celebrationData.feeAmount).toLocaleString("en-US")}
                    </span>
                  </div>

                  {celebrationData.feeStatus === "charged" ? (
                    <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      Fee paid automatically — thank you!
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      Fee pending —{" "}
                      <Link href="/dashboard/settings" className="underline hover:text-amber-300">
                        add a payment method
                      </Link>{" "}
                      to settle.
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl bg-slate-700/50 border border-slate-600 p-4 mb-5 text-sm text-slate-400">
                  No success fee on your current plan for this grant.
                </div>
              )}

              <Button
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400"
                onClick={() => setShowCelebration(false)}
              >
                Awesome, let&apos;s keep going!
              </Button>
            </>
          )}
        </Dialog>

        {/* Application Details */}
        <div className="space-y-6">
          {/* Project Summary */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-400" />
                Project Summary
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.projectTitle && (
                  <div>
                    <h3 className="text-white font-medium mb-1">Project Title</h3>
                    <p className="text-slate-400">{formData.projectTitle}</p>
                  </div>
                )}
                {formData.projectSummary && (
                  <div>
                    <h3 className="text-white font-medium mb-1">Summary</h3>
                    <p className="text-slate-400 whitespace-pre-wrap">{formData.projectSummary}</p>
                  </div>
                )}
                {formData.problemStatement && (
                  <div>
                    <h3 className="text-white font-medium mb-1">Problem Statement</h3>
                    <p className="text-slate-400 whitespace-pre-wrap">{formData.problemStatement}</p>
                  </div>
                )}
                {!formData.projectTitle && !formData.projectSummary && !formData.problemStatement && (
                  <p className="text-slate-500 italic">No project summary entered yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Technical Approach */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-400" />
                Technical Approach
              </h2>
            </CardHeader>
            <CardContent>
              {formData.technicalApproach ? (
                <p className="text-slate-400 whitespace-pre-wrap">{formData.technicalApproach}</p>
              ) : (
                <p className="text-slate-500 italic">No technical approach entered yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Team */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Team & Capabilities
              </h2>
            </CardHeader>
            <CardContent>
              {formData.teamDescription ? (
                <p className="text-slate-400 whitespace-pre-wrap">{formData.teamDescription}</p>
              ) : (
                <p className="text-slate-500 italic">No team description entered yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Budget */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-amber-400" />
                Budget
              </h2>
            </CardHeader>
            <CardContent>
              {formData.totalBudget ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-slate-700/50 p-3 sm:p-4 rounded-lg">
                      <p className="text-slate-400 text-sm">Total Budget</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">${parseInt(formData.totalBudget).toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-700/50 p-3 sm:p-4 rounded-lg">
                      <p className="text-slate-400 text-sm">Personnel</p>
                      <p className="text-xl font-bold text-white">${parseInt(formData.personnelCosts || "0").toLocaleString()}</p>
                    </div>
                  </div>
                  {formData.budgetJustification && (
                    <div>
                      <h3 className="text-white font-medium mb-1">Justification</h3>
                      <p className="text-slate-400 whitespace-pre-wrap">{formData.budgetJustification}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 italic">No budget entered yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Confirmation Banner */}
          {confirmationNumber && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
              <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">Application Submitted</h3>
              <p className="text-slate-300 text-sm mb-3">
                A confirmation email has been sent to your inbox.
              </p>
              <p className="text-emerald-400 font-mono font-bold text-lg">{confirmationNumber}</p>
              <p className="text-slate-500 text-xs mt-2">Save this confirmation number for your records.</p>
            </div>
          )}

          {/* Status Timeline — shown for submitted/awarded/rejected */}
          {["submitted", "pending", "awarded", "rejected"].includes(application.status) && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-400" />
                  Application Timeline
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {/* Step 1: Created */}
                  <TimelineStep
                    status="complete"
                    title="Application Created"
                    date={application.createdAt}
                    description="You started this application."
                    isLast={false}
                  />
                  {/* Step 2: Submitted */}
                  <TimelineStep
                    status={application.submittedAt ? "complete" : "upcoming"}
                    title="Submitted to Funder"
                    date={application.submittedAt || null}
                    description={
                      application.submittedAt
                        ? `Submitted on ${new Date(application.submittedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`
                        : "Awaiting submission."
                    }
                    isLast={false}
                  />
                  {/* Step 3: Under Review */}
                  <TimelineStep
                    status={
                      application.status === "awarded" || application.status === "rejected"
                        ? "complete"
                        : application.submittedAt
                          ? "current"
                          : "upcoming"
                    }
                    title="Under Review"
                    date={null}
                    description={
                      application.status === "submitted"
                        ? "The funder is reviewing your application against their scoring criteria."
                        : application.status === "awarded" || application.status === "rejected"
                          ? "Review complete."
                          : "Pending submission."
                    }
                    isLast={false}
                  />
                  {/* Step 4: Decision */}
                  <TimelineStep
                    status={
                      application.status === "awarded"
                        ? "success"
                        : application.status === "rejected"
                          ? "failed"
                          : "upcoming"
                    }
                    title={
                      application.status === "awarded"
                        ? `Awarded${application.awardAmount ? ` — ${formatCurrency(application.awardAmount)}` : ""}`
                        : application.status === "rejected"
                          ? "Not Selected"
                          : "Decision Pending"
                    }
                    date={application.awardedAt || application.rejectedAt || null}
                    description={
                      application.status === "awarded"
                        ? "Congratulations! Your application was successful."
                        : application.status === "rejected"
                          ? application.feedbackReceived || "The funder did not select this application."
                          : "We'll prompt you to report the outcome once the review period ends."
                    }
                    isLast={true}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4">
            <Button variant="secondary" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Application
            </Button>

            <div className="flex gap-3">
              {isEditable && (
                <>
                  <Button variant="secondary" onClick={() => setMode("edit")}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Continue Editing
                  </Button>
                  {application.status !== "ready_for_review" && (
                    <Button onClick={handleMarkReadyForReview} disabled={saving}>
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Mark Ready for Review
                    </Button>
                  )}
                </>
              )}
              {(application.status === "ready_for_review" || application.status === "in_progress") && (
                <Button
                  onClick={handleSubmitApplication}
                  disabled={submitting}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {submitting ? "Submitting..." : "Submit Application"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit mode - show step-by-step form
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => setMode("view")}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Overview
      </button>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Badge variant={status.color} className="mb-2">
          <status.icon className="h-3 w-3 mr-1" />
          {status.label}
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{application.grant.title}</h1>
        <div className="flex items-center gap-2 sm:gap-4 mt-2 text-slate-400 text-sm sm:text-base flex-wrap">
          <span>{application.grant.funder}</span>
          <span>•</span>
          <span className="text-emerald-400 font-medium">
            {formatCurrency(application.grant.amountMax || application.grant.amount)}
          </span>
          <span>•</span>
          <span>Due {new Date(application.grant.deadline).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-shrink-0">
            <button
              onClick={() => setCurrentStep(step.id)}
              className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition flex-shrink-0 ${
                currentStep > step.id
                  ? "bg-emerald-500 border-emerald-500"
                  : currentStep === step.id
                  ? "border-emerald-500 text-emerald-400"
                  : "border-slate-600 text-slate-500 hover:border-slate-500"
              }`}
            >
              {currentStep > step.id ? (
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              ) : (
                <step.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
            <span
              className={`ml-2 sm:ml-3 font-medium text-sm sm:text-base whitespace-nowrap ${
                currentStep >= step.id ? "text-white" : "text-slate-500"
              }`}
            >
              <span className="hidden sm:inline">{step.name}</span>
              <span className="sm:hidden">{step.id}</span>
            </span>
            {index < steps.length - 1 && (
              <div
                className={`w-6 sm:w-12 h-0.5 mx-2 sm:mx-3 ${
                  currentStep > step.id ? "bg-emerald-500" : "bg-slate-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {steps[currentStep - 1].name}
          </h2>
          {currentStep < 5 && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              AI can help generate content
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Project Summary */}
          {currentStep === 1 && (
            <>
              <Input
                label="Project Title"
                placeholder="Enter a concise, descriptive title for your project"
                value={formData.projectTitle}
                onChange={(e) => updateField("projectTitle", e.target.value)}
              />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-300">
                    Project Summary
                  </label>
                  <div className="flex gap-2">
                    {formData.projectSummary && renderCopyButton(formData.projectSummary, "projectSummary")}
                    {renderAIButton("projectSummary")}
                  </div>
                </div>
                <Textarea
                  placeholder="Provide a comprehensive overview of your proposed project..."
                  rows={6}
                  value={formData.projectSummary}
                  onChange={(e) => updateField("projectSummary", e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-300">
                    Problem Statement
                  </label>
                  <div className="flex gap-2">
                    {formData.problemStatement && renderCopyButton(formData.problemStatement, "problemStatement")}
                    {renderAIButton("problemStatement")}
                  </div>
                </div>
                <Textarea
                  placeholder="Describe the problem or challenge your project addresses..."
                  rows={5}
                  value={formData.problemStatement}
                  onChange={(e) => updateField("problemStatement", e.target.value)}
                />
              </div>

              <Textarea
                label="Proposed Solution"
                placeholder="Explain how your project will solve the problem..."
                rows={4}
                value={formData.proposedSolution}
                onChange={(e) => updateField("proposedSolution", e.target.value)}
              />

              <Textarea
                label="Expected Outcomes"
                placeholder="List the anticipated results and impact of your project..."
                rows={3}
                value={formData.expectedOutcomes}
                onChange={(e) => updateField("expectedOutcomes", e.target.value)}
              />
            </>
          )}

          {/* Step 2: Technical Approach */}
          {currentStep === 2 && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-300">
                    Technical Approach
                  </label>
                  <div className="flex gap-2">
                    {formData.technicalApproach && renderCopyButton(formData.technicalApproach, "technicalApproach")}
                    {renderAIButton("technicalApproach")}
                  </div>
                </div>
                <Textarea
                  placeholder="Describe your technical methodology and approach in detail..."
                  rows={8}
                  value={formData.technicalApproach}
                  onChange={(e) => updateField("technicalApproach", e.target.value)}
                />
              </div>

              <Textarea
                label="Innovation Description"
                placeholder="Explain what makes your approach innovative and novel..."
                rows={4}
                value={formData.innovationDescription}
                onChange={(e) => updateField("innovationDescription", e.target.value)}
              />

              <Textarea
                label="Research Methodology"
                placeholder="Detail the research methods and techniques you'll employ..."
                rows={4}
                value={formData.methodology}
                onChange={(e) => updateField("methodology", e.target.value)}
              />

              <Textarea
                label="Key Milestones"
                placeholder="List major milestones and deliverables for the project..."
                rows={4}
                value={formData.milestones}
                onChange={(e) => updateField("milestones", e.target.value)}
              />
            </>
          )}

          {/* Step 3: Team */}
          {currentStep === 3 && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-300">
                    Team Description
                  </label>
                  <div className="flex gap-2">
                    {formData.teamDescription && renderCopyButton(formData.teamDescription, "teamDescription")}
                    {renderAIButton("teamDescription")}
                  </div>
                </div>
                <Textarea
                  placeholder="Describe your team's composition and qualifications..."
                  rows={6}
                  value={formData.teamDescription}
                  onChange={(e) => updateField("teamDescription", e.target.value)}
                />
              </div>

              <Textarea
                label="Relevant Experience"
                placeholder="Highlight relevant experience and past accomplishments..."
                rows={5}
                value={formData.relevantExperience}
                onChange={(e) => updateField("relevantExperience", e.target.value)}
              />

              <Textarea
                label="Key Personnel"
                placeholder="List key team members and their roles in the project..."
                rows={4}
                value={formData.keyPersonnel}
                onChange={(e) => updateField("keyPersonnel", e.target.value)}
              />
            </>
          )}

          {/* Step 4: Budget */}
          {currentStep === 4 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Input
                  label="Total Budget Requested"
                  type="number"
                  value={formData.totalBudget}
                  onChange={(e) => updateField("totalBudget", e.target.value)}
                />
                <Input
                  label="Personnel Costs"
                  type="number"
                  placeholder="$0"
                  value={formData.personnelCosts}
                  onChange={(e) => updateField("personnelCosts", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Input
                  label="Equipment Costs"
                  type="number"
                  placeholder="$0"
                  value={formData.equipmentCosts}
                  onChange={(e) => updateField("equipmentCosts", e.target.value)}
                />
                <Input
                  label="Other Direct Costs"
                  type="number"
                  placeholder="$0"
                  value={formData.otherCosts}
                  onChange={(e) => updateField("otherCosts", e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-300">
                    Budget Justification
                  </label>
                  <div className="flex gap-2">
                    {formData.budgetJustification && renderCopyButton(formData.budgetJustification, "budgetJustification")}
                    {renderAIButton("budgetJustification")}
                  </div>
                </div>
                <Textarea
                  placeholder="Provide detailed justification for each budget category..."
                  rows={8}
                  value={formData.budgetJustification}
                  onChange={(e) => updateField("budgetJustification", e.target.value)}
                />
              </div>
            </>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-emerald-400 font-medium mb-2">
                  <CheckCircle className="h-5 w-5" />
                  Application Ready for Review
                </div>
                <p className="text-slate-400 text-sm">
                  Please review all sections below before marking as ready. You can click on any step above to edit that section.
                </p>
              </div>

              {/* Summary of all sections */}
              <div className="space-y-4">
                <Card className="bg-slate-900/50">
                  <CardContent className="p-4">
                    <h3 className="text-white font-medium mb-2">Project Summary</h3>
                    <p className="text-slate-400 text-sm line-clamp-3">
                      {formData.projectSummary || "Not completed"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50">
                  <CardContent className="p-4">
                    <h3 className="text-white font-medium mb-2">Technical Approach</h3>
                    <p className="text-slate-400 text-sm line-clamp-3">
                      {formData.technicalApproach || "Not completed"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50">
                  <CardContent className="p-4">
                    <h3 className="text-white font-medium mb-2">Team</h3>
                    <p className="text-slate-400 text-sm line-clamp-3">
                      {formData.teamDescription || "Not completed"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50">
                  <CardContent className="p-4">
                    <h3 className="text-white font-medium mb-2">Budget</h3>
                    <p className="text-slate-400 text-sm">
                      Total: ${parseInt(formData.totalBudget || "0").toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
                <p className="text-amber-400 text-sm">
                  <strong>Note:</strong> Marking as &quot;Ready for Review&quot; means you&apos;ve completed all sections.
                  You can still make edits before final submission to the grant portal.
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="secondary"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep < 5 ? (
              <>
                <Button variant="secondary" onClick={() => saveApplication()} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Save Draft
                </Button>
                <Button onClick={handleSaveAndContinue} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Save & Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            ) : (
              <Button onClick={handleMarkReadyForReview} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {saving ? "Saving..." : "Mark Ready for Review"}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

/* ─── Timeline Step Component ─── */
function TimelineStep({
  status,
  title,
  date,
  description,
  isLast,
}: {
  status: "complete" | "current" | "upcoming" | "success" | "failed";
  title: string;
  date: string | null;
  description: string;
  isLast: boolean;
}) {
  const dotColor = {
    complete: "bg-emerald-500",
    current: "bg-blue-500 animate-pulse",
    upcoming: "bg-slate-600",
    success: "bg-emerald-500",
    failed: "bg-red-500",
  }[status];

  const lineColor = status === "complete" || status === "success" ? "bg-emerald-500/30" : "bg-slate-700";
  const textColor = status === "upcoming" ? "text-slate-500" : "text-white";

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${dotColor} mt-1.5 shrink-0`} />
        {!isLast && <div className={`w-0.5 flex-1 ${lineColor} my-1`} />}
      </div>
      <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
        <p className={`font-semibold text-sm ${textColor}`}>{title}</p>
        {date && (
          <p className="text-slate-500 text-xs mt-0.5">
            {new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
        <p className="text-slate-400 text-xs mt-1">{description}</p>
      </div>
    </div>
  );
}
