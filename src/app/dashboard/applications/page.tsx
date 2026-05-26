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
  Edit3,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui";
import { ScoreRing } from "@/components/ui/ScoreRing";

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

const statusConfig: Record<
  string,
  { label: string; tone: "neutral" | "success" | "warn" | "accent"; icon: React.ElementType }
> = {
  draft: { label: "Draft", tone: "neutral", icon: FileText },
  in_progress: { label: "In progress", tone: "warn", icon: AlertCircle },
  ready_for_review: { label: "Ready for review", tone: "accent", icon: CheckCircle },
  submitted: { label: "Submitted", tone: "success", icon: CheckCircle },
  pending: { label: "Pending review", tone: "accent", icon: Clock },
  awarded: { label: "Awarded", tone: "success", icon: Award },
  rejected: { label: "Rejected", tone: "warn", icon: XCircle },
};

function statusStyle(
  tone: "neutral" | "success" | "warn" | "accent"
): { background: string; color: string } {
  switch (tone) {
    case "success":
      return { background: "var(--success-soft)", color: "var(--success)" };
    case "warn":
      return { background: "var(--warn-soft)", color: "var(--warn)" };
    case "accent":
      return { background: "var(--accent-soft)", color: "var(--accent)" };
    default:
      return { background: "var(--bg-soft)", color: "var(--ink-2)" };
  }
}

const filterOptions = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "submitted", label: "Submitted" },
  { value: "completed", label: "Completed" },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const res = await fetch("/api/applications");
        if (res.ok) {
          const data: ApiApplication[] = await res.json();
          const transformed: Application[] = data.map((app) => {
            let progress = 0;
            if (app.responses) progress += 33;
            if (app.narrative) progress += 34;
            if (app.budget) progress += 33;
            if (["submitted", "awarded", "rejected"].includes(app.status)) progress = 100;
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

  async function handleDelete(appId: string, grantTitle: string) {
    if (!confirm(`Delete application for "${grantTitle}"? This cannot be undone.`)) return;
    setDeleting(appId);
    try {
      const res = await fetch(`/api/applications/${appId}`, { method: "DELETE" });
      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a.id !== appId));
      }
    } catch {
      /* silently fail */
    } finally {
      setDeleting(null);
      setOpenMenu(null);
    }
  }

  const filteredApplications = applications.filter((app) => {
    if (searchQuery && !app.grantTitle.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filter === "active") return ["draft", "in_progress", "ready_for_review"].includes(app.status);
    if (filter === "submitted") return app.status === "submitted";
    if (filter === "completed") return ["awarded", "rejected"].includes(app.status);
    return true;
  });

  const stats = {
    total: applications.length,
    inProgress: applications.filter((a) =>
      ["draft", "in_progress", "ready_for_review"].includes(a.status)
    ).length,
    submitted: applications.filter((a) => a.status === "submitted").length,
    awarded: applications.filter((a) => a.status === "awarded").length,
  };

  const getDaysUntilDeadline = (deadline: string) =>
    Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--rule)",
    borderRadius: "var(--radius-card)",
    boxShadow: "var(--shadow-card-soft)",
  };

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="font-semibold tracking-tight"
            style={{ fontSize: "var(--text-display)", color: "var(--ink)", lineHeight: 1.1 }}
          >
            Applications
          </h1>
          <p
            className="mt-2"
            style={{ fontSize: "var(--text-body)", color: "var(--ink-2)", lineHeight: 1.55 }}
          >
            Track and manage your grant applications.
          </p>
        </div>
        <Link href="/dashboard/grants">
          <Button
            className="w-full sm:w-auto !text-white"
            style={{
              background: "var(--accent)",
              borderColor: "var(--accent)",
              borderRadius: "var(--radius-control)",
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New application
          </Button>
        </Link>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, icon: FileText, color: "var(--ink)" },
          { label: "In progress", value: stats.inProgress, icon: AlertCircle, color: "var(--warn)" },
          { label: "Submitted", value: stats.submitted, icon: CheckCircle, color: "var(--accent)" },
          { label: "Awarded", value: stats.awarded, icon: Award, color: "var(--success)" },
        ].map((s) => (
          <article key={s.label} className="p-4 flex items-center gap-3" style={cardStyle}>
            <div
              className="p-2.5 inline-flex flex-shrink-0"
              style={{
                background: "var(--bg-soft)",
                color: s.color,
                borderRadius: "var(--radius-control)",
              }}
            >
              <s.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p
                className="font-mono tabular-nums font-semibold"
                style={{ fontSize: "var(--text-title)", color: "var(--ink)" }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontSize: "var(--text-caption)",
                  color: "var(--ink-2)",
                  fontWeight: 500,
                }}
              >
                {s.label}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1 sm:max-w-md">
          <label htmlFor="app-search" className="sr-only">
            Search applications by grant title
          </label>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: "var(--ink-2)" }}
            aria-hidden="true"
          />
          <input
            id="app-search"
            type="search"
            placeholder="Search applications…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--rule)",
              color: "var(--ink)",
              fontSize: "var(--text-body-sm)",
              borderRadius: "var(--radius-control)",
            }}
          />
        </div>
        <div
          role="group"
          aria-label="Filter applications by status"
          className="flex gap-2 overflow-x-auto pb-1 sm:pb-0"
        >
          {filterOptions.map((opt) => {
            const active = filter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFilter(opt.value)}
                aria-pressed={active}
                className="px-4 py-2 font-medium transition whitespace-nowrap flex-shrink-0 focus:outline-none focus-visible:ring-2"
                style={
                  active
                    ? {
                        background: "var(--accent)",
                        color: "white",
                        fontSize: "var(--text-body-sm)",
                        borderRadius: "var(--radius-control)",
                      }
                    : {
                        background: "var(--surface)",
                        color: "var(--ink-2)",
                        border: "1px solid var(--rule)",
                        fontSize: "var(--text-body-sm)",
                        borderRadius: "var(--radius-control)",
                      }
                }
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Applications List */}
      <article style={cardStyle}>
        <header
          className="flex items-center justify-between p-5"
          style={{ borderBottom: "1px solid var(--rule)" }}
        >
          <h2
            className="font-semibold"
            style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
          >
            {filter === "all"
              ? "All applications"
              : filterOptions.find((f) => f.value === filter)?.label}
          </h2>
          <span style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}>
            {filteredApplications.length}{" "}
            {filteredApplications.length === 1 ? "application" : "applications"}
          </span>
        </header>

        {filteredApplications.length === 0 ? (
          <div className="p-10 text-center">
            <FileText
              className="h-10 w-10 mx-auto mb-4"
              style={{ color: "var(--ink-2)" }}
              aria-hidden="true"
            />
            <p
              className="font-medium mb-2"
              style={{ fontSize: "var(--text-body)", color: "var(--ink)" }}
            >
              No applications yet
            </p>
            <p
              className="mb-4 max-w-md mx-auto"
              style={{ fontSize: "var(--text-body-sm)", color: "var(--ink-2)" }}
            >
              Find a grant match and start your first application — we&apos;ll draft the bulk of it for you.
            </p>
            <Link href="/dashboard/grants">
              <Button
                className="!text-white"
                style={{
                  background: "var(--accent)",
                  borderColor: "var(--accent)",
                  borderRadius: "var(--radius-control)",
                }}
              >
                Find grants
              </Button>
            </Link>
          </div>
        ) : (
          <ul>
            {filteredApplications.map((app, idx) => {
              const status = statusConfig[app.status];
              const daysUntil = getDaysUntilDeadline(app.deadline);
              const isUrgent =
                daysUntil <= 7 &&
                daysUntil > 0 &&
                !["submitted", "awarded", "rejected"].includes(app.status);
              const showProgress = !["submitted", "awarded", "rejected"].includes(app.status);
              const statusS = statusStyle(status.tone);

              return (
                <li
                  key={app.id}
                  className="p-5 transition hover:bg-[var(--bg-soft)]"
                  style={idx > 0 ? { borderTop: "1px solid var(--rule)" } : undefined}
                >
                  <div className="flex items-start gap-4">
                    {showProgress && (
                      <ScoreRing
                        score={app.progress}
                        size="sm"
                        label={`Draft progress for ${app.grantTitle}`}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/dashboard/applications/${app.id}`}
                        className="block font-semibold hover:underline"
                        style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
                      >
                        {app.grantTitle}
                      </Link>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 font-medium"
                          style={{
                            ...statusS,
                            fontSize: "var(--text-micro)",
                            borderRadius: 999,
                          }}
                        >
                          <status.icon className="h-3 w-3" aria-hidden="true" />
                          {status.label}
                        </span>
                        {isUrgent && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 font-medium"
                            style={{
                              background: "var(--warn-soft)",
                              color: "var(--warn)",
                              fontSize: "var(--text-micro)",
                              borderRadius: 999,
                            }}
                          >
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            {daysUntil}d left
                          </span>
                        )}
                      </div>

                      <div
                        className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2"
                        style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
                      >
                        <span className="truncate max-w-[180px] sm:max-w-none">{app.funder}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className="font-mono tabular-nums font-semibold"
                          style={{ color: "var(--accent)" }}
                        >
                          {app.amount}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {app.submittedAt
                            ? `Submitted ${new Date(app.submittedAt).toLocaleDateString()}`
                            : `Due ${new Date(app.deadline).toLocaleDateString()}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {app.status === "in_progress" && (
                        <Link href={`/dashboard/applications/${app.id}`}>
                          <Button
                            size="sm"
                            className="!text-white"
                            style={{
                              background: "var(--accent)",
                              borderColor: "var(--accent)",
                              borderRadius: "var(--radius-control)",
                            }}
                          >
                            Continue
                            <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </Link>
                      )}
                      {app.status === "ready_for_review" && (
                        <Link href={`/dashboard/applications/${app.id}`}>
                          <Button
                            size="sm"
                            style={{
                              background: "var(--surface)",
                              color: "var(--accent)",
                              border: "1px solid var(--accent)",
                              borderRadius: "var(--radius-control)",
                            }}
                          >
                            Review
                          </Button>
                        </Link>
                      )}
                      {app.status === "draft" && (
                        <Link href={`/dashboard/applications/${app.id}`}>
                          <Button
                            size="sm"
                            style={{
                              background: "transparent",
                              color: "var(--ink-2)",
                              border: "1px solid var(--rule)",
                              borderRadius: "var(--radius-control)",
                            }}
                          >
                            Edit
                          </Button>
                        </Link>
                      )}
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === app.id ? null : app.id)}
                          className="p-2 transition-colors rounded-lg hover:bg-[var(--bg-soft)]"
                          style={{ color: "var(--ink-2)" }}
                          aria-label="Application actions"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        {openMenu === app.id && (
                          <>
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setOpenMenu(null)}
                              aria-hidden="true"
                            />
                            <div
                              className="absolute right-0 top-full mt-1 w-48 z-40 overflow-hidden"
                              style={{
                                background: "var(--surface)",
                                border: "1px solid var(--rule)",
                                borderRadius: "var(--radius-control)",
                                boxShadow: "var(--shadow-card)",
                              }}
                            >
                              <Link
                                href={`/dashboard/applications/${app.id}`}
                                onClick={() => setOpenMenu(null)}
                                className="flex items-center gap-2 px-4 py-3 transition-colors hover:bg-[var(--bg-soft)]"
                                style={{
                                  fontSize: "var(--text-body-sm)",
                                  color: "var(--ink)",
                                }}
                              >
                                {["draft", "in_progress", "ready_for_review"].includes(app.status) ? (
                                  <>
                                    <Edit3 className="h-4 w-4" /> Edit application
                                  </>
                                ) : (
                                  <>
                                    <ExternalLink className="h-4 w-4" /> View application
                                  </>
                                )}
                              </Link>
                              <button
                                onClick={() => handleDelete(app.id, app.grantTitle)}
                                disabled={deleting === app.id}
                                className="flex items-center gap-2 px-4 py-3 transition-colors w-full hover:bg-[var(--warn-soft)]"
                                style={{
                                  fontSize: "var(--text-body-sm)",
                                  color: "var(--warn)",
                                }}
                              >
                                {deleting === app.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" /> Deleting…
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4" /> Delete application
                                  </>
                                )}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </article>
    </div>
  );
}
