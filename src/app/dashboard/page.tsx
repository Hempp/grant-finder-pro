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
  Sparkles,
  Target,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, StatsCard } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Skeleton, SkeletonGrantCard } from "@/components/ui/skeleton";
import { UpgradePrompt } from "@/components/subscription/UpgradePrompt";
import { useSubscription } from "@/hooks/useSubscription";

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

function getDeadlineStatus(deadline: string): { label: string; color: string } {
  const daysUntil = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysUntil < 0) return { label: "Expired", color: "text-slate-500" };
  if (daysUntil <= 7) return { label: `${daysUntil}d left`, color: "text-red-400" };
  if (daysUntil <= 30) return { label: `${daysUntil}d left`, color: "text-amber-400" };
  return { label: `${daysUntil}d left`, color: "text-slate-400" };
}

// Loading skeleton for stats
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <Skeleton width="60%" height={14} />
                <Skeleton width="40%" height={32} />
                <Skeleton width="80%" height={14} />
              </div>
              <Skeleton variant="circle" width={48} height={48} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
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
  const { isPro, canStartTrial } = useSubscription();

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

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            Dashboard
            <Sparkles className="h-6 w-6 text-emerald-400" />
          </h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">Welcome back! Here&apos;s your grant overview.</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Link href="/dashboard/grants" className="flex-1 sm:flex-none">
            <Button variant="secondary" className="w-full sm:w-auto text-sm sm:text-base">
              <Search className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Find</span> Grants
            </Button>
          </Link>
          <Link href="/dashboard/documents" className="flex-1 sm:flex-none">
            <Button variant="gradient" className="w-full sm:w-auto text-sm sm:text-base">
              <Plus className="h-4 w-4 mr-1 sm:mr-2" />
              Upload
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <StatsCard
            title="Grants Found"
            value={stats.grantsFound}
            description="Available opportunities"
            icon={<Search className="h-6 w-6" />}
          />
          <StatsCard
            title="Applications"
            value={stats.applicationsCount}
            description={`${stats.inProgressCount} in progress`}
            icon={<FileText className="h-6 w-6" />}
          />
          <StatsCard
            title="Total Requested"
            value={formatCurrency(stats.totalRequested)}
            description={`Across ${stats.applicationsCount} apps`}
            icon={<DollarSign className="h-6 w-6" />}
          />
          <StatsCard
            title="Match Score"
            value={`${stats.avgMatchScore}%`}
            description={stats.avgMatchScore >= 70 ? "Above average" : "Build your profile"}
            trend={stats.avgMatchScore >= 70 ? { value: 12, isPositive: true, label: "vs last month" } : undefined}
            icon={<Target className="h-6 w-6" />}
          />
        </div>
      )}

      {/* Upgrade Prompt for Free Users */}
      {!isPro && !loading && (
        <div className="mb-6 sm:mb-8 animate-fade-in-up">
          <UpgradePrompt
            feature="Unlimited Grant Matches"
            description={canStartTrial
              ? "Start your 14-day free trial to unlock unlimited AI-powered grant matches and Auto-Apply."
              : "Upgrade to Pro for unlimited AI-powered grant matches, Auto-Apply, and daily alerts."
            }
            variant="banner"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Recent Grants */}
        <Card variant="elevated" hover glow>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-500/20 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Top Matching Grants</h2>
            </div>
            <Link href="/dashboard/grants" className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1 group">
              View all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <>
                <SkeletonGrantCard />
                <SkeletonGrantCard />
              </>
            ) : grants.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-slate-800/50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-slate-600" />
                </div>
                <p className="text-slate-400 mb-2">No grants found yet</p>
                <p className="text-slate-500 text-sm mb-4">Complete your profile to get personalized matches.</p>
                <Link href="/dashboard/organization">
                  <Button variant="outline" size="sm">
                    Complete Profile
                  </Button>
                </Link>
              </div>
            ) : (
              grants.map((grant, index) => {
                const deadline = getDeadlineStatus(grant.deadline);
                return (
                  <Link
                    key={grant.id}
                    href={`/dashboard/grants/${grant.id}/apply`}
                    className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl hover:bg-slate-800/80 transition-all duration-200 block border border-transparent hover:border-slate-700 group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate group-hover:text-emerald-400 transition-colors">{grant.title}</h3>
                      <p className="text-slate-400 text-sm truncate">{grant.funder}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-emerald-400 font-semibold">{formatCurrency(grant.amount)}</span>
                        <span className={`text-sm flex items-center gap-1 ${deadline.color}`}>
                          <Clock className="h-3 w-3" />
                          {deadline.label}
                        </span>
                      </div>
                    </div>
                    <div className="text-center ml-4">
                      <div className="relative">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-slate-700" />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${(grant.matchScore || 0) * 1.76} 176`}
                            className="text-emerald-400"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-emerald-400">{grant.matchScore || 0}%</span>
                        </div>
                      </div>
                      <div className="text-slate-500 text-xs mt-1">Match</div>
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card variant="elevated" hover glow glowColor="purple">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Recent Applications</h2>
            </div>
            <Link href="/dashboard/applications" className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 group">
              View all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <>
                <SkeletonGrantCard />
                <SkeletonGrantCard />
              </>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-slate-800/50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-slate-600" />
                </div>
                <p className="text-slate-400 mb-2">No applications yet</p>
                <p className="text-slate-500 text-sm mb-4">Start by applying to a matching grant!</p>
                <Link href="/dashboard/grants">
                  <Button variant="outline" size="sm">
                    Browse Grants
                  </Button>
                </Link>
              </div>
            ) : (
              applications.map((app, index) => {
                const progress = calculateApplicationProgress(app);
                const deadline = getDeadlineStatus(app.grant.deadline);
                return (
                  <div
                    key={app.id}
                    className="p-4 bg-slate-900/50 rounded-xl hover:bg-slate-800/80 transition-all duration-200 border border-transparent hover:border-slate-700"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium truncate flex-1">{app.grant.title}</h3>
                      <Badge variant={statusColors[app.status] || "default"}>
                        {statusLabels[app.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1 mr-4">
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-slate-400 text-sm font-medium">{progress}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm flex items-center gap-1 ${deadline.color}`}>
                        <Calendar className="h-3 w-3" />
                        Due {new Date(app.grant.deadline).toLocaleDateString()}
                      </span>
                      {app.status === "ready_for_review" && (
                        <Link href={`/dashboard/applications/${app.id}`}>
                          <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-emerald-300">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </Link>
                      )}
                      {app.status === "in_progress" && (
                        <Link href={`/dashboard/grants/${app.grant.id}/apply`}>
                          <Button size="sm" variant="ghost" className="text-amber-400 hover:text-amber-300">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Continue
                          </Button>
                        </Link>
                      )}
                      {app.status === "draft" && (
                        <Link href={`/dashboard/grants/${app.grant.id}/apply`}>
                          <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                            <ArrowRight className="h-4 w-4 mr-1" />
                            Start
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
      <Card className="mt-8" variant="gradient">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { href: "/dashboard/organization", icon: TrendingUp, label: "Complete Profile", desc: "Improve match accuracy", color: "emerald" },
              { href: "/dashboard/documents", icon: FileText, label: "Upload Docs", desc: "Auto-extract info", color: "blue" },
              { href: "/dashboard/grants", icon: Search, label: "Discover Grants", desc: "Find opportunities", color: "purple" },
              { href: "/dashboard/applications", icon: Clock, label: "Track Deadlines", desc: "Never miss a date", color: "amber" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-center p-4 sm:p-6 bg-slate-900/50 rounded-xl hover:bg-slate-800/80 transition-all duration-200 text-center border border-transparent hover:border-slate-700 group hover:-translate-y-1"
              >
                <div className={`bg-${action.color}-500/20 p-2 sm:p-3 rounded-xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${action.color}-400`} />
                </div>
                <span className="text-white font-medium text-sm sm:text-base">{action.label}</span>
                <span className="text-slate-500 text-xs sm:text-sm mt-1 hidden xs:block">{action.desc}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
