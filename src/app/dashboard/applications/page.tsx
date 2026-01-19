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
  MoreVertical,
  ArrowRight,
  Plus,
  Search,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";

interface Application {
  id: string;
  grantId: string;
  grantTitle: string;
  funder: string;
  amount: string;
  deadline: string;
  status: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

interface ApiApplication {
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
  grant: {
    id: string;
    title: string;
    funder: string;
    amount: number;
    deadline: string;
  };
}

const statusConfig: Record<string, { label: string; color: "default" | "success" | "warning" | "danger" | "info"; icon: React.ElementType }> = {
  draft: { label: "Draft", color: "default", icon: FileText },
  in_progress: { label: "In Progress", color: "warning", icon: AlertCircle },
  ready_for_review: { label: "Ready for Review", color: "info", icon: CheckCircle },
  submitted: { label: "Submitted", color: "success", icon: CheckCircle },
  pending: { label: "Pending Review", color: "info", icon: Clock },
  awarded: { label: "Awarded", color: "success", icon: Award },
  rejected: { label: "Rejected", color: "danger", icon: XCircle },
};

const filterOptions = [
  { value: "all", label: "All Applications" },
  { value: "active", label: "Active" },
  { value: "submitted", label: "Submitted" },
  { value: "completed", label: "Completed" },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch applications from API
  useEffect(() => {
    async function fetchApplications() {
      try {
        const res = await fetch("/api/applications");
        if (res.ok) {
          const data: ApiApplication[] = await res.json();
          // Transform API data to component format
          const transformed: Application[] = data.map((app) => {
            // Calculate progress based on filled fields
            let progress = 0;
            if (app.responses) progress += 33;
            if (app.narrative) progress += 34;
            if (app.budget) progress += 33;
            if (["submitted", "awarded", "rejected"].includes(app.status)) {
              progress = 100;
            }

            return {
              id: app.id,
              grantId: app.grantId,
              grantTitle: app.grant.title,
              funder: app.grant.funder,
              amount: `$${app.grant.amount.toLocaleString()}`,
              deadline: app.grant.deadline,
              status: app.status,
              progress,
              createdAt: app.createdAt,
              updatedAt: app.updatedAt,
              submittedAt: app.submittedAt,
            };
          });
          setApplications(transformed);
        }
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, []);

  const filteredApplications = applications.filter((app) => {
    if (searchQuery && !app.grantTitle.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filter === "active") return ["draft", "in_progress", "ready_for_review"].includes(app.status);
    if (filter === "submitted") return app.status === "submitted";
    if (filter === "completed") return ["awarded", "rejected"].includes(app.status);
    return true;
  });

  const stats = {
    total: applications.length,
    inProgress: applications.filter((a) => ["draft", "in_progress", "ready_for_review"].includes(a.status)).length,
    submitted: applications.filter((a) => a.status === "submitted").length,
    awarded: applications.filter((a) => a.status === "awarded").length,
  };

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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Applications</h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">
            Track and manage your grant applications
          </p>
        </div>
        <Link href="/dashboard/grants">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Application
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
            <div className="bg-blue-500/20 p-2 sm:p-3 rounded-lg">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.submitted}</p>
              <p className="text-slate-400 text-xs sm:text-sm">Submitted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
            <div className="bg-emerald-500/20 p-2 sm:p-3 rounded-lg">
              <Award className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
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
            placeholder="Search applications..."
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
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            {filter === "all" ? "All Applications" : filterOptions.find((f) => f.value === filter)?.label}
          </h2>
          <span className="text-slate-400 text-xs sm:text-sm">{filteredApplications.length} applications</span>
        </CardHeader>
        <CardContent className="p-0">
          {filteredApplications.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-white font-medium mb-2 text-sm sm:text-base">No applications found</p>
              <p className="text-slate-400 mb-4 text-sm">Start a new application from the grants page</p>
              <Link href="/dashboard/grants">
                <Button>Find Grants</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {filteredApplications.map((app) => {
                const status = statusConfig[app.status];
                const daysUntil = getDaysUntilDeadline(app.deadline);
                const isUrgent = daysUntil <= 7 && daysUntil > 0 && !["submitted", "awarded", "rejected"].includes(app.status);

                return (
                  <div
                    key={app.id}
                    className="p-4 sm:p-6 hover:bg-slate-800/50 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Title and badges */}
                        <div className="flex flex-wrap items-start gap-2 mb-2">
                          <Link
                            href={`/dashboard/applications/${app.id}`}
                            className="text-base sm:text-lg font-semibold text-white hover:text-emerald-400 transition line-clamp-2"
                          >
                            {app.grantTitle}
                          </Link>
                        </div>

                        {/* Status badges - mobile row */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant={status.color}>
                            <status.icon className="h-3 w-3 mr-1" />
                            {status.label}
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
                          <span className="truncate max-w-[150px] sm:max-w-none">{app.funder}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="text-emerald-400 font-medium">{app.amount}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="text-slate-500">
                            {app.submittedAt
                              ? `Submitted ${new Date(app.submittedAt).toLocaleDateString()}`
                              : `Due ${new Date(app.deadline).toLocaleDateString()}`}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        {!["submitted", "awarded", "rejected"].includes(app.status) && (
                          <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4">
                            <div className="flex-1 max-w-full sm:max-w-xs">
                              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    app.progress === 100 ? "bg-emerald-500" : "bg-amber-500"
                                  }`}
                                  style={{ width: `${app.progress}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-slate-400 text-xs sm:text-sm whitespace-nowrap">{app.progress}%</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t border-slate-700/50 sm:border-0">
                        {app.status === "in_progress" && (
                          <Link href={`/dashboard/applications/${app.id}`} className="flex-1 sm:flex-none">
                            <Button size="sm" className="w-full sm:w-auto">
                              <span className="sm:hidden">Continue</span>
                              <span className="hidden sm:inline">Continue</span>
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        )}
                        {app.status === "ready_for_review" && (
                          <Link href={`/dashboard/applications/${app.id}`} className="flex-1 sm:flex-none">
                            <Button size="sm" variant="secondary" className="w-full sm:w-auto">
                              <span className="sm:hidden">Review</span>
                              <span className="hidden sm:inline">Review & Submit</span>
                            </Button>
                          </Link>
                        )}
                        {app.status === "draft" && (
                          <Link href={`/dashboard/applications/${app.id}`} className="flex-1 sm:flex-none">
                            <Button size="sm" variant="ghost" className="w-full sm:w-auto">
                              Edit Draft
                            </Button>
                          </Link>
                        )}
                        <button className="p-2 text-slate-400 hover:text-white transition flex-shrink-0">
                          <MoreVertical className="h-5 w-5" />
                        </button>
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
