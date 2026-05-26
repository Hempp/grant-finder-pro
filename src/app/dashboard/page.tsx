"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  FileText,
  ArrowRight,
  Plus,
  CheckCircle,
  AlertCircle,
  Calendar,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { UpgradePrompt } from "@/components/subscription/UpgradePrompt";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/components/ui";
import { ExpiringSoon } from "@/components/dashboard/ExpiringSoon";
import { ProfileProgressBanner } from "@/components/dashboard/ProfileProgressBanner";
import { ApplyPanel } from "@/components/dashboard/ApplyPanel";
import { MomentumHero } from "@/components/dashboard/MomentumHero";
import { useSession } from "next-auth/react";

interface Grant {
  id: string;
  title: string;
  funder: string;
  amount: number;
  deadline: string;
  matchScore: number | null;
  status: string;
  url?: string | null;
}

interface Application {
  id: string;
  status: string;
  narrative: string | null;
  budget: string | null;
  responses: string | null;
  updatedAt: string;
  grant: { id: string; title: string; deadline: string; amount: number };
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
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

function calculateApplicationProgress(app: Application): number {
  const fields = [app.responses, app.narrative, app.budget];
  const filled = fields.filter((f) => f && String(f).trim() !== "").length;
  return Math.round((filled / fields.length) * 100);
}

function getDeadlineStatus(deadline: string): { label: string; color: string } {
  const daysUntil = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (daysUntil < 0) return { label: "Expired", color: "var(--ink-2)" };
  if (daysUntil <= 7) return { label: `${daysUntil}d left`, color: "var(--warn)" };
  if (daysUntil <= 30) return { label: `${daysUntil}d left`, color: "var(--warn)" };
  return { label: `${daysUntil}d left`, color: "var(--ink-2)" };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [allGrants, setAllGrants] = useState<Grant[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [totalRequested, setTotalRequested] = useState(0);
  const [loading, setLoading] = useState(true);
  const [readiness, setReadiness] = useState<{
    score: number;
    actions: { priority: string; action: string }[];
  } | null>(null);
  const { isPro, canStartTrial } = useSubscription();
  const [applyGrant, setApplyGrant] = useState<{ id: string; title: string; funder: string; url?: string | null } | null>(null);
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
        const appsList: Application[] = Array.isArray(appsData) ? appsData : [];

        setAllGrants(grantsList);
        setGrants(grantsList.slice(0, 3));
        setApplications(appsList.slice(0, 3));

        // First match celebration — value beat, allowed by parent spec §2.3.
        if (grantsList.length > 0 && !localStorage.getItem("hasSeenFirstMatch")) {
          localStorage.setItem("hasSeenFirstMatch", "true");
          const topGrant = grantsList[0];
          toastSuccess(
            "Your first match!",
            `GrantPilot found "${topGrant.title}" — ${topGrant.matchScore || 0}% match.`
          );
        }

        const total = appsList.reduce(
          (sum, app) => sum + (app.grant?.amount || 0),
          0
        );
        setTotalRequested(total);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [toastSuccess]);

  // The full set of pipeline apps + grants for the hero. Top match drives
  // the value-beat row at the top.
  const topMatch = grants[0] ?? null;
  const allAppsForHero = applications; // already sliced to 3 above; momentum metrics use this set

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-8">
      {/* Momentum hero — greeting + 3 cards + top match. Real data only. */}
      <MomentumHero
        userName={session?.user?.name}
        loading={loading}
        applications={allAppsForHero}
        allGrants={allGrants}
        totalRequested={totalRequested}
        topMatch={topMatch}
        onDraftTopMatch={(g) => setApplyGrant({ id: g.id, title: g.title, funder: g.funder, url: g.url })}
      />

      {/* Quick actions row — top-right CTAs were here; now rendered as a
          compact action strip so the momentum hero owns the top of the page. */}
      <div className="flex gap-3 flex-wrap">
        <Link href="/dashboard/grants">
          <Button
            style={{
              background: "var(--surface)",
              color: "var(--ink)",
              border: "1px solid var(--rule)",
              borderRadius: "var(--radius-control)",
            }}
          >
            <Search className="h-4 w-4 mr-2" />
            Find grants
          </Button>
        </Link>
        <Link href="/dashboard/documents">
          <Button
            className="!text-white"
            style={{
              background: "var(--accent)",
              borderColor: "var(--accent)",
              borderRadius: "var(--radius-control)",
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Upload docs
          </Button>
        </Link>
      </div>

      {/* Grant Readiness — ScoreRing replaces hand-rolled SVG gauge. */}
      {loading ? (
        <div
          className="p-5"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--rule)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card-soft)",
          }}
        >
          <div className="flex items-center gap-4">
            <Skeleton variant="circle" width={72} height={72} />
            <div className="flex-1 space-y-2">
              <Skeleton width="40%" height={14} />
              <Skeleton width="60%" height={12} />
              <Skeleton width="50%" height={12} />
            </div>
          </div>
        </div>
      ) : readiness ? (
        <article
          className="p-5"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--rule)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card-soft)",
          }}
        >
          <div className="flex items-center gap-5">
            <ScoreRing
              score={readiness.score}
              size="md"
              label="Grant readiness"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <Target
                  className="h-4 w-4"
                  style={{ color: "var(--ink-2)" }}
                  aria-hidden="true"
                />
                <h3
                  className="font-semibold"
                  style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
                >
                  Grant readiness
                </h3>
                <span
                  className="px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background:
                      readiness.score >= 70
                        ? "var(--success-soft)"
                        : readiness.score >= 40
                        ? "var(--warn-soft)"
                        : "var(--warn-soft)",
                    color:
                      readiness.score >= 70
                        ? "var(--success)"
                        : "var(--warn)",
                    fontSize: "var(--text-micro)",
                  }}
                >
                  {readiness.score >= 70
                    ? "Ready"
                    : readiness.score >= 40
                    ? "Getting there"
                    : "Needs work"}
                </span>
              </div>
              {readiness.actions.length > 0 && (
                <ul className="space-y-1">
                  {readiness.actions.slice(0, 2).map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2"
                      style={{
                        fontSize: "var(--text-caption)",
                        color: "var(--ink-2)",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{
                          background:
                            item.priority === "high"
                              ? "var(--warn)"
                              : item.priority === "medium"
                              ? "var(--warn)"
                              : "var(--ink-2)",
                        }}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.action}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Link
              href="/dashboard/organization"
              className="flex-shrink-0 hidden sm:block"
            >
              <Button
                size="sm"
                style={{
                  background: "var(--surface)",
                  color: "var(--accent)",
                  border: "1px solid var(--accent)",
                  borderRadius: "var(--radius-control)",
                }}
              >
                Improve
              </Button>
            </Link>
          </div>
        </article>
      ) : null}

      {/* Profile progress + expiring + upgrade prompt — preserved
          as-is. These components still carry pre-v2 internal styling
          (deferred to a follow-up component-restyle sweep) but their
          contracts and data flows are unchanged. */}
      {!loading && <ProfileProgressBanner />}

      {!isPro && !loading && (
        <UpgradePrompt
          feature="Unlimited Grant Matches"
          description={
            canStartTrial
              ? "Start your 21-day free trial to unlock unlimited AI-powered grant matches and Auto-Apply."
              : "Upgrade to Pro for unlimited AI-powered grant matches, Auto-Apply, and daily alerts."
          }
          variant="banner"
        />
      )}

      {!loading && <ExpiringSoon grants={allGrants} />}

      {/* Pipeline — two columns: top matches + recent applications. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top matches */}
        <article
          style={{
            background: "var(--surface)",
            border: "1px solid var(--rule)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card-soft)",
          }}
        >
          <header
            className="flex items-center justify-between p-5"
            style={{ borderBottom: "1px solid var(--rule)" }}
          >
            <h2
              className="font-semibold"
              style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
            >
              Top matching grants
            </h2>
            <Link
              href="/dashboard/grants"
              className="flex items-center gap-1 font-medium hover:underline"
              style={{
                color: "var(--accent)",
                fontSize: "var(--text-body-sm)",
              }}
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </header>
          <div className="p-3 space-y-2">
            {loading ? (
              <>
                <Skeleton width="100%" height={64} />
                <Skeleton width="100%" height={64} />
              </>
            ) : grants.length === 0 ? (
              <div className="text-center py-10 px-4">
                <p
                  className="mb-2"
                  style={{ fontSize: "var(--text-body)", color: "var(--ink-2)" }}
                >
                  No grants found yet
                </p>
                <p
                  className="mb-4"
                  style={{ fontSize: "var(--text-body-sm)", color: "var(--ink-2)" }}
                >
                  Complete your profile to get personalized matches.
                </p>
                <Link href="/dashboard/organization">
                  <Button
                    size="sm"
                    style={{
                      background: "var(--surface)",
                      color: "var(--accent)",
                      border: "1px solid var(--accent)",
                      borderRadius: "var(--radius-control)",
                    }}
                  >
                    Complete profile
                  </Button>
                </Link>
              </div>
            ) : (
              grants.map((grant) => {
                const deadline = getDeadlineStatus(grant.deadline);
                return (
                  <Link
                    key={grant.id}
                    href={`/dashboard/grants/${grant.id}/apply`}
                    className="flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-[var(--bg-soft)]"
                  >
                    <ScoreRing
                      score={grant.matchScore ?? 0}
                      size="sm"
                      label={`Match score for ${grant.title}`}
                    />
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-medium truncate"
                        style={{ fontSize: "var(--text-body)", color: "var(--ink)" }}
                      >
                        {grant.title}
                      </h3>
                      <p
                        className="truncate"
                        style={{
                          fontSize: "var(--text-body-sm)",
                          color: "var(--ink-2)",
                        }}
                      >
                        {grant.funder}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span
                          className="font-mono tabular-nums font-semibold"
                          style={{
                            fontSize: "var(--text-body-sm)",
                            color: "var(--accent)",
                          }}
                        >
                          {formatCurrency(grant.amount)}
                        </span>
                        <span
                          className="inline-flex items-center gap-1"
                          style={{
                            fontSize: "var(--text-caption)",
                            color: deadline.color,
                          }}
                        >
                          {deadline.label}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </article>

        {/* Recent applications */}
        <article
          style={{
            background: "var(--surface)",
            border: "1px solid var(--rule)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card-soft)",
          }}
        >
          <header
            className="flex items-center justify-between p-5"
            style={{ borderBottom: "1px solid var(--rule)" }}
          >
            <h2
              className="font-semibold"
              style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
            >
              Recent applications
            </h2>
            <Link
              href="/dashboard/applications"
              className="flex items-center gap-1 font-medium hover:underline"
              style={{
                color: "var(--accent)",
                fontSize: "var(--text-body-sm)",
              }}
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </header>
          <div className="p-3 space-y-2">
            {loading ? (
              <>
                <Skeleton width="100%" height={96} />
                <Skeleton width="100%" height={96} />
              </>
            ) : applications.length === 0 ? (
              <div className="text-center py-10 px-4">
                <p
                  className="mb-2"
                  style={{ fontSize: "var(--text-body)", color: "var(--ink-2)" }}
                >
                  No applications yet
                </p>
                <p
                  className="mb-4"
                  style={{ fontSize: "var(--text-body-sm)", color: "var(--ink-2)" }}
                >
                  Browse your grant matches and start your first — Smart Fill does most of the writing.
                </p>
                <Link href="/dashboard/grants">
                  <Button
                    size="sm"
                    style={{
                      background: "var(--surface)",
                      color: "var(--accent)",
                      border: "1px solid var(--accent)",
                      borderRadius: "var(--radius-control)",
                    }}
                  >
                    Browse grants
                  </Button>
                </Link>
              </div>
            ) : (
              applications.map((app) => {
                const progress = calculateApplicationProgress(app);
                const deadline = getDeadlineStatus(app.grant.deadline);
                return (
                  <div
                    key={app.id}
                    className="flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-[var(--bg-soft)]"
                  >
                    <ScoreRing
                      score={progress}
                      size="sm"
                      label={`Draft progress for ${app.grant.title}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className="font-medium truncate flex-1"
                          style={{ fontSize: "var(--text-body)", color: "var(--ink)" }}
                        >
                          {app.grant.title}
                        </h3>
                        <Badge variant={statusColors[app.status] || "default"}>
                          {statusLabels[app.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className="inline-flex items-center gap-1"
                          style={{
                            fontSize: "var(--text-caption)",
                            color: deadline.color,
                          }}
                        >
                          <Calendar className="h-3 w-3" aria-hidden="true" />
                          Due {new Date(app.grant.deadline).toLocaleDateString()}
                        </span>
                        {app.status === "ready_for_review" && (
                          <Link
                            href={`/dashboard/applications/${app.id}`}
                            className="flex items-center gap-1 font-medium hover:underline"
                            style={{
                              color: "var(--success)",
                              fontSize: "var(--text-caption)",
                            }}
                          >
                            <CheckCircle className="h-3 w-3" aria-hidden="true" />
                            Review
                          </Link>
                        )}
                        {app.status === "in_progress" && (
                          <Link
                            href={`/dashboard/grants/${app.grant.id}/apply`}
                            className="flex items-center gap-1 font-medium hover:underline"
                            style={{
                              color: "var(--warn)",
                              fontSize: "var(--text-caption)",
                            }}
                          >
                            <AlertCircle className="h-3 w-3" aria-hidden="true" />
                            Continue
                          </Link>
                        )}
                        {app.status === "draft" && (
                          <Link
                            href={`/dashboard/grants/${app.grant.id}/apply`}
                            className="flex items-center gap-1 font-medium hover:underline"
                            style={{
                              color: "var(--ink-2)",
                              fontSize: "var(--text-caption)",
                            }}
                          >
                            <ArrowRight className="h-3 w-3" aria-hidden="true" />
                            Start
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </article>
      </div>

      <ApplyPanel
        isOpen={!!applyGrant}
        onClose={() => setApplyGrant(null)}
        grantId={applyGrant?.id || ""}
        grantTitle={applyGrant?.title || ""}
        grantFunder={applyGrant?.funder || ""}
        grantUrl={applyGrant?.url}
      />
    </div>
  );
}
