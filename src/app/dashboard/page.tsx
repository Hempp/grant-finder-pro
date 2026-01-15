"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";

interface Grant {
  id: string;
  title: string;
  funder: string;
  amount: number;
  deadline: string;
  matchScore: number | null;
  status: string;
}

interface Application {
  id: string;
  status: string;
  narrative: string | null;
  budget: string | null;
  responses: string | null;
  updatedAt: string;
  grant: {
    id: string;
    title: string;
    deadline: string;
    amount: number;
  };
}

interface DashboardStats {
  grantsFound: number;
  applicationsCount: number;
  totalRequested: number;
  avgMatchScore: number;
  inProgressCount: number;
}

const statusColors: Record<string, "default" | "success" | "warning" | "info"> = {
  draft: "default",
  in_progress: "warning",
  ready_for_review: "info",
  submitted: "success",
  awarded: "success",
  rejected: "default",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  in_progress: "In Progress",
  ready_for_review: "Ready for Review",
  submitted: "Submitted",
  awarded: "Awarded",
  rejected: "Rejected",
};

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

function calculateApplicationProgress(app: Application): number {
  const fields = [app.responses, app.narrative, app.budget];
  const filled = fields.filter((f) => f && String(f).trim() !== "").length;
  return Math.round((filled / fields.length) * 100);
}

export default function DashboardPage() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    grantsFound: 0,
    applicationsCount: 0,
    totalRequested: 0,
    avgMatchScore: 0,
    inProgressCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [grantsRes, appsRes] = await Promise.all([
          fetch("/api/grants"),
          fetch("/api/applications"),
        ]);

        const grantsData = await grantsRes.json();
        const appsData = await appsRes.json();

        const grantsList = grantsData.grants || [];
        const appsList = Array.isArray(appsData) ? appsData : [];

        setGrants(grantsList.slice(0, 3));
        setApplications(appsList.slice(0, 3));

        // Calculate stats
        const inProgress = appsList.filter(
          (a: Application) => ["draft", "in_progress"].includes(a.status)
        ).length;

        const totalRequested = appsList.reduce(
          (sum: number, app: Application) => sum + (app.grant?.amount || 0),
          0
        );

        const avgScore =
          grantsList.length > 0
            ? Math.round(
                grantsList.reduce((sum: number, g: Grant) => sum + (g.matchScore || 0), 0) /
                  grantsList.length
              )
            : 0;

        setStats({
          grantsFound: grantsList.length,
          applicationsCount: appsList.length,
          totalRequested,
          avgMatchScore: avgScore,
          inProgressCount: inProgress,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  const statCards = [
    { label: "Grants Found", value: String(stats.grantsFound), icon: Search, change: "Available opportunities" },
    { label: "Applications", value: String(stats.applicationsCount), icon: FileText, change: `${stats.inProgressCount} in progress` },
    { label: "Total Requested", value: formatCurrency(stats.totalRequested), icon: DollarSign, change: `Across ${stats.applicationsCount} apps` },
    { label: "Match Score Avg", value: `${stats.avgMatchScore}%`, icon: TrendingUp, change: stats.avgMatchScore >= 70 ? "Above average" : "Build your profile" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back! Here&apos;s your grant overview.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/grants">
            <Button variant="secondary">
              <Search className="h-4 w-4 mr-2" />
              Find Grants
            </Button>
          </Link>
          <Link href="/dashboard/documents">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                  <p className="text-emerald-400 text-sm mt-1">{stat.change}</p>
                </div>
                <div className="bg-emerald-500/20 p-3 rounded-xl">
                  <stat.icon className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Recent Grants */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Top Matching Grants</h2>
            <Link href="/dashboard/grants" className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {grants.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No grants found. Complete your profile to get personalized matches.</p>
            ) : (
              grants.map((grant) => (
                <Link
                  key={grant.id}
                  href={`/dashboard/grants/${grant.id}/apply`}
                  className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition block"
                >
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{grant.title}</h3>
                    <p className="text-slate-400 text-sm">{grant.funder}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-emerald-400 font-semibold">{formatCurrency(grant.amount)}</span>
                      <span className="text-slate-500 text-sm flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(grant.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{grant.matchScore || 0}%</div>
                    <div className="text-slate-500 text-xs">Match</div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Recent Applications</h2>
            <Link href="/dashboard/applications" className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {applications.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No applications yet. Start by applying to a grant!</p>
            ) : (
              applications.map((app) => {
                const progress = calculateApplicationProgress(app);
                return (
                  <div
                    key={app.id}
                    className="p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium">{app.grant.title}</h3>
                      <Badge variant={statusColors[app.status] || "default"}>
                        {statusLabels[app.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-slate-400 text-sm">{progress}%</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-slate-500 text-sm flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Due {new Date(app.grant.deadline).toLocaleDateString()}
                      </span>
                      {app.status === "ready_for_review" && (
                        <Button size="sm" variant="ghost" className="text-emerald-400">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      )}
                      {app.status === "in_progress" && (
                        <Link href={`/dashboard/grants/${app.grant.id}/apply`}>
                          <Button size="sm" variant="ghost" className="text-amber-400">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Continue
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-4">
            <Link
              href="/dashboard/organization"
              className="flex flex-col items-center p-6 bg-slate-900/50 rounded-xl hover:bg-slate-900 transition text-center"
            >
              <div className="bg-emerald-500/20 p-3 rounded-xl mb-3">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
              <span className="text-white font-medium">Complete Profile</span>
              <span className="text-slate-500 text-sm mt-1">Improve match accuracy</span>
            </Link>
            <Link
              href="/dashboard/documents"
              className="flex flex-col items-center p-6 bg-slate-900/50 rounded-xl hover:bg-slate-900 transition text-center"
            >
              <div className="bg-blue-500/20 p-3 rounded-xl mb-3">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <span className="text-white font-medium">Upload Pitch Deck</span>
              <span className="text-slate-500 text-sm mt-1">Auto-extract info</span>
            </Link>
            <Link
              href="/dashboard/grants"
              className="flex flex-col items-center p-6 bg-slate-900/50 rounded-xl hover:bg-slate-900 transition text-center"
            >
              <div className="bg-purple-500/20 p-3 rounded-xl mb-3">
                <Search className="h-6 w-6 text-purple-400" />
              </div>
              <span className="text-white font-medium">Discover Grants</span>
              <span className="text-slate-500 text-sm mt-1">Find new opportunities</span>
            </Link>
            <Link
              href="/dashboard/applications"
              className="flex flex-col items-center p-6 bg-slate-900/50 rounded-xl hover:bg-slate-900 transition text-center"
            >
              <div className="bg-amber-500/20 p-3 rounded-xl mb-3">
                <Clock className="h-6 w-6 text-amber-400" />
              </div>
              <span className="text-white font-medium">Track Deadlines</span>
              <span className="text-slate-500 text-sm mt-1">Never miss a date</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
