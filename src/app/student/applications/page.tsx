"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Award,
  Search,
  Loader2,
  ArrowRight,
  Eye,
  Flag,
  GraduationCap,
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
  submissionMethod: string;
  url: string | null;
}

interface ApiApplication {
  id: string;
  scholarshipId: string;
  status: string;
  essayDraft: string | null;
  essayFinal: string | null;
  responses: string | null;
  submissionMethod: string | null;
  submittedAt: string | null;
  awardedAt: string | null;
  rejectedAt: string | null;
  awardAmount: number | null;
  createdAt: string;
  updatedAt: string;
  scholarship: Scholarship;
}

interface Application {
  id: string;
  scholarshipId: string;
  scholarshipTitle: string;
  provider: string;
  amount: string;
  deadline: string | null;
  status: string;
  submissionMethod: string;
  submittedAt: string | null;
  awardedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
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

const submissionMethodConfig: Record<
  string,
  { label: string; color: "default" | "info" | "warning" }
> = {
  portal: { label: "Online Portal", color: "info" },
  email: { label: "Email", color: "warning" },
  mail: { label: "Mail", color: "default" },
};

const filterOptions = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "submitted", label: "Submitted" },
  { value: "completed", label: "Completed" },
];

function formatAmount(scholarship: Scholarship): string {
  if (scholarship.amount) return scholarship.amount;
  if (scholarship.amountMin && scholarship.amountMax) {
    return `$${scholarship.amountMin.toLocaleString()}–$${scholarship.amountMax.toLocaleString()}`;
  }
  if (scholarship.amountMax) return `Up to $${scholarship.amountMax.toLocaleString()}`;
  if (scholarship.amountMin) return `From $${scholarship.amountMin.toLocaleString()}`;
  return "Amount varies";
}

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchApplications() {
      try {
        const res = await fetch("/api/student/applications");
        if (res.ok) {
          const data: ApiApplication[] = await res.json();
          const transformed: Application[] = data.map((app) => ({
            id: app.id,
            scholarshipId: app.scholarshipId,
            scholarshipTitle: app.scholarship.title,
            provider: app.scholarship.provider,
            amount: formatAmount(app.scholarship),
            deadline: app.scholarship.deadline,
            status: app.status,
            submissionMethod:
              app.submissionMethod ?? app.scholarship.submissionMethod ?? "portal",
            submittedAt: app.submittedAt ?? null,
            awardedAt: app.awardedAt ?? null,
            rejectedAt: app.rejectedAt ?? null,
            createdAt: app.createdAt,
          }));
          setApplications(transformed);
        }
      } catch (error) {
        console.error("Failed to fetch student applications:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, []);

  const getDaysUntilDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const filteredApplications = applications.filter((app) => {
    if (
      searchQuery &&
      !app.scholarshipTitle.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (filter === "active") return ["draft", "ready"].includes(app.status);
    if (filter === "submitted") return app.status === "submitted";
    if (filter === "completed") return ["awarded", "rejected"].includes(app.status);
    return true;
  });

  const stats = {
    total: applications.length,
    inProgress: applications.filter((a) => ["draft", "ready"].includes(a.status)).length,
    submitted: applications.filter((a) => a.status === "submitted").length,
    awarded: applications.filter((a) => a.status === "awarded").length,
  };

  const isPastDeadline = (deadline: string | null) => {
    if (!deadline) return false;
    return new Date(deadline).getTime() < Date.now();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My Applications</h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">
            Track and manage your scholarship applications
          </p>
        </div>
        <Link href="/student/apply">
          <Button className="w-full sm:w-auto">
            <GraduationCap className="h-4 w-4 mr-2" />
            Apply to Scholarships
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
            <div className="bg-slate-700 p-2 sm:p-3 rounded-lg">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-slate-300" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-slate-400 text-xs sm:text-sm">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
            <div className="bg-amber-500/20 p-2 sm:p-3 rounded-lg">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.inProgress}</p>
              <p className="text-slate-400 text-xs sm:text-sm">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
            <div className="bg-emerald-500/20 p-2 sm:p-3 rounded-lg">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.submitted}</p>
              <p className="text-slate-400 text-xs sm:text-sm">Submitted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
            <div className="bg-green-500/20 p-2 sm:p-3 rounded-lg">
              <Award className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.awarded}</p>
              <p className="text-slate-400 text-xs sm:text-sm">Awarded</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search scholarships..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
                filter === opt.value
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-white">
            {filter === "all"
              ? "All Applications"
              : filterOptions.find((f) => f.value === filter)?.label}
          </h2>
          <span className="text-slate-400 text-xs sm:text-sm">
            {filteredApplications.length} application{filteredApplications.length !== 1 ? "s" : ""}
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {filteredApplications.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <GraduationCap className="h-10 w-10 sm:h-12 sm:w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-white font-medium mb-2 text-sm sm:text-base">
                No applications yet
              </p>
              <p className="text-slate-400 mb-4 text-sm">
                Find scholarships that match your profile and start applying
              </p>
              <Link href="/student/scholarships">
                <Button>Find Scholarships</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {filteredApplications.map((app) => {
                const status = statusConfig[app.status] ?? statusConfig.draft;
                const daysUntil = getDaysUntilDeadline(app.deadline);
                const isUrgent =
                  daysUntil !== null &&
                  daysUntil <= 7 &&
                  daysUntil > 0 &&
                  !["submitted", "awarded", "rejected"].includes(app.status);
                const methodCfg =
                  submissionMethodConfig[app.submissionMethod] ??
                  submissionMethodConfig.portal;
                const showReportOutcome =
                  app.status === "submitted" && isPastDeadline(app.deadline);

                return (
                  <div
                    key={app.id}
                    className="p-4 sm:p-6 hover:bg-slate-800/50 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <div className="flex flex-wrap items-start gap-2 mb-2">
                          <Link
                            href={`/student/applications/${app.id}`}
                            className="text-base sm:text-lg font-bold text-white hover:text-emerald-400 transition line-clamp-2"
                          >
                            {app.scholarshipTitle}
                          </Link>
                        </div>

                        {/* Status + urgency badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant={status.color}>
                            <status.icon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                          <Badge variant={methodCfg.color}>
                            {methodCfg.label}
                          </Badge>
                          {isUrgent && (
                            <Badge variant="danger">
                              <Clock className="h-3 w-3 mr-1" />
                              {daysUntil}d left
                            </Badge>
                          )}
                        </div>

                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-400">
                          <span className="truncate max-w-[200px] sm:max-w-none">
                            {app.provider}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="text-emerald-400 font-medium">{app.amount}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="text-slate-500">
                            {app.submittedAt
                              ? `Submitted ${new Date(app.submittedAt).toLocaleDateString()}`
                              : app.deadline
                              ? `Due ${new Date(app.deadline).toLocaleDateString()}`
                              : "No deadline listed"}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t border-slate-700/50 sm:border-0 flex-shrink-0">
                        {app.status === "draft" && (
                          <Link href={`/student/applications/${app.id}`}>
                            <Button size="sm" variant="ghost">
                              <FileText className="h-4 w-4 mr-1.5" />
                              Review Draft
                            </Button>
                          </Link>
                        )}
                        {app.status === "ready" && (
                          <Link href={`/student/applications/${app.id}`}>
                            <Button size="sm">
                              Review Draft
                              <ArrowRight className="h-4 w-4 ml-1.5" />
                            </Button>
                          </Link>
                        )}
                        {["submitted", "awarded", "rejected"].includes(app.status) && (
                          <Link href={`/student/applications/${app.id}`}>
                            <Button size="sm" variant="secondary">
                              <Eye className="h-4 w-4 mr-1.5" />
                              View
                            </Button>
                          </Link>
                        )}
                        {showReportOutcome && (
                          <Link href={`/student/applications/${app.id}?tab=outcome`}>
                            <Button size="sm" variant="ghost" className="text-amber-400 hover:text-amber-300">
                              <Flag className="h-4 w-4 mr-1.5" />
                              Report Outcome
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
