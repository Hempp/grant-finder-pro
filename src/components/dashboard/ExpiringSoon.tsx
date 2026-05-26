"use client";

import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle } from "lucide-react";

interface ExpiringGrant {
  id: string;
  title: string;
  funder: string;
  deadline: string;
  matchScore: number | null;
}

interface ExpiringSoonProps {
  grants: ExpiringGrant[];
}

function daysUntil(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function ExpiringSoon({ grants }: ExpiringSoonProps) {
  const expiring = grants
    .filter((g) => g.deadline && daysUntil(g.deadline) >= 0 && daysUntil(g.deadline) <= 14)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  if (expiring.length === 0) return null;

  return (
    <article
      style={{
        background: "var(--surface)",
        border: "1px solid var(--warn)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card-soft)",
      }}
    >
      <header
        className="flex items-center justify-between p-4"
        style={{ borderBottom: "1px solid var(--rule)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="p-2 inline-flex"
            style={{
              background: "var(--warn-soft)",
              color: "var(--warn)",
              borderRadius: "var(--radius-control)",
            }}
          >
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          </div>
          <h2
            className="font-semibold"
            style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
          >
            Expiring soon
          </h2>
        </div>
        <Link
          href="/dashboard/grants?sort=deadline"
          className="flex items-center gap-1 font-medium transition-colors hover:underline"
          style={{ color: "var(--accent)", fontSize: "var(--text-body-sm)" }}
        >
          View all <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </header>
      <div className="p-3 space-y-2">
        {expiring.map((grant) => {
          const days = daysUntil(grant.deadline);
          const urgencyColor =
            days <= 3 ? "var(--warn)" : days <= 7 ? "var(--warn)" : "var(--ink-2)";
          return (
            <Link
              key={grant.id}
              href={`/dashboard/grants/${grant.id}/apply`}
              className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-[var(--bg-soft)]"
            >
              <div className="flex-1 min-w-0">
                <h3
                  className="font-medium truncate"
                  style={{ fontSize: "var(--text-body-sm)", color: "var(--ink)" }}
                >
                  {grant.title}
                </h3>
                <p
                  className="truncate"
                  style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
                >
                  {grant.funder}
                </p>
              </div>
              <div
                className="flex items-center gap-1 font-medium ml-4 flex-shrink-0"
                style={{ fontSize: "var(--text-body-sm)", color: urgencyColor }}
              >
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d left`}
              </div>
            </Link>
          );
        })}
      </div>
    </article>
  );
}
