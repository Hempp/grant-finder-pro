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
import { useToast } from "@/components/ui";
import { ExpiringSoon } from "@/components/dashboard/ExpiringSoon";
import { ProfileProgressBanner } from "@/components/dashboard/ProfileProgressBanner";
import { ApplyPanel } from "@/components/dashboard/ApplyPanel";

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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
  const [allGrants, setAllGrants] = useState<Grant[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    grantsFound: 0,
    applicationsCount: 0,
    totalRequested: 0,
    avgMatchScore: 0,
    inProgressCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [readiness, setReadiness] = useState<{
    score: number;
    actions: { priority: string; action: string }[];
  } | null>(null);
  const { isPro, canStartTrial } = useSubscription();
  const [applyGrant, setApplyGrant] = useState<{ id: string; title: string; funder: string } | null>(null);
  const { success: toastSuccess } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const [grantsRes, appsRes, readinessRes] = await Promise.all([
          fetch("/api/grants"),
          fetch("/api/applications"),
          fetch("/api/organizations/readiness"),
        ]);

        const grantsData = await grantsRes.json();
        const appsData = await appsRes.json();

        if (readinessRes.ok) {
          const readinessData = await readinessRes.json();
          setReadiness({
            score: readinessData.score ?? 0,
            actions: readinessData.actions ?? [],
          });
        }

        const now = new Date();
        const grantsList = (grantsData.grants || []).filter(
          (g: Grant) => !g.deadline || new Date(g.deadline) >= now
        );
        const appsList = Array.isArray(appsData) ? appsData : [];

        setAllGrants(grantsList);
        setGrants(grantsList.slice(0, 3));
        setApplications(appsList.slice(0, 3));

        // First match celebration
        if (grantsList.length > 0 && !localStorage.getItem("hasSeenFirstMatch")) {
          localStorage.setItem("hasSeenFirstMatch", "true");
          const topGrant = grantsList[0];
          toastSuccess(
            "Your first match!",
            `GrantPilot found "${topGrant.title}" — ${topGrant.matchScore || 0}% match.`
          );
        }

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
    <div className="p-6 lg:p-8 flex flex-col gap-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            {(() => {
              const hour = new Date().getHours();
              if (hour < 12) return "Good morning";
              if (hour < 17) return "Good afternoon";
              if (hour < 21) return "Good evening";
              return "Burning the midnight oil";
            })()}
            <Sparkles className="h-6 w-6 text-emerald-400 animate-breathe" aria-hidden="true" />
          </h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">
            {loading
              ? "Loading your latest matches..."
              : stats.applicationsCount > 0
              ? `${stats.inProgressCount} ${stats.inProgressCount === 1 ? "application" : "applications"} in flight. ${stats.grantsFound} new ${stats.grantsFound === 1 ? "match is" : "matches are"} waiting.`
              : stats.grantsFound > 0
              ? `${stats.grantsFound} ${stats.grantsFound === 1 ? "grant matches" : "grants match"} your profile. Pick one to start drafting — we'll do the heavy lifting.`
              : "Add a few details about your work and we'll start matching grants you actually qualify for."}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/grants">
            <Button variant="outline" className="w-full sm:w-auto text-sm">
              <Search className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Find</span> Grants
            </Button>
          </Link>
          <Link href="/dashboard/documents">
            <Button variant="primary" className="w-full sm:w-auto text-sm">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
            description={
              stats.avgMatchScore >= 80
                ? "Strong fit across your matches"
                : stats.avgMatchScore >= 60
                ? "Solid match — sharpen your profile to climb"
                : "Add profile detail to unlock better matches"
            }
            icon={<Target className="h-6 w-6" />}
          />
        </div>
      )}

      {/* Readiness Score */}
      {loading ? (
        <Card className="p-4 sm:p-6">
          <div className="animate-pulse flex items-center gap-4 sm:gap-6">
            <div className="flex-shrink-0">
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-slate-700 rounded-full"></div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-3 bg-slate-700 rounded w-32"></div>
              <div className="h-2 bg-slate-700 rounded w-48"></div>
              <div className="h-2 bg-slate-700 rounded w-40"></div>
            </div>
          </div>
        </Card>
      ) : readiness ? (
        <Card className="animate-reveal">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Radial Gauge */}
              <div className="flex-shrink-0">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36" role="img" aria-label={`Grant readiness score: ${readiness.score}`}>
                    <circle
                      cx="18" cy="18" r="15.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-slate-700"
                    />
                    <circle
                      cx="18" cy="18" r="15.9155"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray={`${readiness.score} 100`}
                      pathLength={100}
                      strokeLinecap="round"
                      className={
                        readiness.score >= 70
                          ? "text-emerald-400"
                          : readiness.score >= 40
                          ? "text-amber-400"
                          : "text-red-400"
                      }
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-sm sm:text-base font-bold ${
                      readiness.score >= 70
                        ? "text-emerald-400"
                        : readiness.score >= 40
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}>
                      {readiness.score}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-slate-400" />
                  <h3 className="text-white font-bold text-sm sm:text-base">Grant Readiness</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    readiness.score >= 70
                      ? "bg-emerald-500/20 text-emerald-400"
                      : readiness.score >= 40
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {readiness.score >= 70 ? "Ready" : readiness.score >= 40 ? "Getting There" : "Needs Work"}
                  </span>
                </div>

                {/* Top 2 Actions */}
                {readiness.actions.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {readiness.actions.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          item.priority === "high"
                            ? "bg-red-400"
                            : item.priority === "medium"
                            ? "bg-amber-400"
                            : "bg-slate-500"
                        }`} />
                        <span className="truncate">{item.action}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA */}
              <Link href="/dashboard/organization" className="flex-shrink-0 hidden sm:block">
                <Button variant="outline" size="sm" className="text-xs">
                  Improve
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Profile Progress */}
      {!loading && <ProfileProgressBanner />}

      {/* Upgrade Prompt for Free Users */}
      {!isPro && !loading && (
        <div className="animate-reveal">
          <UpgradePrompt
            feature="Unlimited Grant Matches"
            description={canStartTrial
              ? "Start your 21-day free trial to unlock unlimited AI-powered grant matches and Auto-Apply."
              : "Upgrade to Pro for unlimited AI-powered grant matches, Auto-Apply, and daily alerts."
            }
            variant="banner"
          />
        </div>
      )}

      {/* Expiring Soon */}
      {!loading && <ExpiringSoon grants={allGrants} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Recent Grants */}
        <Card variant="elevated" hover glow>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-500/20 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Top Matching Grants</h2>
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
                <p className="text-slate-400 text-sm mb-4">Complete your profile to get personalized matches.</p>
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
                    className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg hover:bg-slate-800/80 transition-colors duration-200 block border border-transparent hover:border-slate-700 group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate group-hover:text-emerald-400 transition-colors">{grant.title}</h3>
                      <p className="text-slate-400 text-sm truncate">{grant.funder}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-emerald-400 font-bold">{formatCurrency(grant.amount)}</span>
                        <span className={`text-sm flex items-center gap-1 ${deadline.color}`}>
                          <Clock className="h-3 w-3" />
                          {deadline.label}
                        </span>
                      </div>
                    </div>
                    <div className="text-center ml-3 sm:ml-4 flex-shrink-0">
                      <div className="relative">
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 transform -rotate-90" role="img" aria-label={`Match score: ${grant.matchScore || 0}%`}>
                          <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="4" fill="none" className="text-slate-700" pathLength={100} />
                          <circle
                            cx="50%"
                            cy="50%"
                            r="40%"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${grant.matchScore || 0} 100`}
                            pathLength={100}
                            className="text-emerald-400"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm sm:text-lg font-bold text-emerald-400">{grant.matchScore || 0}%</span>
                        </div>
                      </div>
                      <div className="text-slate-500 text-xs leading-4 mt-1">Match</div>
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card variant="elevated" hover glow glowColor="blue">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-teal-500/15 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-teal-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Recent Applications</h2>
            </div>
            <Link href="/dashboard/applications" className="text-teal-400 hover:text-teal-300 text-sm flex items-center gap-1 group">
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
                <p className="text-slate-400 text-sm mb-4">Browse your grant matches and start your first application — Smart Fill does most of the writing.</p>
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
                    className="p-4 bg-slate-900/50 rounded-lg hover:bg-slate-800/80 transition-colors duration-200 border border-transparent hover:border-slate-700"
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
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
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
      <Card variant="gradient">
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Link
              href="/dashboard/organization"
              className="flex flex-col items-center p-4 sm:p-6 bg-slate-900/50 rounded-xl hover:bg-slate-800/80 transition-colors duration-200 text-center border border-transparent hover:border-emerald-500/20 group"
            >
              <div className="bg-emerald-500/15 p-2 sm:p-3 rounded-xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
              </div>
              <span className="text-white font-medium text-sm sm:text-base">Complete Profile</span>
              <span className="text-slate-500 text-xs sm:text-sm mt-1 hidden xs:block">Improve match accuracy</span>
            </Link>
            <Link
              href="/dashboard/documents"
              className="flex flex-col items-center p-4 sm:p-6 bg-slate-900/50 rounded-xl hover:bg-slate-800/80 transition-colors duration-200 text-center border border-transparent hover:border-cyan-500/20 group"
            >
              <div className="bg-cyan-500/15 p-2 sm:p-3 rounded-xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
              </div>
              <span className="text-white font-medium text-sm sm:text-base">Upload Docs</span>
              <span className="text-slate-500 text-xs sm:text-sm mt-1 hidden xs:block">Auto-extract info</span>
            </Link>
            <Link
              href="/dashboard/grants"
              className="flex flex-col items-center p-4 sm:p-6 bg-slate-900/50 rounded-xl hover:bg-slate-800/80 transition-colors duration-200 text-center border border-transparent hover:border-teal-500/20 group"
            >
              <div className="bg-teal-500/15 p-2 sm:p-3 rounded-xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                <Search className="h-5 w-5 sm:h-6 sm:w-6 text-teal-400" />
              </div>
              <span className="text-white font-medium text-sm sm:text-base">Discover Grants</span>
              <span className="text-slate-500 text-xs sm:text-sm mt-1 hidden xs:block">Find opportunities</span>
            </Link>
            <Link
              href="/dashboard/applications"
              className="flex flex-col items-center p-4 sm:p-6 bg-slate-900/50 rounded-xl hover:bg-slate-800/80 transition-colors duration-200 text-center border border-transparent hover:border-amber-500/20 group"
            >
              <div className="bg-amber-500/15 p-2 sm:p-3 rounded-xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
              </div>
              <span className="text-white font-medium text-sm sm:text-base">Track Deadlines</span>
              <span className="text-slate-500 text-xs sm:text-sm mt-1 hidden xs:block">Never miss a date</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      <ApplyPanel
        isOpen={!!applyGrant}
        onClose={() => setApplyGrant(null)}
        grantId={applyGrant?.id || ""}
        grantTitle={applyGrant?.title || ""}
        grantFunder={applyGrant?.funder || ""}
      />
    </div>
  );
}
