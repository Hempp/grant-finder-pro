"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ScoreRing } from "@/components/ui/ScoreRing";

interface Application {
  id: string;
  status: string;
  narrative: string | null;
  budget: string | null;
  responses: string | null;
  grant: { id: string; title: string; deadline: string; amount: number };
}

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

interface MomentumHeroProps {
  userName: string | null | undefined;
  loading: boolean;
  applications: Application[];
  allGrants: Grant[];
  totalRequested: number;
  topMatch?: Grant | null;
  /** When provided, the top-match row becomes a button that triggers
   *  Smart Fill via the ApplyPanel instead of linking to the manual
   *  wizard. Falls back to the link if omitted. */
  onDraftTopMatch?: (grant: Grant) => void;
}

const ONE_DAY = 86_400_000;

function progressOf(app: Application): number {
  const fields = [app.responses, app.narrative, app.budget];
  const filled = fields.filter((f) => f && String(f).trim() !== "").length;
  return Math.round((filled / fields.length) * 100);
}

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Burning the midnight oil";
}

/**
 * Count up a numeric value from 0 → final over ~600ms with the v2 ease.
 * Respects prefers-reduced-motion (snaps to final). Geist-mono numerals.
 */
function useCountUp(target: number, durationMs = 600) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;
    if (reduce || target === 0) {
      setValue(target);
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const step = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

export function MomentumHero({
  userName,
  loading,
  applications,
  allGrants,
  totalRequested,
  topMatch,
  onDraftTopMatch,
}: MomentumHeroProps) {
  // Real metrics — never faked. If a metric is genuinely zero, the empty
  // state below renders instead of "0 deadlines this week" theater.
  const draftsReady = applications.filter(
    (a) => progressOf(a) >= 90 || a.status === "ready_for_review"
  ).length;
  const now = Date.now();
  const deadlinesThisWeek = allGrants.filter((g) => {
    if (!g.deadline) return false;
    const due = new Date(g.deadline).getTime();
    return due >= now && due - now <= 7 * ONE_DAY;
  }).length;

  // Per parent spec §4: "Even a brand-new user sees an onboarding
  // momentum state, never a blank table." So the empty state replaces
  // the cards entirely, not the whole hero.
  const isEmptyState =
    !loading &&
    totalRequested === 0 &&
    draftsReady === 0 &&
    deadlinesThisWeek === 0 &&
    allGrants.length === 0;

  const queue = useCountUp(totalRequested);
  const drafts = useCountUp(draftsReady);
  const deadlines = useCountUp(deadlinesThisWeek);

  const firstName = userName?.split(" ")[0] ?? null;

  return (
    <section aria-labelledby="momentum-greeting" className="flex flex-col gap-6">
      <div>
        <h1
          id="momentum-greeting"
          className="font-semibold tracking-tight"
          style={{
            fontSize: "var(--text-display)",
            color: "var(--ink)",
            lineHeight: 1.1,
          }}
        >
          {greeting()}
          {firstName ? `, ${firstName}.` : "."}
        </h1>
        <p
          className="mt-2"
          style={{
            fontSize: "var(--text-body-lg)",
            color: "var(--ink-2)",
            lineHeight: 1.5,
          }}
        >
          {loading
            ? "Loading your campaign…"
            : isEmptyState
            ? "Let's find your first $100K. Set up your profile and we'll start matching grants you qualify for."
            : draftsReady > 0
            ? `${draftsReady} ${draftsReady === 1 ? "draft is" : "drafts are"} ready to submit. You're closer to funding than yesterday.`
            : deadlinesThisWeek > 0
            ? `${deadlinesThisWeek} ${deadlinesThisWeek === 1 ? "deadline closes" : "deadlines close"} this week. Start the highest-score one now.`
            : "Your pipeline is moving. Keep going."}
        </p>
      </div>

      {/* Momentum cards: 3-up of real metrics. Hidden in the empty state. */}
      {!isEmptyState && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Queue value */}
          <article
            className="p-5"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--rule)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-card-soft)",
            }}
          >
            <p
              style={{
                color: "var(--ink-2)",
                fontSize: "var(--text-meta)",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              In your queue
            </p>
            <p
              className="mt-2 font-mono tabular-nums font-semibold"
              style={{
                color: "var(--accent)",
                fontSize: "var(--text-display)",
                lineHeight: 1.1,
              }}
            >
              {loading ? "—" : formatCurrency(queue)}
            </p>
            <p
              className="mt-2"
              style={{ color: "var(--ink-2)", fontSize: "var(--text-body-sm)" }}
            >
              across {applications.length}{" "}
              {applications.length === 1 ? "application" : "applications"}
            </p>
          </article>

          {/* Drafts ready */}
          <article
            className="p-5"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--rule)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-card-soft)",
            }}
          >
            <p
              style={{
                color: "var(--ink-2)",
                fontSize: "var(--text-meta)",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Drafts ready
            </p>
            <p
              className="mt-2 font-mono tabular-nums font-semibold"
              style={{
                color: draftsReady > 0 ? "var(--success)" : "var(--ink)",
                fontSize: "var(--text-display)",
                lineHeight: 1.1,
              }}
            >
              {loading ? "—" : drafts}
            </p>
            <p
              className="mt-2"
              style={{ color: "var(--ink-2)", fontSize: "var(--text-body-sm)" }}
            >
              {draftsReady > 0
                ? "at 90%+ — ready to submit"
                : "keep drafting toward 100"}
            </p>
          </article>

          {/* Deadlines this week */}
          <article
            className="p-5"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--rule)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-card-soft)",
            }}
          >
            <p
              style={{
                color: "var(--ink-2)",
                fontSize: "var(--text-meta)",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Deadlines this week
            </p>
            <p
              className="mt-2 font-mono tabular-nums font-semibold"
              style={{
                color: deadlinesThisWeek > 0 ? "var(--warn)" : "var(--ink)",
                fontSize: "var(--text-display)",
                lineHeight: 1.1,
              }}
            >
              {loading ? "—" : deadlines}
            </p>
            <p
              className="mt-2"
              style={{ color: "var(--ink-2)", fontSize: "var(--text-body-sm)" }}
            >
              {deadlinesThisWeek > 0
                ? "start the highest-score first"
                : "no deadlines in the next 7 days"}
            </p>
          </article>
        </div>
      )}

      {/* Top match today — the value beat at the top of the dashboard.
          When onDraftTopMatch is provided, clicking triggers Smart Fill
          via the ApplyPanel (the actual auto-apply engine). Falls back
          to the manual wizard link if no handler is provided. */}
      {!loading && topMatch && (
        onDraftTopMatch ? (
          <button
            type="button"
            onClick={() => onDraftTopMatch(topMatch)}
            className="group flex items-center gap-4 p-5 transition-colors text-left w-full"
            style={{
              background: "var(--accent-soft)",
              border: "1.5px solid var(--accent)",
              borderRadius: "var(--radius-card)",
            }}
          >
            <ScoreRing
              score={topMatch.matchScore ?? 0}
              size="lg"
              label={`Top match: ${topMatch.title}`}
            />
            <div className="flex-1 min-w-0">
              <p
                style={{
                  color: "var(--accent)",
                  fontSize: "var(--text-meta)",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Top match today
              </p>
              <h2
                className="mt-1 font-semibold truncate"
                style={{ fontSize: "var(--text-title)", color: "var(--ink)" }}
              >
                {topMatch.title}
              </h2>
              <p
                className="mt-1"
                style={{ color: "var(--ink-2)", fontSize: "var(--text-body-sm)" }}
              >
                {topMatch.funder} ·{" "}
                <span
                  className="font-mono tabular-nums font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  {formatCurrency(topMatch.amount)}
                </span>
              </p>
            </div>
            <span
              className="font-medium hidden sm:inline-flex items-center gap-1"
              style={{ color: "var(--accent)", fontSize: "var(--text-body-sm)" }}
            >
              Smart Fill →
            </span>
          </button>
        ) : (
          <Link
            href={`/dashboard/grants/${topMatch.id}/apply`}
            className="group flex items-center gap-4 p-5 transition-colors"
            style={{
              background: "var(--accent-soft)",
              border: "1.5px solid var(--accent)",
              borderRadius: "var(--radius-card)",
            }}
          >
            <ScoreRing
              score={topMatch.matchScore ?? 0}
              size="lg"
              label={`Top match: ${topMatch.title}`}
            />
            <div className="flex-1 min-w-0">
              <p style={{ color: "var(--accent)", fontSize: "var(--text-meta)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Top match today</p>
              <h2 className="mt-1 font-semibold truncate" style={{ fontSize: "var(--text-title)", color: "var(--ink)" }}>{topMatch.title}</h2>
              <p className="mt-1" style={{ color: "var(--ink-2)", fontSize: "var(--text-body-sm)" }}>
                {topMatch.funder} ·{" "}
                <span className="font-mono tabular-nums font-semibold" style={{ color: "var(--ink)" }}>{formatCurrency(topMatch.amount)}</span>
              </p>
            </div>
            <span className="font-medium hidden sm:inline-flex items-center gap-1" style={{ color: "var(--accent)", fontSize: "var(--text-body-sm)" }}>Draft it →</span>
          </Link>
        )
      )}
    </section>
  );
}
