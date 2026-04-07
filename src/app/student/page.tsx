"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  DollarSign,
  FileText,
  CheckCircle,
  Trophy,
  TrendingUp,
  Clock,
  ArrowRight,
  User,
  Calendar,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, StatsCard } from "@/components/ui";
import { Button } from "@/components/ui";
import { Skeleton, SkeletonGrantCard } from "@/components/ui/skeleton";

// ── Types ──────────────────────────────────────────────────────────────────

interface StudentProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profileComplete: boolean;
  gpa: number | null;
  major: string | null;
  schoolName: string | null;
  careerGoal: string | null;
  extracurriculars: string | null;
  workExperience: string | null;
  awards: string | null;
  readinessScore: number | null;
}

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  amountMax: number | null;
  amountMin: number | null;
  amount: string | null;
  deadlineDate: string | null;
  matchScore: number;
}

interface ApplicationStats {
  applied: number;
  pending: number;
  won: number;
  totalAwarded: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

function formatScholarshipAmount(s: Scholarship): string {
  if (s.amountMax) return formatCurrency(s.amountMax);
  if (s.amountMin) return formatCurrency(s.amountMin);
  if (s.amount) return s.amount;
  return "Varies";
}

function getDaysUntil(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return "Expired";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

function calcProfileStrength(profile: StudentProfile): { pct: number; nudge: string } {
  const fields: [unknown, string][] = [
    [profile.firstName, "name"],
    [profile.lastName, "name"],
    [profile.schoolName, "school"],
    [profile.major, "major"],
    [profile.gpa, "GPA"],
    [profile.careerGoal, "career goal"],
    [profile.extracurriculars, "activities"],
    [profile.workExperience, "work experience"],
    [profile.awards, "awards"],
  ];
  const filled = fields.filter(([v]) => v !== null && v !== undefined && String(v).trim() !== "").length;
  const pct = Math.round((filled / fields.length) * 100);

  let nudge = "Complete your profile to see scholarship matches.";
  if (!profile.gpa) nudge = "Add your GPA to unlock more scholarship matches.";
  else if (!profile.major) nudge = "Add your major to unlock field-specific scholarships.";
  else if (!profile.careerGoal) nudge = "Add your career goal to improve your match score.";
  else if (!profile.extracurriculars) nudge = "Add activities to strengthen your applications.";
  else if (pct >= 90) nudge = "Your profile is looking great! Keep applying to top matches.";

  return { pct, nudge };
}

// ── Skeletons ──────────────────────────────────────────────────────────────

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

// ── Main Page ──────────────────────────────────────────────────────────────

export default function StudentDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [stats, setStats] = useState<ApplicationStats>({
    applied: 0,
    pending: 0,
    won: 0,
    totalAwarded: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch profile first — redirect if not found
        const profileRes = await fetch("/api/student/profile");
        if (profileRes.status === 404 || profileRes.status === 401) {
          router.replace("/student/onboarding");
          return;
        }
        if (!profileRes.ok) {
          setLoading(false);
          return;
        }
        const profileData: StudentProfile = await profileRes.json();
        if (!profileData || !profileData.firstName) {
          router.replace("/student/onboarding");
          return;
        }
        setProfile(profileData);

        // Fetch scholarships and applications in parallel
        const [scholRes, appsRes] = await Promise.all([
          fetch("/api/student/scholarships"),
          fetch("/api/student/applications").catch(() => null),
        ]);

        if (scholRes.ok) {
          const scholData: Scholarship[] = await scholRes.json();
          setScholarships(scholData.slice(0, 5));
        }

        // Applications stats — gracefully handle missing endpoint
        if (appsRes && appsRes.ok) {
          const appsData = await appsRes.json();
          const appsList = Array.isArray(appsData) ? appsData : appsData.applications ?? [];
          const applied = appsList.length;
          const pending = appsList.filter((a: { status: string }) => a.status === "submitted").length;
          const won = appsList.filter((a: { status: string }) => a.status === "awarded").length;
          const totalAwarded = appsList
            .filter((a: { status: string; awardAmount?: number }) => a.status === "awarded")
            .reduce((sum: number, a: { awardAmount?: number }) => sum + (a.awardAmount ?? 0), 0);
          setStats({ applied, pending, won, totalAwarded });
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  const profileStrength = profile ? calcProfileStrength(profile) : null;
  const firstName = profile?.firstName ?? "Student";

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-8 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            {loading ? (
              <Skeleton width={240} height={36} />
            ) : (
              <>
                Welcome back, {firstName}!
                <Sparkles className="h-6 w-6 text-emerald-400 animate-breathe" />
              </>
            )}
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Here&apos;s your scholarship overview.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/student/scholarships">
            <Button variant="outline" className="w-full sm:w-auto text-sm">
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Scholarships
            </Button>
          </Link>
          <Link href="/student/apply">
            <Button variant="primary" className="w-full sm:w-auto text-sm">
              <ArrowRight className="h-4 w-4 mr-2" />
              Apply Now
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Stats Row ── */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatsCard
            title="Applied"
            value={stats.applied}
            description="Total applications"
            icon={<FileText className="h-6 w-6" />}
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            description="Awaiting decision"
            icon={<Clock className="h-6 w-6" />}
          />
          <StatsCard
            title="Won"
            value={stats.won}
            description="Scholarships awarded"
            icon={<Trophy className="h-6 w-6" />}
          />
          <StatsCard
            title="Total Awarded"
            value={stats.totalAwarded > 0 ? formatCurrency(stats.totalAwarded) : "$0"}
            description="Scholarship funds earned"
            icon={<DollarSign className="h-6 w-6" />}
          />
        </div>
      )}

      {/* ── Top Matches + Profile Strength ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Matches — takes 2/3 width */}
        <div className="lg:col-span-2">
          <Card variant="elevated" hover glow>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500/20 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Top Matches</h2>
              </div>
              <Link
                href="/student/scholarships"
                className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1 group"
              >
                View all{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <>
                  <SkeletonGrantCard />
                  <SkeletonGrantCard />
                </>
              ) : scholarships.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-slate-800/50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-slate-600" />
                  </div>
                  <p className="text-slate-400 mb-2">No matches yet</p>
                  <p className="text-slate-500 text-sm mb-4">
                    Complete your profile to get personalized scholarship matches.
                  </p>
                  <Link href="/student/onboarding">
                    <Button variant="outline" size="sm">
                      Complete Profile
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  {scholarships.map((s, index) => {
                    const deadlineLabel = getDaysUntil(s.deadlineDate);
                    const isUrgent =
                      deadlineLabel &&
                      (deadlineLabel.includes("today") ||
                        deadlineLabel.includes("tomorrow") ||
                        /Due in [1-7] days/.test(deadlineLabel));

                    return (
                      <Link
                        key={s.id}
                        href={`/student/scholarships/${s.id}`}
                        className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg hover:bg-slate-800/80 transition-colors duration-200 border border-transparent hover:border-slate-700 group"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex-1 min-w-0">
                          {/* Amount */}
                          <p className="text-emerald-400 font-bold text-lg leading-tight">
                            {formatScholarshipAmount(s)}
                          </p>
                          {/* Title */}
                          <h3 className="text-white font-medium truncate group-hover:text-emerald-300 transition-colors text-sm mt-0.5">
                            {s.title}
                          </h3>
                          {/* Provider + deadline */}
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-slate-400 text-xs truncate">{s.provider}</span>
                            {deadlineLabel && (
                              <span
                                className={`text-xs flex items-center gap-1 ${
                                  isUrgent ? "text-red-400" : "text-slate-500"
                                }`}
                              >
                                <Calendar className="h-3 w-3" />
                                {deadlineLabel}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Match score ring */}
                        <div className="text-center ml-4 flex-shrink-0">
                          <div className="relative w-14 h-14">
                            <svg
                              className="w-full h-full transform -rotate-90"
                              role="img"
                              aria-label={`Match score: ${s.matchScore}%`}
                            >
                              <circle
                                cx="50%"
                                cy="50%"
                                r="40%"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                className="text-slate-700"
                              />
                              <circle
                                cx="50%"
                                cy="50%"
                                r="40%"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${s.matchScore * 1.76} 176`}
                                className="text-emerald-400"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold text-emerald-400">
                                {s.matchScore}%
                              </span>
                            </div>
                          </div>
                          <div className="text-slate-500 text-xs mt-0.5">match</div>
                        </div>

                        {/* Apply button */}
                        <div className="ml-3 flex-shrink-0">
                          <span className="px-3 py-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                            Apply
                          </span>
                        </div>
                      </Link>
                    );
                  })}

                  {/* Apply to all link */}
                  <div className="pt-2 border-t border-slate-800/50">
                    <Link
                      href="/student/apply"
                      className="flex items-center justify-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors py-2 group"
                    >
                      Apply to All Matches
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Strength — takes 1/3 width */}
        <div className="flex flex-col gap-6">
          <Card variant="elevated" hover glow glowColor="blue">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="bg-blue-500/15 p-2 rounded-lg">
                  <User className="h-5 w-5 text-blue-400" />
                </div>
                <h2 className="text-lg font-bold text-white">Profile Strength</h2>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton variant="circle" width={80} height={80} className="mx-auto" />
                  <Skeleton width="70%" height={14} className="mx-auto" />
                  <Skeleton lines={2} />
                </div>
              ) : profileStrength ? (
                <div className="space-y-4">
                  {/* Radial gauge */}
                  <div className="flex justify-center">
                    <div className="relative w-20 h-20">
                      <svg
                        className="w-full h-full transform -rotate-90"
                        viewBox="0 0 36 36"
                        role="img"
                        aria-label={`Profile strength: ${profileStrength.pct}%`}
                      >
                        <circle
                          cx="18"
                          cy="18"
                          r="15.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="text-slate-700"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray={`${profileStrength.pct * 0.974} 97.4`}
                          strokeLinecap="round"
                          className={
                            profileStrength.pct >= 70
                              ? "text-emerald-400"
                              : profileStrength.pct >= 40
                              ? "text-amber-400"
                              : "text-red-400"
                          }
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className={`text-lg font-bold ${
                            profileStrength.pct >= 70
                              ? "text-emerald-400"
                              : profileStrength.pct >= 40
                              ? "text-amber-400"
                              : "text-red-400"
                          }`}
                        >
                          {profileStrength.pct}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Completeness</span>
                      <span>{profileStrength.pct}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${profileStrength.pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Nudge */}
                  <p className="text-sm text-slate-400 text-center leading-relaxed">
                    {profileStrength.nudge}
                  </p>

                  {/* CTA */}
                  {profileStrength.pct < 100 && (
                    <Link href="/student/profile" className="block">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Complete Profile
                      </Button>
                    </Link>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Quick Actions card */}
          <Card variant="gradient">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  href="/student/scholarships"
                  className="flex items-center gap-3 px-3 py-2.5 bg-slate-900/50 rounded-lg hover:bg-slate-800/80 transition-colors border border-transparent hover:border-emerald-500/20 group text-sm"
                >
                  <div className="bg-emerald-500/15 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span className="text-slate-300 font-medium">Find Scholarships</span>
                </Link>
                <Link
                  href="/student/applications"
                  className="flex items-center gap-3 px-3 py-2.5 bg-slate-900/50 rounded-lg hover:bg-slate-800/80 transition-colors border border-transparent hover:border-cyan-500/20 group text-sm"
                >
                  <div className="bg-cyan-500/15 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                    <FileText className="h-4 w-4 text-cyan-400" />
                  </div>
                  <span className="text-slate-300 font-medium">My Applications</span>
                </Link>
                <Link
                  href="/student/library"
                  className="flex items-center gap-3 px-3 py-2.5 bg-slate-900/50 rounded-lg hover:bg-slate-800/80 transition-colors border border-transparent hover:border-amber-500/20 group text-sm"
                >
                  <div className="bg-amber-500/15 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                    <BookOpen className="h-4 w-4 text-amber-400" />
                  </div>
                  <span className="text-slate-300 font-medium">Content Library</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
