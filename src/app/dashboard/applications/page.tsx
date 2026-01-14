"use client";

import { useState } from "react";
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
  Filter,
  Search,
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

const mockApplications: Application[] = [
  {
    id: "1",
    grantId: "1",
    grantTitle: "SBIR Phase I - AI/ML Innovation",
    funder: "National Science Foundation",
    amount: "$275,000",
    deadline: "2024-03-15",
    status: "in_progress",
    progress: 65,
    createdAt: "2024-02-01",
    updatedAt: "2024-02-14",
  },
  {
    id: "2",
    grantId: "3",
    grantTitle: "Tech Startup Grant Program",
    funder: "State of California",
    amount: "$150,000",
    deadline: "2024-03-20",
    status: "ready_for_review",
    progress: 100,
    createdAt: "2024-01-28",
    updatedAt: "2024-02-12",
  },
  {
    id: "3",
    grantId: "4",
    grantTitle: "Innovation Fund 2024",
    funder: "Tech Foundation",
    amount: "$100,000",
    deadline: "2024-02-28",
    status: "submitted",
    progress: 100,
    createdAt: "2024-01-15",
    updatedAt: "2024-02-25",
    submittedAt: "2024-02-25",
  },
  {
    id: "4",
    grantId: "5",
    grantTitle: "Small Business Growth Grant",
    funder: "SBA",
    amount: "$50,000",
    deadline: "2024-01-31",
    status: "awarded",
    progress: 100,
    createdAt: "2024-01-01",
    updatedAt: "2024-02-10",
    submittedAt: "2024-01-25",
  },
  {
    id: "5",
    grantId: "6",
    grantTitle: "Research & Development Grant",
    funder: "DOE",
    amount: "$200,000",
    deadline: "2024-01-15",
    status: "rejected",
    progress: 100,
    createdAt: "2023-12-01",
    updatedAt: "2024-02-01",
    submittedAt: "2024-01-10",
  },
  {
    id: "6",
    grantId: "7",
    grantTitle: "Startup Accelerator Grant",
    funder: "Y Combinator",
    amount: "$125,000",
    deadline: "2024-04-15",
    status: "draft",
    progress: 20,
    createdAt: "2024-02-10",
    updatedAt: "2024-02-10",
  },
];

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
  const [applications] = useState<Application[]>(mockApplications);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Applications</h1>
          <p className="text-slate-400 mt-1">
            Track and manage your grant applications
          </p>
        </div>
        <Link href="/dashboard/grants">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-slate-700 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-slate-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-slate-400 text-sm">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-amber-500/20 p-3 rounded-lg">
              <AlertCircle className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
              <p className="text-slate-400 text-sm">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.submitted}</p>
              <p className="text-slate-400 text-sm">Submitted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-emerald-500/20 p-3 rounded-lg">
              <Award className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.awarded}</p>
              <p className="text-slate-400 text-sm">Awarded</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
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
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {filter === "all" ? "All Applications" : filterOptions.find((f) => f.value === filter)?.label}
          </h2>
          <span className="text-slate-400 text-sm">{filteredApplications.length} applications</span>
        </CardHeader>
        <CardContent className="p-0">
          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-white font-medium mb-2">No applications found</p>
              <p className="text-slate-400 mb-4">Start a new application from the grants page</p>
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
                    className="p-6 hover:bg-slate-800/50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Link
                            href={`/dashboard/applications/${app.id}`}
                            className="text-lg font-semibold text-white hover:text-emerald-400 transition"
                          >
                            {app.grantTitle}
                          </Link>
                          <Badge variant={status.color}>
                            <status.icon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                          {isUrgent && (
                            <Badge variant="danger">
                              <Clock className="h-3 w-3 mr-1" />
                              {daysUntil} days left
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span>{app.funder}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-medium">{app.amount}</span>
                          <span>•</span>
                          <span>
                            {app.submittedAt
                              ? `Submitted ${new Date(app.submittedAt).toLocaleDateString()}`
                              : `Due ${new Date(app.deadline).toLocaleDateString()}`}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        {!["submitted", "awarded", "rejected"].includes(app.status) && (
                          <div className="flex items-center gap-4 mt-4">
                            <div className="flex-1 max-w-xs">
                              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    app.progress === 100 ? "bg-emerald-500" : "bg-amber-500"
                                  }`}
                                  style={{ width: `${app.progress}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-slate-400 text-sm">{app.progress}% complete</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {app.status === "in_progress" && (
                          <Link href={`/dashboard/applications/${app.id}`}>
                            <Button size="sm">
                              Continue
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        )}
                        {app.status === "ready_for_review" && (
                          <Link href={`/dashboard/applications/${app.id}`}>
                            <Button size="sm" variant="secondary">
                              Review & Submit
                            </Button>
                          </Link>
                        )}
                        {app.status === "draft" && (
                          <Link href={`/dashboard/applications/${app.id}`}>
                            <Button size="sm" variant="ghost">
                              Edit Draft
                            </Button>
                          </Link>
                        )}
                        <button className="p-2 text-slate-400 hover:text-white transition">
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
