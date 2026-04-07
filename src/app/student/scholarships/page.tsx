"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  AlertCircle,
  BookOpen,
  Calendar,
  SlidersHorizontal,
  X,
  ChevronDown,
  Sparkles,
  FileText,
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
  essayRequired: boolean;
  fieldsOfStudy: string | null;
  matchScore: number;
  status: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "merit", label: "Merit" },
  { value: "need", label: "Need-Based" },
  { value: "demographic", label: "Demographic" },
  { value: "essay", label: "Essay" },
  { value: "field", label: "Field-Specific" },
  { value: "community", label: "Community" },
  { value: "athletic", label: "Athletic" },
  { value: "research", label: "Research" },
];

const AMOUNT_OPTIONS = [
  { value: "", label: "All Amounts" },
  { value: "under1k", label: "Under $1K" },
  { value: "1k-5k", label: "$1K–$5K" },
  { value: "5k-10k", label: "$5K–$10K" },
  { value: "10k-25k", label: "$10K–$25K" },
  { value: "over25k", label: "Over $25K" },
];

const DEADLINE_OPTIONS = [
  { value: "", label: "All Deadlines" },
  { value: "this-month", label: "This Month" },
  { value: "3months", label: "Next 3 Months" },
  { value: "6months", label: "Next 6 Months" },
  { value: "rolling", label: "Rolling" },
];

const FIELD_OPTIONS = [
  { value: "", label: "All Fields" },
  { value: "STEM", label: "STEM" },
  { value: "Health Sciences", label: "Health Sciences" },
  { value: "Business", label: "Business" },
  { value: "Humanities", label: "Humanities" },
  { value: "Arts", label: "Arts" },
  { value: "Education", label: "Education" },
  { value: "Social Sciences", label: "Social Sciences" },
  { value: "Law", label: "Law" },
];

const SORT_OPTIONS = [
  { value: "match", label: "Best Match" },
  { value: "deadline", label: "Deadline (Soonest)" },
  { value: "amount", label: "Amount (Highest)" },
  { value: "recent", label: "Recently Added" },
];

const TYPE_BADGE_COLORS: Record<string, string> = {
  merit: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  need: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  demographic: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  essay: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  field: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  community: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  athletic: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  research: "bg-violet-500/20 text-violet-400 border-violet-500/30",
};

// ── Helpers ────────────────────────────────────────────────────────────────

function formatAmount(s: Scholarship): string {
  if (s.amountMax && s.amountMax >= 1000000) return `$${(s.amountMax / 1000000).toFixed(1)}M`;
  if (s.amountMax && s.amountMax >= 1000) return `$${(s.amountMax / 1000).toFixed(0)}K`;
  if (s.amountMax) return `$${s.amountMax.toLocaleString()}`;
  if (s.amountMin && s.amountMin >= 1000) return `$${(s.amountMin / 1000).toFixed(0)}K+`;
  if (s.amountMin) return `$${s.amountMin.toLocaleString()}+`;
  if (s.amount) return s.amount;
  return "Varies";
}

function getAmountValue(s: Scholarship): number {
  return s.amountMax ?? s.amountMin ?? 0;
}

function formatDeadline(dateStr: string | null): { label: string; urgent: boolean } {
  if (!dateStr) return { label: "Rolling", urgent: false };
  const date = new Date(dateStr);
  const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: "Expired", urgent: false };
  if (days === 0) return { label: "Due today", urgent: true };
  if (days <= 7) return { label: `Due in ${days}d`, urgent: true };
  const month = date.toLocaleString("default", { month: "short" });
  const day = date.getDate();
  return { label: `Due ${month} ${day}`, urgent: false };
}

function matchesAmountFilter(s: Scholarship, filter: string): boolean {
  if (!filter) return true;
  const val = getAmountValue(s);
  if (!val) return filter === ""; // 0/unknown only matches "all"
  switch (filter) {
    case "under1k": return val < 1000;
    case "1k-5k": return val >= 1000 && val <= 5000;
    case "5k-10k": return val > 5000 && val <= 10000;
    case "10k-25k": return val > 10000 && val <= 25000;
    case "over25k": return val > 25000;
    default: return true;
  }
}

function matchesDeadlineFilter(s: Scholarship, filter: string): boolean {
  if (!filter) return true;
  if (filter === "rolling") return !s.deadline;
  if (!s.deadline) return false;
  const days = Math.ceil((new Date(s.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return false;
  switch (filter) {
    case "this-month": return days <= 31;
    case "3months": return days <= 92;
    case "6months": return days <= 183;
    default: return true;
  }
}

function matchesFieldFilter(s: Scholarship, filter: string): boolean {
  if (!filter) return true;
  if (!s.fieldsOfStudy) return false;
  try {
    const fields: string[] = JSON.parse(s.fieldsOfStudy);
    return fields.some((f) => f.toLowerCase().includes(filter.toLowerCase()));
  } catch {
    return s.fieldsOfStudy.toLowerCase().includes(filter.toLowerCase());
  }
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function ScholarshipCardSkeleton() {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 animate-pulse">
      <div className="h-8 w-24 bg-slate-700 rounded mb-3" />
      <div className="h-5 w-3/4 bg-slate-700 rounded mb-2" />
      <div className="h-4 w-1/2 bg-slate-700 rounded mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-16 bg-slate-700 rounded-full" />
        <div className="h-6 w-20 bg-slate-700 rounded-full" />
      </div>
      <div className="h-4 w-1/3 bg-slate-700 rounded mb-4" />
      <div className="h-9 w-full bg-slate-700 rounded-lg" />
    </div>
  );
}

// ── Scholarship Card ───────────────────────────────────────────────────────

function ScholarshipCard({ scholarship, hasProfile }: { scholarship: Scholarship; hasProfile: boolean }) {
  const amountLabel = formatAmount(scholarship);
  const { label: deadlineLabel, urgent: deadlineUrgent } = formatDeadline(scholarship.deadline);
  const typeBadgeClass = TYPE_BADGE_COLORS[scholarship.scholarshipType] ?? "bg-slate-700 text-slate-300 border-slate-600";
  const typeLabel = TYPE_OPTIONS.find((t) => t.value === scholarship.scholarshipType)?.label ?? scholarship.scholarshipType;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 hover:-translate-y-1 transition-all flex flex-col gap-3">
      {/* Amount */}
      <div className="text-2xl font-bold text-emerald-400">{amountLabel}</div>

      {/* Title */}
      <div>
        <h3 className="font-bold text-white text-base leading-snug line-clamp-2">{scholarship.title}</h3>
        <p className="text-slate-400 text-sm mt-0.5 truncate">{scholarship.provider}</p>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap gap-2">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${typeBadgeClass}`}>
          {typeLabel}
        </span>
        {scholarship.essayRequired && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-rose-500/10 text-rose-400 border-rose-500/20 flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Essay Required
          </span>
        )}
      </div>

      {/* Match score */}
      {hasProfile && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-emerald-300">{scholarship.matchScore}% match</span>
          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              style={{ width: `${scholarship.matchScore}%` }}
            />
          </div>
        </div>
      )}

      {/* Deadline */}
      <div className="flex items-center gap-1.5">
        <Calendar className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
        <span className={`text-sm ${deadlineUrgent ? "text-red-400 font-medium" : "text-slate-400"}`}>
          {deadlineLabel}
        </span>
      </div>

      {/* CTA */}
      <Link
        href={`/student/scholarships/${scholarship.id}`}
        className="mt-auto block w-full text-center px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors text-sm font-medium"
      >
        View Details
      </Link>
    </div>
  );
}

// ── Filter Select ──────────────────────────────────────────────────────────

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer hover:border-slate-600 transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function ScholarshipBrowsePage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [discovering, setDiscovering] = useState(false);
  const [hasProfile, setHasProfile] = useState(true);

  // Filters & sort
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [amountFilter, setAmountFilter] = useState("");
  const [deadlineFilter, setDeadlineFilter] = useState("");
  const [fieldFilter, setFieldFilter] = useState("");
  const [sortBy, setSortBy] = useState("match");

  const fetchScholarships = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/scholarships");
      if (res.status === 401 || res.status === 400) {
        setHasProfile(false);
        setScholarships([]);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch scholarships");
      const data: Scholarship[] = await res.json();
      setScholarships(data);
    } catch (err) {
      console.error(err);
      setError("Could not load scholarships. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  const handleDiscover = async () => {
    setDiscovering(true);
    try {
      const res = await fetch("/api/student/scholarships/discover", { method: "POST" });
      if (res.ok) {
        await fetchScholarships();
      }
    } catch (err) {
      console.error("Discover failed:", err);
    } finally {
      setDiscovering(false);
    }
  };

  const hasFilters = Boolean(typeFilter || amountFilter || deadlineFilter || fieldFilter || search);

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("");
    setAmountFilter("");
    setDeadlineFilter("");
    setFieldFilter("");
  };

  const filtered = useMemo(() => {
    let list = [...scholarships];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.provider.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }

    // Type
    if (typeFilter) {
      list = list.filter((s) => s.scholarshipType === typeFilter);
    }

    // Amount
    list = list.filter((s) => matchesAmountFilter(s, amountFilter));

    // Deadline
    list = list.filter((s) => matchesDeadlineFilter(s, deadlineFilter));

    // Field
    list = list.filter((s) => matchesFieldFilter(s, fieldFilter));

    // Sort
    switch (sortBy) {
      case "match":
        list.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
        break;
      case "deadline":
        list.sort((a, b) => {
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        });
        break;
      case "amount":
        list.sort((a, b) => getAmountValue(b) - getAmountValue(a));
        break;
      case "recent":
        // Keep original server order (newest last in DB tend to be most recent sources)
        // Reverse so newest appear first
        list.reverse();
        break;
    }

    return list;
  }, [scholarships, search, typeFilter, amountFilter, deadlineFilter, fieldFilter, sortBy]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-emerald-400" />
            Browse Scholarships
          </h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">
            Find and apply for scholarships that match your profile
          </p>
        </div>
        <Button
          onClick={handleDiscover}
          disabled={discovering}
          variant="outline"
          className="w-full sm:w-auto flex items-center gap-2"
        >
          {discovering ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Discovering...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-emerald-400" />
              Discover New
            </>
          )}
        </Button>
      </div>

      {/* ── Profile warning ── */}
      {!hasProfile && !loading && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-medium text-sm">Complete your profile to see scholarships</p>
            <p className="text-amber-400/70 text-xs mt-0.5">
              We need your profile information to match you with the right scholarships.
            </p>
            <Link href="/student/onboarding">
              <Button size="sm" variant="primary" className="mt-2 text-xs">
                Complete Profile
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
          <Button size="sm" variant="ghost" onClick={fetchScholarships} className="ml-auto text-red-400 hover:text-red-300">
            Retry
          </Button>
        </div>
      )}

      {/* ── Search Bar ── */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by title, provider, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Filter Row ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-slate-400 text-sm">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters:</span>
        </div>

        <FilterSelect value={typeFilter} onChange={setTypeFilter} options={TYPE_OPTIONS} />
        <FilterSelect value={amountFilter} onChange={setAmountFilter} options={AMOUNT_OPTIONS} />
        <FilterSelect value={deadlineFilter} onChange={setDeadlineFilter} options={DEADLINE_OPTIONS} />
        <FilterSelect value={fieldFilter} onChange={setFieldFilter} options={FIELD_OPTIONS} />

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white px-3 py-2 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors bg-slate-800/50"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* ── Stats + Sort Row ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-slate-400 text-sm">
          {loading ? (
            <span className="inline-block h-4 w-40 bg-slate-800 rounded animate-pulse" />
          ) : (
            <>
              Showing{" "}
              <span className="text-white font-medium">{filtered.length}</span>{" "}
              of{" "}
              <span className="text-white font-medium">{scholarships.length}</span>{" "}
              scholarship{scholarships.length !== 1 ? "s" : ""}
            </>
          )}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-sm hidden sm:inline">Sort by:</span>
          <FilterSelect
            value={sortBy}
            onChange={setSortBy}
            options={SORT_OPTIONS}
          />
        </div>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <ScholarshipCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-slate-800/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-slate-600" />
          </div>
          {hasFilters ? (
            <>
              <p className="text-white font-medium mb-2">No scholarships match your filters</p>
              <p className="text-slate-400 text-sm mb-4">Try adjusting your search or clearing filters.</p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </>
          ) : (
            <>
              <p className="text-white font-medium mb-2">No scholarships found</p>
              <p className="text-slate-400 text-sm mb-4">
                Discover new scholarships to get started.
              </p>
              <Button variant="primary" size="sm" onClick={handleDiscover} disabled={discovering}>
                {discovering ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Discovering...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Discover Scholarships
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((scholarship) => (
            <ScholarshipCard
              key={scholarship.id}
              scholarship={scholarship}
              hasProfile={hasProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
}
