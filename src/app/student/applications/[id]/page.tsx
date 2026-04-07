"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  DollarSign,
  Award,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  Save,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  amount: string | null;
  amountMin: number | null;
  amountMax: number | null;
  deadline: string | null;
  essayPrompt: string | null;
  essayWordLimit: number | null;
  submissionMethod: string;
  url: string | null;
  applicationUrl: string | null;
}

interface StudentApplication {
  id: string;
  scholarshipId: string;
  status: string;
  essayDraft: string | null;
  essayFinal: string | null;
  responses: string | null;
  submissionMethod: string | null;
  confirmationNumber: string | null;
  submittedAt: string | null;
  awardedAt: string | null;
  rejectedAt: string | null;
  awardAmount: number | null;
  outcomeReportedAt: string | null;
  outcomeNotes: string | null;
  successFeePercent: number;
  successFeeAmount: number | null;
  successFeeStatus: string;
  successFeePaidAt: string | null;
  createdAt: string;
  updatedAt: string;
  scholarship: Scholarship;
}

const statusConfig: Record<
  string,
  {
    label: string;
    color: "default" | "success" | "warning" | "danger" | "info";
    icon: React.ElementType;
  }
> = {
  draft: { label: "Draft", color: "default", icon: FileText },
  ready: { label: "Ready", color: "info", icon: CheckCircle },
  submitted: { label: "Submitted", color: "success", icon: CheckCircle },
  awarded: { label: "Awarded", color: "success", icon: Award },
  rejected: { label: "Not Selected", color: "danger", icon: XCircle },
};

const successFeeStatusLabels: Record<string, string> = {
  not_applicable: "N/A",
  pending: "Pending",
  invoiced: "Invoiced",
  paid: "Paid",
  waived: "Waived",
};

function formatAmount(scholarship: Scholarship): string {
  if (scholarship.amount) return scholarship.amount;
  if (scholarship.amountMin && scholarship.amountMax) {
    return `$${scholarship.amountMin.toLocaleString()} – $${scholarship.amountMax.toLocaleString()}`;
  }
  if (scholarship.amountMax) return `Up to $${scholarship.amountMax.toLocaleString()}`;
  if (scholarship.amountMin) return `From $${scholarship.amountMin.toLocaleString()}`;
  return "Amount varies";
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ─── Timeline Step ────────────────────────────────────────────────────────────

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

  const lineColor =
    status === "complete" || status === "success"
      ? "bg-emerald-500/30"
      : "bg-slate-700";
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentApplicationDetailPage() {
  const params = useParams();
  const [application, setApplication] = useState<StudentApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Essay editing
  const [essayText, setEssayText] = useState("");
  const [savingEssay, setSavingEssay] = useState(false);
  const [essaySaved, setEssaySaved] = useState(false);

  // Copy button
  const [copied, setCopied] = useState(false);

  // Outcome reporting
  const [outcomeResult, setOutcomeResult] = useState<
    "awarded" | "rejected" | "no_response" | null
  >(null);
  const [outcomeAwardAmount, setOutcomeAwardAmount] = useState("");
  const [outcomeNotes, setOutcomeNotes] = useState("");
  const [submittingOutcome, setSubmittingOutcome] = useState(false);
  const [outcomeSubmitted, setOutcomeSubmitted] = useState(false);

  // ── Fetch application ──────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchApplication() {
      try {
        const res = await fetch(`/api/student/applications/${params.id}`);
        if (!res.ok) throw new Error("Application not found");
        const data: StudentApplication = await res.json();
        setApplication(data);
        setEssayText(data.essayDraft || "");
      } catch (err) {
        console.error("Failed to fetch application:", err);
        setError("Application not found");
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchApplication();
  }, [params.id]);

  // ── Save essay draft ───────────────────────────────────────────────────────

  const saveEssayDraft = async () => {
    if (!application) return;
    setSavingEssay(true);
    try {
      const res = await fetch(`/api/student/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essayDraft: essayText }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const updated: StudentApplication = await res.json();
      setApplication(updated);
      setEssaySaved(true);
      setTimeout(() => setEssaySaved(false), 2000);
    } catch (err) {
      console.error("Failed to save essay:", err);
    } finally {
      setSavingEssay(false);
    }
  };

  // ── Copy to clipboard ──────────────────────────────────────────────────────

  const copyEssay = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Outcome reporting ──────────────────────────────────────────────────────

  const handleOutcomeSubmit = async () => {
    if (!application || !outcomeResult) return;
    setSubmittingOutcome(true);
    try {
      const patchData: Record<string, unknown> = {
        status: outcomeResult === "no_response" ? "submitted" : outcomeResult,
        notes: outcomeNotes || undefined,
      };
      if (outcomeResult === "awarded" && outcomeAwardAmount) {
        patchData.awardAmount = parseInt(outcomeAwardAmount.replace(/\D/g, ""), 10);
      }

      const res = await fetch(`/api/student/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patchData),
      });
      if (!res.ok) throw new Error("Failed to report outcome");
      const updated: StudentApplication = await res.json();
      setApplication(updated);
      setOutcomeSubmitted(true);
    } catch (err) {
      console.error("Failed to submit outcome:", err);
    } finally {
      setSubmittingOutcome(false);
    }
  };

  // ── Loading / Error states ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <p className="text-white text-lg font-semibold mb-2">Application not found</p>
        <Link href="/student/applications">
          <Button variant="secondary">Back to Applications</Button>
        </Link>
      </div>
    );
  }

  const sc = application.scholarship;
  const cfg = statusConfig[application.status] ?? statusConfig.draft;
  const StatusIcon = cfg.icon;

  const isSubmitted = ["submitted", "awarded", "rejected"].includes(
    application.status
  );
  const isPastDeadline =
    sc.deadline && new Date(sc.deadline) < new Date();
  const showOutcomeBanner =
    isSubmitted &&
    isPastDeadline &&
    application.status === "submitted" &&
    !outcomeSubmitted;

  // Timeline step statuses
  const essayDrafted = Boolean(application.essayDraft);
  const decisionStatus =
    application.status === "awarded"
      ? "success"
      : application.status === "rejected"
        ? "failed"
        : "upcoming";

  const submittedStatus = isSubmitted ? "complete" : "upcoming";
  const essayStatus = essayDrafted ? "complete" : "upcoming";

  // Success fee calc
  const awardAmount = application.awardAmount;
  const successFeeAmount =
    awardAmount && application.successFeePercent
      ? Math.round((awardAmount * application.successFeePercent) / 100)
      : application.successFeeAmount;

  // Portal paste-ready package: essay for portal submissions
  const showPastePackage =
    isSubmitted &&
    (application.submissionMethod === "portal" ||
      sc.submissionMethod === "portal");

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* ── Back Button ──────────────────────────────────────────────────── */}
      <Link
        href="/student/applications"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Applications
      </Link>

      {/* ── Header Card ──────────────────────────────────────────────────── */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
                {sc.title}
              </h1>
              <p className="text-slate-400 mt-1">{sc.provider}</p>

              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <DollarSign className="h-4 w-4" />
                  {formatAmount(sc)}
                </span>
                {sc.deadline && (
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="h-4 w-4" />
                    Deadline: {formatDate(sc.deadline)}
                  </span>
                )}
              </div>

              {application.confirmationNumber && (
                <p className="mt-2 text-xs text-slate-500">
                  Confirmation:{" "}
                  <span className="font-mono text-slate-300">
                    {application.confirmationNumber}
                  </span>
                </p>
              )}
            </div>

            <Badge color={cfg.color} className="shrink-0 self-start">
              <StatusIcon className="h-3 w-3 mr-1" />
              {cfg.label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* ── Status Timeline ───────────────────────────────────────────────── */}
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
              description="Your application was started."
              isLast={false}
            />

            {/* Step 2: Essay Drafted */}
            <TimelineStep
              status={essayStatus}
              title="Essay Drafted"
              date={null}
              description={
                essayDrafted
                  ? "AI-generated draft ready."
                  : "Essay draft not yet started."
              }
              isLast={false}
            />

            {/* Step 3: Submitted */}
            <TimelineStep
              status={submittedStatus}
              title="Submitted"
              date={application.submittedAt}
              description={
                application.submittedAt
                  ? `Submitted on ${formatDate(application.submittedAt)}.${application.confirmationNumber ? ` Confirmation: ${application.confirmationNumber}` : ""}`
                  : "Not yet submitted."
              }
              isLast={false}
            />

            {/* Step 4: Decision */}
            <TimelineStep
              status={decisionStatus}
              title={
                application.status === "awarded"
                  ? `Awarded${awardAmount ? ` — ${formatCurrency(awardAmount)}` : ""}`
                  : application.status === "rejected"
                    ? "Not Selected"
                    : "Awaiting Decision"
              }
              date={application.awardedAt || application.rejectedAt}
              description={
                application.status === "awarded"
                  ? "Congratulations! Your application was successful."
                  : application.status === "rejected"
                    ? "The scholarship committee did not select this application."
                    : "Awaiting decision from the scholarship provider."
              }
              isLast={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Essay Section ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            Essay
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prompt */}
          {sc.essayPrompt && (
            <div className="rounded-lg bg-slate-700/50 border border-slate-600 p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Essay Prompt
              </p>
              <p className="text-slate-200 text-sm leading-relaxed">
                {sc.essayPrompt}
              </p>
              {sc.essayWordLimit && (
                <p className="text-slate-500 text-xs mt-2">
                  Word limit: {sc.essayWordLimit.toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Draft (editable) */}
          {!isSubmitted && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">
                  Essay Draft
                </label>
                <span className="text-xs text-slate-500">
                  {countWords(essayText)} words
                  {sc.essayWordLimit ? ` / ${sc.essayWordLimit}` : ""}
                </span>
              </div>
              <textarea
                className="w-full min-h-[220px] rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none resize-y leading-relaxed"
                placeholder="Your essay draft will appear here once generated, or you can type directly…"
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <Button
                  size="sm"
                  onClick={saveEssayDraft}
                  disabled={savingEssay}
                >
                  {savingEssay ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : essaySaved ? (
                    <Check className="h-4 w-4 mr-2 text-emerald-400" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {essaySaved ? "Saved" : "Save Draft"}
                </Button>
              </div>
            </div>
          )}

          {/* Final (read-only after submission) */}
          {isSubmitted && application.essayFinal && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">
                  Submitted Essay
                </label>
                <span className="text-xs text-slate-500">
                  {countWords(application.essayFinal)} words
                </span>
              </div>
              <div className="rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                {application.essayFinal}
              </div>
            </div>
          )}

          {/* Fallback: show draft read-only if no final */}
          {isSubmitted && !application.essayFinal && application.essayDraft && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">
                  Essay Draft (Read-only)
                </label>
                <span className="text-xs text-slate-500">
                  {countWords(application.essayDraft)} words
                </span>
              </div>
              <div className="rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                {application.essayDraft}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Submission Details ────────────────────────────────────────────── */}
      {isSubmitted && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="h-5 w-5 text-emerald-400" />
              Submission Details
            </h2>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {(application.submissionMethod || sc.submissionMethod) && (
                <div>
                  <dt className="text-slate-500 mb-0.5">Method</dt>
                  <dd className="text-white capitalize">
                    {application.submissionMethod || sc.submissionMethod}
                  </dd>
                </div>
              )}
              {application.confirmationNumber && (
                <div>
                  <dt className="text-slate-500 mb-0.5">Confirmation #</dt>
                  <dd className="text-white font-mono">
                    {application.confirmationNumber}
                  </dd>
                </div>
              )}
              {application.submittedAt && (
                <div>
                  <dt className="text-slate-500 mb-0.5">Submitted</dt>
                  <dd className="text-white">{formatDate(application.submittedAt)}</dd>
                </div>
              )}
            </dl>

            {/* Paste-Ready Package for portal submissions */}
            {showPastePackage && (application.essayFinal || application.essayDraft) && (
              <div className="mt-6 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-blue-300">
                    Paste-Ready Package
                  </h3>
                  <button
                    onClick={() =>
                      copyEssay(
                        application.essayFinal || application.essayDraft || ""
                      )
                    }
                    className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-200 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy to Clipboard
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Use this text when pasting into the scholarship portal.
                </p>
                <div className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-slate-200 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                  {application.essayFinal || application.essayDraft}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Outcome Reporting Banner ──────────────────────────────────────── */}
      {showOutcomeBanner && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-semibold">Have you heard back?</p>
                <p className="text-slate-400 text-sm mt-0.5">
                  The deadline for this scholarship has passed. Let us know the
                  outcome so we can keep your records up to date.
                </p>
              </div>
            </div>

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
                Not Selected
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

            {/* Award amount (if awarded) */}
            {outcomeResult === "awarded" && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Award Amount (optional)
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. 5000"
                  value={outcomeAwardAmount}
                  onChange={(e) => setOutcomeAwardAmount(e.target.value)}
                />
              </div>
            )}

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Notes (optional)
              </label>
              <textarea
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                rows={2}
                placeholder="Any notes about the outcome…"
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleOutcomeSubmit}
                disabled={!outcomeResult || submittingOutcome}
              >
                {submittingOutcome ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {submittingOutcome ? "Saving…" : "Submit Outcome"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Outcome submitted confirmation */}
      {outcomeSubmitted && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-300">
            Outcome recorded. Thank you for keeping your application up to date.
          </p>
        </div>
      )}

      {/* ── Success Fee Info ──────────────────────────────────────────────── */}
      {application.status === "awarded" && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />
              Success Fee
            </h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-slate-300 text-sm">
                  Success Fee:{" "}
                  <span className="text-white font-semibold">
                    {application.successFeePercent}%
                    {successFeeAmount
                      ? ` = ${formatCurrency(successFeeAmount)}`
                      : ""}
                  </span>
                </p>
                {awardAmount && (
                  <p className="text-slate-500 text-xs mt-1">
                    Based on award of {formatCurrency(awardAmount)}
                  </p>
                )}
              </div>
              <Badge
                color={
                  application.successFeeStatus === "paid"
                    ? "success"
                    : application.successFeeStatus === "invoiced"
                      ? "warning"
                      : application.successFeeStatus === "waived"
                        ? "default"
                        : "info"
                }
              >
                {successFeeStatusLabels[application.successFeeStatus] ??
                  application.successFeeStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
