"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Globe,
  Mail,
  MapPin,
  Share2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Sparkles,
  BookOpen,
  RefreshCw,
  Clock,
  Tag,
  GraduationCap,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui";

// ── Types ──────────────────────────────────────────────────────────────────

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  description: string;
  amount: string | null;
  amountMin: number | null;
  amountMax: number | null;
  deadline: string | null;
  scholarshipType: string;
  renewable: boolean;
  renewalConditions: string | null;
  eligibilityText: string | null;
  minGPA: number | null;
  maxGPA: number | null;
  educationLevels: string | null;
  fieldsOfStudy: string | null;
  essayRequired: boolean;
  essayPrompt: string | null;
  essayWordLimit: number | null;
  submissionMethod: string;
  portalUrl: string | null;
  portalInstructions: string | null;
  applicationUrl: string | null;
  url: string | null;
  tags: string | null;
  citizenshipRequired: string | null;
  stateRestriction: string | null;
}

interface MatchBreakdown {
  educationLevel: number;
  fieldOfStudy: number;
  gpa: number;
  location: number;
  demographics: number;
  keywords: number;
}

interface MatchResult {
  scholarshipId: string;
  score: number;
  breakdown: MatchBreakdown;
  reasons: string[];
}

interface DetailResponse {
  scholarship: Scholarship;
  matchResult: MatchResult | null;
  alreadyApplied: boolean;
  applicationId: string | null;
}

// ── Constants ──────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  merit: "Merit",
  need: "Need-Based",
  demographic: "Demographic",
  essay: "Essay",
  field: "Field-Specific",
  community: "Community",
  athletic: "Athletic",
  research: "Research",
};

const TYPE_BADGE: Record<string, string> = {
  merit: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  need: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  demographic: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  essay: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  field: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  community: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  athletic: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  research: "bg-violet-500/20 text-violet-400 border-violet-500/30",
};

const EDUCATION_LABELS: Record<string, string> = {
  high_school: "High School",
  undergrad_fr: "Undergraduate (Freshman)",
  undergrad_so: "Undergraduate (Sophomore)",
  undergrad_jr: "Undergraduate (Junior)",
  undergrad_sr: "Undergraduate (Senior)",
  graduate: "Graduate",
  phd: "PhD",
  professional: "Professional",
};

// ── Helpers ────────────────────────────────────────────────────────────────

function formatAmount(s: Scholarship): string {
  if (s.amountMax && s.amountMax >= 1000000) return `$${(s.amountMax / 1000000).toFixed(1)}M`;
  if (s.amountMax && s.amountMax >= 1000) return `$${(s.amountMax / 1000).toFixed(0)}K`;
  if (s.amountMax) return `$${s.amountMax.toLocaleString()}`;
  if (s.amountMin && s.amountMax)
    return `$${s.amountMin.toLocaleString()} – $${s.amountMax.toLocaleString()}`;
  if (s.amountMin && s.amountMin >= 1000) return `$${(s.amountMin / 1000).toFixed(0)}K+`;
  if (s.amountMin) return `$${s.amountMin.toLocaleString()}+`;
  if (s.amount) return s.amount;
  return "Varies";
}

function formatDeadline(dateStr: string | null): { label: string; urgent: boolean; expired: boolean } {
  if (!dateStr) return { label: "Rolling / Open", urgent: false, expired: false };
  const date = new Date(dateStr);
  const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: `Expired (${date.toLocaleDateString()})`, urgent: false, expired: true };
  if (days === 0) return { label: "Due today!", urgent: true, expired: false };
  if (days <= 7) return { label: `Due in ${days} day${days !== 1 ? "s" : ""} — ${date.toLocaleDateString()}`, urgent: true, expired: false };
  return { label: date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), urgent: false, expired: false };
}

function parseJSON<T>(val: string | null | undefined): T | null {
  if (!val) return null;
  try { return JSON.parse(val) as T; } catch { return null; }
}

function DimScore({ label, score, icon }: { label: string; score: number; icon?: React.ReactNode }) {
  const pct = Math.round(score);
  const color =
    pct >= 80 ? "text-emerald-400" :
    pct >= 50 ? "text-amber-400" :
    "text-red-400";
  const bar =
    pct >= 80 ? "bg-emerald-500" :
    pct >= 50 ? "bg-amber-500" :
    "bg-red-500";

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 w-40 shrink-0">
        {icon && <span className="text-slate-500">{icon}</span>}
        <span className="text-sm text-slate-300">{label}</span>
      </div>
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-bold w-10 text-right ${color}`}>{pct}</span>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 bg-slate-800 rounded" />
      <div className="h-10 w-3/4 bg-slate-800 rounded" />
      <div className="h-5 w-1/3 bg-slate-800 rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-40 bg-slate-800 rounded-xl" />
          <div className="h-32 bg-slate-800 rounded-xl" />
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function ScholarshipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/student/scholarships/${id}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Error ${res.status}`);
      }
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load scholarship");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApply = async () => {
    if (!data) return;
    setApplying(true);
    setApplyError(null);
    try {
      const res = await fetch("/api/student/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scholarshipId: id }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to start application");
      // If 409 conflict (already applied), just redirect
      router.push("/student/apply");
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : "Something went wrong");
      setApplying(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback — silently ignore
    }
  };

  // ── Loading / Error ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Link
          href="/student/scholarships"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Scholarships
        </Link>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-medium">{error ?? "Scholarship not found"}</p>
            <Button size="sm" variant="ghost" onClick={fetchData} className="mt-3 text-red-400 hover:text-red-300">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { scholarship: s, matchResult, alreadyApplied, applicationId } = data;
  const { label: deadlineLabel, urgent: deadlineUrgent, expired: deadlineExpired } = formatDeadline(s.deadline);
  const typeBadgeClass = TYPE_BADGE[s.scholarshipType] ?? "bg-slate-700 text-slate-300 border-slate-600";
  const amountLabel = formatAmount(s);
  const eduLevels = parseJSON<string[]>(s.educationLevels);
  const fields = parseJSON<string[]>(s.fieldsOfStudy);
  const tags = parseJSON<string[]>(s.tags);

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto">

      {/* ── Back nav ── */}
      <Link
        href="/student/scholarships"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Scholarships
      </Link>

      {/* ── Hero header ── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2 items-center">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${typeBadgeClass}`}>
            {TYPE_LABEL[s.scholarshipType] ?? s.scholarshipType}
          </span>
          {s.essayRequired && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-rose-500/10 text-rose-400 border-rose-500/20 flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Essay Required
            </span>
          )}
          {s.renewable && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-teal-500/10 text-teal-400 border-teal-500/20 flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Renewable
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
          {s.title}
        </h1>
        <p className="text-slate-400 text-lg">{s.provider}</p>

        {/* Key stats row */}
        <div className="flex flex-wrap gap-4 mt-1">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <span className="text-2xl font-bold text-emerald-400">{amountLabel}</span>
          </div>

          <div className={`flex items-center gap-2 ${deadlineUrgent ? "text-red-400" : deadlineExpired ? "text-slate-500" : "text-slate-300"}`}>
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium">{deadlineLabel}</span>
            {deadlineUrgent && (
              <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-medium">
                Urgent
              </span>
            )}
          </div>

          {matchResult && (
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span className="text-sm font-medium text-emerald-300">
                {matchResult.score}% match
              </span>
              <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  style={{ width: `${matchResult.score}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Main 2-col layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Main content ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Description */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-slate-400" />
              About This Scholarship
            </h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line text-sm sm:text-base">
              {s.description}
            </p>

            {/* Fields + Education tags */}
            {(fields || eduLevels || tags) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {fields?.map((f) => (
                  <span key={f} className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {f}
                  </span>
                ))}
                {eduLevels?.map((lvl) => (
                  <span key={lvl} className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {EDUCATION_LABELS[lvl] ?? lvl}
                  </span>
                ))}
                {tags?.map((t) => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-slate-700/80 text-slate-400 border border-slate-600">
                    <Tag className="inline h-3 w-3 mr-1 -mt-0.5" />
                    {t}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Eligibility */}
          {(s.eligibilityText || s.minGPA || s.citizenshipRequired || s.stateRestriction) && (
            <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-slate-400" />
                Eligibility Requirements
              </h2>
              {s.eligibilityText && (
                <p className="text-slate-300 text-sm leading-relaxed mb-4 whitespace-pre-line">
                  {s.eligibilityText}
                </p>
              )}
              <div className="space-y-2">
                {s.minGPA && (
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-slate-500 flex-shrink-0" />
                    <span className="text-slate-400">Minimum GPA:</span>
                    <span className="text-white font-medium">{s.minGPA.toFixed(1)}</span>
                  </div>
                )}
                {s.citizenshipRequired && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-slate-500 flex-shrink-0" />
                    <span className="text-slate-400">Citizenship:</span>
                    <span className="text-white font-medium capitalize">
                      {s.citizenshipRequired.replace(/_/g, " ")}
                    </span>
                  </div>
                )}
                {s.stateRestriction && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-slate-500 flex-shrink-0" />
                    <span className="text-slate-400">State restriction:</span>
                    <span className="text-white font-medium">{s.stateRestriction}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Essay */}
          {s.essayRequired && (
            <section className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-6">
              <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-rose-400" />
                Essay Required
              </h2>
              {s.essayPrompt && (
                <blockquote className="border-l-4 border-rose-500/40 pl-4 mb-3">
                  <p className="text-slate-300 text-sm italic leading-relaxed">&ldquo;{s.essayPrompt}&rdquo;</p>
                </blockquote>
              )}
              {s.essayWordLimit && (
                <p className="text-sm text-slate-400 mb-3">
                  <Clock className="inline h-3.5 w-3.5 mr-1 -mt-0.5 text-slate-500" />
                  Word limit: <span className="text-white font-medium">{s.essayWordLimit.toLocaleString()} words</span>
                </p>
              )}
              <p className="text-sm text-rose-300/80 bg-rose-500/10 rounded-lg p-3">
                <Sparkles className="inline h-4 w-4 mr-1.5 text-rose-400 -mt-0.5" />
                GrantPilot will draft a personalized essay for you when you apply.
              </p>
            </section>
          )}

          {/* Submission info */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-400" />
              How to Submit
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">Method:</span>
                <span className="capitalize text-white font-medium">
                  {s.submissionMethod === "portal" ? "Online Portal" :
                   s.submissionMethod === "email" ? "Email" :
                   s.submissionMethod === "mail" ? "Mail" :
                   s.submissionMethod}
                </span>
                {s.submissionMethod === "portal" && <Globe className="h-4 w-4 text-emerald-400" />}
                {s.submissionMethod === "email" && <Mail className="h-4 w-4 text-blue-400" />}
                {s.submissionMethod === "mail" && <MapPin className="h-4 w-4 text-amber-400" />}
              </div>

              {s.portalUrl && (
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-slate-400 shrink-0">Portal:</span>
                  <a
                    href={s.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 break-all flex items-center gap-1"
                  >
                    {s.portalUrl}
                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                  </a>
                </div>
              )}

              {s.applicationUrl && s.applicationUrl !== s.portalUrl && (
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-slate-400 shrink-0">Application link:</span>
                  <a
                    href={s.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 break-all flex items-center gap-1"
                  >
                    {s.applicationUrl}
                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                  </a>
                </div>
              )}

              {s.portalInstructions && (
                <div className="bg-slate-900/60 rounded-lg p-3 text-sm text-slate-300 leading-relaxed">
                  {s.portalInstructions}
                </div>
              )}
            </div>
          </section>

          {/* Match Breakdown */}
          {matchResult && (
            <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                Match Breakdown
              </h2>
              <p className="text-slate-400 text-sm mb-5">
                How your profile aligns with this scholarship&apos;s requirements.
              </p>

              <div className="space-y-3 mb-5">
                <DimScore label="Education Level" score={matchResult.breakdown.educationLevel} icon={<GraduationCap className="h-4 w-4" />} />
                <DimScore label="Field of Study" score={matchResult.breakdown.fieldOfStudy} icon={<BookOpen className="h-4 w-4" />} />
                <DimScore label="GPA" score={matchResult.breakdown.gpa} icon={<ListChecks className="h-4 w-4" />} />
                <DimScore label="Location" score={matchResult.breakdown.location} icon={<MapPin className="h-4 w-4" />} />
                <DimScore label="Demographics" score={matchResult.breakdown.demographics} icon={<Tag className="h-4 w-4" />} />
                <DimScore label="Keyword Fit" score={matchResult.breakdown.keywords} icon={<FileText className="h-4 w-4" />} />
              </div>

              {/* Reasons */}
              {matchResult.reasons.length > 0 && (
                <ul className="space-y-1.5">
                  {matchResult.reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* Apply Error */}
          {applyError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{applyError}</p>
            </div>
          )}

          {/* Apply CTA (mobile visible at bottom of main content) */}
          <div className="lg:hidden">
            <ApplyCTA
              alreadyApplied={alreadyApplied}
              applicationId={applicationId}
              applying={applying}
              expired={deadlineExpired}
              onApply={handleApply}
            />
          </div>
        </div>

        {/* ── Right: Sidebar ── */}
        <div className="flex flex-col gap-5">

          {/* Apply CTA card (desktop) */}
          <div className="hidden lg:block">
            <ApplyCTA
              alreadyApplied={alreadyApplied}
              applicationId={applicationId}
              applying={applying}
              expired={deadlineExpired}
              onApply={handleApply}
            />
          </div>

          {/* Quick facts */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Quick Facts
            </h3>
            <div className="space-y-3">
              <FactRow icon={<DollarSign className="h-4 w-4 text-emerald-400" />} label="Amount" value={amountLabel} />
              <FactRow
                icon={<Calendar className="h-4 w-4 text-slate-400" />}
                label="Deadline"
                value={deadlineLabel}
                valueClass={deadlineUrgent ? "text-red-400" : deadlineExpired ? "text-slate-500" : undefined}
              />
              <FactRow
                icon={<Tag className="h-4 w-4 text-slate-400" />}
                label="Type"
                value={TYPE_LABEL[s.scholarshipType] ?? s.scholarshipType}
              />
              <FactRow
                icon={<RefreshCw className="h-4 w-4 text-slate-400" />}
                label="Renewable"
                value={s.renewable ? "Yes" : "No"}
                valueClass={s.renewable ? "text-teal-400" : undefined}
              />
              {s.submissionMethod && (
                <FactRow
                  icon={<Globe className="h-4 w-4 text-slate-400" />}
                  label="Submission"
                  value={s.submissionMethod === "portal" ? "Online Portal" : s.submissionMethod === "email" ? "Email" : "Mail"}
                />
              )}
            </div>
          </div>

          {/* Links */}
          {(s.url || s.applicationUrl || s.portalUrl) && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                External Links
              </h3>
              <div className="space-y-2">
                {s.url && (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Globe className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Official Scholarship Page</span>
                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 ml-auto" />
                  </a>
                )}
                {s.applicationUrl && (
                  <a
                    href={s.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Application Form</span>
                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 ml-auto" />
                  </a>
                )}
                {s.portalUrl && (
                  <a
                    href={s.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Globe className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Application Portal</span>
                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 ml-auto" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-800 transition-all text-sm font-medium"
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                Link Copied!
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                Share This Scholarship
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function FactRow({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-500 flex-shrink-0">{icon}</span>
      <span className="text-sm text-slate-400 flex-shrink-0">{label}:</span>
      <span className={`text-sm font-medium ml-auto text-right ${valueClass ?? "text-white"}`}>{value}</span>
    </div>
  );
}

function ApplyCTA({
  alreadyApplied,
  applicationId,
  applying,
  expired,
  onApply,
}: {
  alreadyApplied: boolean;
  applicationId: string | null;
  applying: boolean;
  expired: boolean;
  onApply: () => void;
}) {
  if (alreadyApplied) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="h-5 w-5 text-emerald-400" />
          <span className="text-emerald-300 font-semibold">Already Applied</span>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          You have an application in progress for this scholarship.
        </p>
        <Link href={applicationId ? `/student/applications?focus=${applicationId}` : "/student/applications"}>
          <Button variant="outline" className="w-full">
            View Application
          </Button>
        </Link>
        <Link href="/student/apply">
          <Button variant="primary" className="w-full mt-2">
            <Sparkles className="h-4 w-4 mr-2" />
            Go to Apply Panel
          </Button>
        </Link>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <XCircle className="h-5 w-5 text-slate-500" />
          <span className="text-slate-400 font-semibold">Deadline Passed</span>
        </div>
        <p className="text-slate-500 text-sm">
          The deadline for this scholarship has passed. Check back for next cycle.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
      <Button
        variant="primary"
        className="w-full flex items-center justify-center gap-2 text-base py-3"
        onClick={onApply}
        disabled={applying}
      >
        {applying ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Starting Application...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Apply with GrantPilot
          </>
        )}
      </Button>
      <p className="text-center text-xs text-slate-500 mt-2">
        GrantPilot will draft your essay and help fill out your application.
      </p>
    </div>
  );
}
