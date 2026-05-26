"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Eye,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui";
import { ScoreRing } from "@/components/ui/ScoreRing";

interface CriterionScore { criterion: string; score: number; max: number; note: string; }
interface SectionDiff { before: string; after: string; why: string; }
interface Gap { field: string; reason: string; suggestion: string; impact: "high" | "medium" | "low"; }

interface SectionDraft {
  id: string; title: string; content: string;
  score: number; maxScore: number;
  criteriaScores: CriterionScore[];
  diffs: SectionDiff[]; sourcesUsed: string[]; gaps: Gap[];
}

interface SmartFillResult {
  score: number; maxScore: number;
  sections: SectionDraft[]; gaps: Gap[];
  optimizationRounds: number;
}

interface ApplyPanelProps {
  isOpen: boolean;
  onClose: () => void;
  grantId: string;
  grantTitle: string;
  grantFunder: string;
  /** Optional — when present, the marked-ready state surfaces a direct
   *  link to the funder's portal so the user knows where to paste. */
  grantUrl?: string | null;
}

type PanelState = "loading" | "ready" | "submitting" | "marked-ready" | "error";

export function ApplyPanel({
  isOpen,
  onClose,
  grantId,
  grantTitle,
  grantFunder,
  grantUrl,
}: ApplyPanelProps) {
  const [state, setState] = useState<PanelState>("loading");
  const [result, setResult] = useState<SmartFillResult | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showDiffs, setShowDiffs] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (isOpen) {
      doSmartFill();
    }
    return () => {
      setState("loading");
      setResult(null);
      setExpandedSection(null);
      setShowDiffs(null);
      setElapsed(0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, grantId]);

  // Real elapsed-time counter during loading — honest progress signal,
  // not scripted milestones. Tick every 250ms while loading.
  useEffect(() => {
    if (state !== "loading") return;
    const t0 = Date.now();
    const id = setInterval(() => setElapsed(Math.round((Date.now() - t0) / 100) / 10), 250);
    return () => clearInterval(id);
  }, [state]);

  async function doSmartFill() {
    setState("loading");
    setError(null);
    setElapsed(0);

    try {
      const res = await fetch(`/api/grants/${grantId}/smart-fill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const data = await res.json();
        setError(
          data.code === "UPGRADE_REQUIRED"
            ? "Smart Fill requires a Pro plan. Upgrade to unlock AI-powered applications."
            : data.error || "Failed to generate application"
        );
        setState("error");
        return;
      }
      const data: SmartFillResult = await res.json();
      setResult(data);
      setState("ready");
    } catch {
      setError("Failed to connect. Please try again.");
      setState("error");
    }
  }

  async function handleMarkReady() {
    if (!result) return;
    setState("submitting");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grantId,
          // Status = ready_for_review, NOT submitted. The user still needs
          // to paste this into the funder's portal — we don't have an API
          // integration with most funders, and pretending we do is the
          // single biggest expectation mismatch on the site.
          status: "ready_for_review",
          narrative: result.sections.map((s) => `## ${s.title}\n\n${s.content}`).join("\n\n"),
          responses: JSON.stringify(
            result.sections.reduce((acc, s) => ({ ...acc, [s.id]: s.content }), {})
          ),
        }),
      });
      if (res.ok) {
        // Auto-grow: save high-scoring sections to Content Library so the
        // next application gets a head start. This is real value capture.
        for (const section of result.sections) {
          if (section.score >= section.maxScore && section.content) {
            await fetch("/api/content-library", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                category: section.id.includes("team")
                  ? "team_bios"
                  : section.id.includes("budget")
                  ? "financials"
                  : section.id.includes("dei")
                  ? "dei_statement"
                  : section.id.includes("impact")
                  ? "impact_metrics"
                  : "past_performance",
                title: `${section.title} — ${grantTitle}`,
                content: section.content,
                source: "application",
                sourceRef: grantId,
              }),
            });
          }
        }
        setState("marked-ready");
      } else {
        setError("Failed to save application");
        setState("error");
      }
    } catch {
      setError("Failed to save. Please try again.");
      setState("error");
    }
  }

  async function handleFillGap(_sectionId: string, field: string, value: string) {
    await fetch("/api/content-library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: field,
        title: field.replace(/_/g, " "),
        content: value,
        source: "manual",
      }),
    });
    doSmartFill();
  }

  function scoreTone(score: number, max: number): "success" | "warn" | "danger" {
    const pct = max > 0 ? (score / max) * 100 : 0;
    if (pct >= 100) return "success";
    if (pct >= 70) return "warn";
    return "danger";
  }

  function scoreColor(tone: "success" | "warn" | "danger"): string {
    return tone === "success" ? "var(--success)" : "var(--warn)";
  }

  function scoreIcon(tone: "success" | "warn" | "danger") {
    if (tone === "success")
      return <CheckCircle className="h-4 w-4" style={{ color: "var(--success)" }} aria-hidden="true" />;
    return tone === "warn" ? (
      <AlertTriangle className="h-4 w-4" style={{ color: "var(--warn)" }} aria-hidden="true" />
    ) : (
      <AlertCircle className="h-4 w-4" style={{ color: "var(--warn)" }} aria-hidden="true" />
    );
  }

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(15, 23, 42, 0.4)" }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed inset-y-0 right-0 w-full sm:w-[560px] z-50 flex flex-col overflow-hidden"
        style={{
          background: "var(--surface)",
          borderLeft: "1px solid var(--rule)",
        }}
        role="dialog"
        aria-label="Smart Fill"
      >
        {/* Header */}
        <header
          className="flex items-center justify-between p-4"
          style={{ borderBottom: "1px solid var(--rule)" }}
        >
          <div className="flex-1 min-w-0">
            <h2
              className="font-semibold truncate"
              style={{ fontSize: "var(--text-body)", color: "var(--ink)" }}
            >
              {grantTitle}
            </h2>
            <p
              className="truncate"
              style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
            >
              {grantFunder}
            </p>
          </div>
          {result && state === "ready" && (
            <div className="mx-3 flex-shrink-0">
              <ScoreRing
                score={
                  result.maxScore > 0
                    ? Math.round((result.score / result.maxScore) * 100)
                    : 0
                }
                size="sm"
                label="Total score"
              />
            </div>
          )}
          <button
            onClick={onClose}
            className="p-2 min-w-11 min-h-11 flex items-center justify-center transition-colors"
            style={{ color: "var(--ink-2)" }}
            aria-label="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {state === "loading" && (
            <div className="flex flex-col items-center gap-5 py-16 px-4 text-center">
              <ScoreRing score={0} size="lg" label="Smart Fill generating" />
              <div>
                <p
                  className="font-semibold"
                  style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
                >
                  Reading the grant, drafting your application
                </p>
                <p
                  className="mt-2 max-w-xs mx-auto"
                  style={{ fontSize: "var(--text-body-sm)", color: "var(--ink-2)", lineHeight: 1.55 }}
                >
                  Pulling scoring criteria, mapping your Content Library, writing each
                  section to the funder&apos;s rubric, optimizing for max score. Usually 30–90s.
                </p>
                <p
                  className="mt-3 font-mono tabular-nums"
                  style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
                >
                  {elapsed.toFixed(1)}s elapsed
                </p>
              </div>
            </div>
          )}

          {state === "error" && (
            <div className="py-12 text-center px-4">
              <AlertCircle
                className="h-10 w-10 mx-auto mb-4"
                style={{ color: "var(--warn)" }}
                aria-hidden="true"
              />
              <p
                className="font-semibold mb-2"
                style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
              >
                Something went wrong
              </p>
              <p
                className="mb-6"
                style={{ fontSize: "var(--text-body-sm)", color: "var(--ink-2)" }}
              >
                {error}
              </p>
              <Button
                onClick={doSmartFill}
                style={{
                  background: "var(--surface)",
                  color: "var(--accent)",
                  border: "1px solid var(--accent)",
                  borderRadius: "var(--radius-control)",
                }}
              >
                Try again
              </Button>
            </div>
          )}

          {state === "ready" && result && (
            <div className="flex flex-col gap-3">
              {result.sections.map((section) => {
                const isExpanded = expandedSection === section.id;
                const showingDiffs = showDiffs === section.id;
                const tone = scoreTone(section.score, section.maxScore);
                return (
                  <article
                    key={section.id}
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--rule)",
                      borderRadius: "var(--radius-card)",
                      boxShadow: "var(--shadow-card-soft)",
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                      className="w-full flex items-center justify-between p-4 transition-colors hover:bg-[var(--bg-soft)]"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {scoreIcon(tone)}
                        <span
                          className="font-semibold truncate text-left"
                          style={{ fontSize: "var(--text-body)", color: "var(--ink)" }}
                        >
                          {section.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="font-mono tabular-nums font-semibold"
                          style={{ fontSize: "var(--text-body-sm)", color: scoreColor(tone) }}
                        >
                          {section.score}/{section.maxScore}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" style={{ color: "var(--ink-2)" }} aria-hidden="true" />
                        ) : (
                          <ChevronDown className="h-4 w-4" style={{ color: "var(--ink-2)" }} aria-hidden="true" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4" style={{ borderTop: "1px solid var(--rule)" }}>
                        <p
                          className="mt-3 whitespace-pre-wrap"
                          style={{
                            fontSize: "var(--text-body-sm)",
                            color: "var(--ink)",
                            lineHeight: 1.65,
                          }}
                        >
                          {section.content}
                        </p>

                        {section.criteriaScores.length > 0 && (
                          <div className="mt-5 space-y-1.5">
                            <p
                              className="font-semibold"
                              style={{
                                fontSize: "var(--text-meta)",
                                color: "var(--ink-2)",
                                letterSpacing: "0.04em",
                                textTransform: "uppercase",
                              }}
                            >
                              Scoring breakdown
                            </p>
                            {section.criteriaScores.map((cs, i) => {
                              const csTone = scoreTone(cs.score, cs.max);
                              return (
                                <div
                                  key={i}
                                  className="flex items-center justify-between"
                                  style={{ fontSize: "var(--text-caption)" }}
                                >
                                  <span style={{ color: "var(--ink-2)" }}>{cs.criterion}</span>
                                  <span
                                    className="font-mono tabular-nums font-semibold"
                                    style={{ color: scoreColor(csTone) }}
                                  >
                                    {cs.score}/{cs.max}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {section.diffs.length > 0 && (
                          <div className="mt-5">
                            <button
                              onClick={() => setShowDiffs(showingDiffs ? null : section.id)}
                              className="inline-flex items-center gap-1.5 font-medium hover:underline"
                              style={{ color: "var(--accent)", fontSize: "var(--text-caption)" }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              {showingDiffs ? "Hide" : "View"} what AI optimized
                            </button>
                            {showingDiffs && (
                              <div className="mt-3 space-y-3">
                                {section.diffs.map((diff, i) => (
                                  <div
                                    key={i}
                                    className="p-3"
                                    style={{
                                      background: "var(--bg-soft)",
                                      borderRadius: "var(--radius-control)",
                                    }}
                                  >
                                    <p
                                      className="line-through"
                                      style={{
                                        fontSize: "var(--text-caption)",
                                        color: "var(--ink-2)",
                                        lineHeight: 1.5,
                                      }}
                                    >
                                      {diff.before}
                                    </p>
                                    <p
                                      className="mt-1"
                                      style={{
                                        fontSize: "var(--text-caption)",
                                        color: "var(--success)",
                                        lineHeight: 1.5,
                                      }}
                                    >
                                      {diff.after}
                                    </p>
                                    <p
                                      className="mt-2 italic"
                                      style={{
                                        fontSize: "var(--text-caption)",
                                        color: "var(--ink-2)",
                                        lineHeight: 1.5,
                                      }}
                                    >
                                      {diff.why}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {section.gaps.length > 0 && (
                          <div className="mt-5 space-y-2">
                            {section.gaps.map((gap, i) => (
                              <GapInput
                                key={i}
                                gap={gap}
                                onFill={(value) => handleFillGap(section.id, gap.field, value)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {state === "marked-ready" && result && (
            <div className="py-12 text-center px-4">
              <ScoreRing
                score={
                  result.maxScore > 0
                    ? Math.round((result.score / result.maxScore) * 100)
                    : 100
                }
                size="lg"
                label="Application ready"
              />
              <h2
                className="mt-6 font-semibold"
                style={{ fontSize: "var(--text-title)", color: "var(--ink)" }}
              >
                Your draft is ready.
              </h2>
              <p
                className="mt-2 max-w-sm mx-auto"
                style={{ fontSize: "var(--text-body)", color: "var(--ink-2)", lineHeight: 1.6 }}
              >
                Saved to your applications. Final step: paste each section into the
                funder&apos;s portal.
              </p>

              {grantUrl ? (
                <a
                  href={grantUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 font-medium transition-colors !text-white"
                  style={{
                    background: "var(--accent)",
                    borderRadius: "var(--radius-control)",
                    fontSize: "var(--text-body-sm)",
                  }}
                >
                  Open {grantFunder} portal
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              ) : (
                <p
                  className="mt-6"
                  style={{ fontSize: "var(--text-body-sm)", color: "var(--ink-2)" }}
                >
                  Submit through whichever portal {grantFunder} uses for this grant.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {state === "ready" && result && (
          <div
            className="p-4 flex items-center gap-3"
            style={{ borderTop: "1px solid var(--rule)" }}
          >
            <Link href={`/dashboard/grants/${grantId}/apply`} className="flex-shrink-0">
              <Button
                size="sm"
                style={{
                  background: "var(--surface)",
                  color: "var(--ink-2)",
                  border: "1px solid var(--rule)",
                  borderRadius: "var(--radius-control)",
                }}
              >
                <ExternalLink className="h-4 w-4" /> Edit
              </Button>
            </Link>
            <Button
              className="flex-1 !text-white"
              onClick={handleMarkReady}
              style={{
                background: "var(--accent)",
                borderColor: "var(--accent)",
                borderRadius: "var(--radius-control)",
              }}
            >
              Mark ready to submit ({result.score}/{result.maxScore})
            </Button>
          </div>
        )}
        {state === "submitting" && (
          <div
            className="p-4 flex items-center justify-center gap-2"
            style={{
              borderTop: "1px solid var(--rule)",
              color: "var(--ink-2)",
              fontSize: "var(--text-body-sm)",
            }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving…
          </div>
        )}
        {state === "marked-ready" && (
          <div
            className="p-4 flex items-center gap-3"
            style={{ borderTop: "1px solid var(--rule)" }}
          >
            <Button
              className="flex-1"
              onClick={onClose}
              style={{
                background: "var(--surface)",
                color: "var(--ink)",
                border: "1px solid var(--rule)",
                borderRadius: "var(--radius-control)",
              }}
            >
              Back to dashboard
            </Button>
            <Link href="/dashboard/grants" className="flex-1">
              <Button
                className="w-full !text-white"
                style={{
                  background: "var(--accent)",
                  borderColor: "var(--accent)",
                  borderRadius: "var(--radius-control)",
                }}
              >
                Find another grant
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

function GapInput({ gap, onFill }: { gap: Gap; onFill: (value: string) => void }) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!value.trim()) return;
    setSaving(true);
    await onFill(value);
    setSaving(false);
  }

  return (
    <div
      className="p-3"
      style={{
        background: "var(--warn-soft)",
        border: "1px solid var(--warn)",
        borderRadius: "var(--radius-control)",
      }}
    >
      <p
        className="font-semibold"
        style={{ fontSize: "var(--text-caption)", color: "var(--warn)", lineHeight: 1.4 }}
      >
        {gap.reason}
      </p>
      <p
        className="mt-1 mb-2"
        style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)", lineHeight: 1.5 }}
      >
        {gap.suggestion}
      </p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type here — saves to your library forever"
        rows={2}
        className="w-full px-3 py-2 resize-none"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--rule)",
          color: "var(--ink)",
          fontSize: "var(--text-caption)",
          borderRadius: "var(--radius-control)",
        }}
      />
      <Button
        size="xs"
        className="mt-2 !text-white"
        onClick={handleSave}
        disabled={saving || !value.trim()}
        style={{
          background: "var(--accent)",
          borderColor: "var(--accent)",
          borderRadius: "var(--radius-control)",
        }}
      >
        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save & regenerate"}
      </Button>
    </div>
  );
}
