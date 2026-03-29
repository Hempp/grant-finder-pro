"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  X, CheckCircle, AlertTriangle, AlertCircle,
  ChevronDown, ChevronUp, Star, Loader2, Eye,
  ExternalLink, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui";
import { Confetti } from "./Confetti";

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
  isOpen: boolean; onClose: () => void;
  grantId: string; grantTitle: string; grantFunder: string;
}

type PanelState = "loading" | "ready" | "submitting" | "submitted" | "error";

interface LoadingStep { label: string; done: boolean; }

export function ApplyPanel({ isOpen, onClose, grantId, grantTitle, grantFunder }: ApplyPanelProps) {
  const [state, setState] = useState<PanelState>("loading");
  const [result, setResult] = useState<SmartFillResult | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showDiffs, setShowDiffs] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([
    { label: "Analyzing grant requirements", done: false },
    { label: "Mapping your company data", done: false },
    { label: "Writing application draft", done: false },
    { label: "Optimizing for scoring criteria", done: false },
    { label: "Verifying coverage", done: false },
  ]);

  useEffect(() => {
    if (isOpen) { doSmartFill(); }
    return () => { setState("loading"); setResult(null); setExpandedSection(null); setShowDiffs(null); };
  }, [isOpen, grantId]);

  async function doSmartFill() {
    setState("loading");
    setError(null);
    setLoadingSteps((prev) => prev.map((s) => ({ ...s, done: false })));

    // Animate loading steps
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
      setLoadingSteps((prev) => prev.map((s, idx) => idx <= i ? { ...s, done: true } : s));
    }

    try {
      const res = await fetch(`/api/grants/${grantId}/smart-fill`, { method: "POST", headers: { "Content-Type": "application/json" } });
      if (!res.ok) {
        const data = await res.json();
        setError(data.code === "UPGRADE_REQUIRED"
          ? "Smart Fill requires a Pro plan. Upgrade to unlock AI-powered applications."
          : data.error || "Failed to generate application");
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

  async function handleSubmit() {
    if (!result) return;
    setState("submitting");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grantId,
          status: "submitted",
          narrative: result.sections.map((s) => `## ${s.title}\n\n${s.content}`).join("\n\n"),
          responses: JSON.stringify(result.sections.reduce((acc, s) => ({ ...acc, [s.id]: s.content }), {})),
        }),
      });
      if (res.ok) {
        // Auto-grow: save approved sections to Content Library
        for (const section of result.sections) {
          if (section.score >= section.maxScore && section.content) {
            await fetch("/api/content-library", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                category: section.id.includes("team") ? "team_bios"
                  : section.id.includes("budget") ? "financials"
                  : section.id.includes("dei") ? "dei_statement"
                  : section.id.includes("impact") ? "impact_metrics"
                  : "past_performance",
                title: `${section.title} — ${grantTitle}`,
                content: section.content,
                source: "application",
                sourceRef: grantId,
              }),
            });
          }
        }
        setState("submitted");
        setShowConfetti(true);
      } else {
        setError("Failed to submit application");
        setState("error");
      }
    } catch {
      setError("Failed to submit. Please try again.");
      setState("error");
    }
  }

  async function handleFillGap(_sectionId: string, field: string, value: string) {
    await fetch("/api/content-library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: field, title: field.replace(/_/g, " "), content: value, source: "manual" }),
    });
    doSmartFill();
  }

  function scoreColor(score: number, max: number): string {
    const pct = (score / max) * 100;
    if (pct >= 100) return "text-emerald-400";
    if (pct >= 70) return "text-amber-400";
    return "text-red-400";
  }

  function scoreIcon(score: number, max: number) {
    if (score >= max) return <CheckCircle className="h-5 w-5 text-emerald-400" />;
    if (score >= max * 0.7) return <AlertTriangle className="h-5 w-5 text-amber-400" />;
    return <AlertCircle className="h-5 w-5 text-red-400" />;
  }

  if (!isOpen) return null;

  return (
    <>
      <Confetti show={showConfetti} onComplete={() => setShowConfetti(false)} />
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full sm:w-[560px] bg-slate-950 border-l border-slate-800 z-50 flex flex-col overflow-hidden animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-white truncate">{grantTitle}</h2>
            <p className="text-xs text-slate-500 leading-4">{grantFunder}</p>
          </div>
          {result && state === "ready" && (
            <div className={`flex items-center gap-2 mx-4 ${scoreColor(result.score, result.maxScore)}`}>
              {result.score >= result.maxScore && <Star className="h-4 w-4 fill-current" />}
              <span className="text-lg font-bold">{result.score}/{result.maxScore}</span>
            </div>
          )}
          <button onClick={onClose} className="p-2 min-w-11 min-h-11 flex items-center justify-center text-slate-400 hover:text-white transition-colors duration-200" aria-label="Close panel">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {state === "loading" && (
            <div className="flex flex-col gap-4 py-8">
              <Sparkles className="h-10 w-10 text-emerald-400 mx-auto animate-breathe" />
              <div className="space-y-3 max-w-xs mx-auto">
                {loadingSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {step.done
                      ? <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      : <Loader2 className="h-4 w-4 text-slate-500 flex-shrink-0 animate-spin" />}
                    <span className={`text-sm leading-5 ${step.done ? "text-white" : "text-slate-500"}`}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {state === "error" && (
            <div className="py-12 text-center">
              <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-4" />
              <p className="text-white font-bold mb-2">Something went wrong</p>
              <p className="text-slate-400 text-sm mb-6">{error}</p>
              <Button variant="outline" onClick={doSmartFill}>Try Again</Button>
            </div>
          )}

          {state === "ready" && result && (
            <div className="flex flex-col gap-3">
              {result.sections.map((section) => {
                const isExpanded = expandedSection === section.id;
                const showingDiffs = showDiffs === section.id;
                return (
                  <div key={section.id} className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        {scoreIcon(section.score, section.maxScore)}
                        <span className="text-sm font-bold text-white">{section.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${scoreColor(section.score, section.maxScore)}`}>{section.score}/{section.maxScore}</span>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-slate-800/50">
                        <p className="text-sm text-slate-300 leading-6 mt-3 whitespace-pre-wrap">{section.content}</p>

                        {section.criteriaScores.length > 0 && (
                          <div className="mt-4 space-y-1">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Scoring Breakdown</p>
                            {section.criteriaScores.map((cs, i) => (
                              <div key={i} className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">{cs.criterion}</span>
                                <span className={scoreColor(cs.score, cs.max)}>{cs.score}/{cs.max}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {section.diffs.length > 0 && (
                          <div className="mt-4">
                            <button onClick={() => setShowDiffs(showingDiffs ? null : section.id)} className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors duration-200">
                              <Eye className="h-3.5 w-3.5" /> {showingDiffs ? "Hide" : "View"} what AI optimized
                            </button>
                            {showingDiffs && (
                              <div className="mt-3 space-y-3">
                                {section.diffs.map((diff, i) => (
                                  <div key={i} className="bg-slate-800/50 rounded-lg p-3">
                                    <p className="text-xs text-red-400/70 line-through leading-4">{diff.before}</p>
                                    <p className="text-xs text-emerald-400 leading-4 mt-1">{diff.after}</p>
                                    <p className="text-xs text-slate-500 leading-4 mt-2 italic">{diff.why}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {section.gaps.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {section.gaps.map((gap, i) => (
                              <GapInput key={i} gap={gap} onFill={(value) => handleFillGap(section.id, gap.field, value)} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {state === "submitted" && (
            <div className="py-12 text-center">
              <div className="bg-emerald-500/20 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Application Submitted!</h2>
              <p className="text-slate-400 text-sm">&ldquo;{grantTitle}&rdquo; has been submitted. We&apos;ll track the outcome.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {state === "ready" && result && (
          <div className="p-4 border-t border-slate-800 flex items-center gap-3">
            <Link href={`/dashboard/grants/${grantId}/apply`} className="flex-shrink-0">
              <Button variant="ghost" size="sm"><ExternalLink className="h-4 w-4" /> Edit Full Page</Button>
            </Link>
            <Button variant="primary" className="flex-1" onClick={handleSubmit}>
              {result.score >= result.maxScore && <Star className="h-4 w-4 fill-current" />}
              Submit {result.score >= result.maxScore ? "\u2605" : ""} ({result.score}/{result.maxScore})
            </Button>
          </div>
        )}
        {state === "submitted" && (
          <div className="p-4 border-t border-slate-800 flex items-center gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>Back to Dashboard</Button>
            <Link href="/dashboard/grants" className="flex-1">
              <Button variant="primary" className="w-full">Apply to Another</Button>
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
    <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
      <p className="text-xs text-amber-400 font-bold leading-4 mb-1">{gap.reason}</p>
      <p className="text-xs text-slate-400 leading-4 mb-2">{gap.suggestion}</p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type here — saves to your library forever"
        rows={2}
        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 mb-2"
      />
      <Button size="xs" variant="primary" onClick={handleSave} disabled={saving || !value.trim()}>
        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save & Regenerate"}
      </Button>
    </div>
  );
}
