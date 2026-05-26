"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  Info,
  User as UserIcon,
} from "lucide-react";

/**
 * Audit log viewer — the compliance story users see inside the app.
 *
 * The /trust page promises an append-only audit trail for auth events,
 * billing lifecycle, account lifecycle, and org mutations. This page is
 * the user-facing verification that we're actually keeping it, and
 * gives nonprofit owners the ability to spot-check teammate activity
 * for their own internal controls.
 *
 * Scope: server pools audit rows across the caller's org (see
 * /api/audit). Solo users see just their own events.
 */

interface AuditEvent {
  id: string;
  action: string;
  resource: string | null;
  result: "success" | "failure";
  createdAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  actor: { name: string | null; email: string | null } | null;
  metadata: unknown;
}

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<"all" | "auth" | "billing" | "org" | "account">("all");

  const load = useCallback(async (cursor?: string) => {
    if (cursor) setLoadingMore(true);
    else setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (cursor) params.set("cursor", cursor);
      const res = await fetch(`/api/audit?${params}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setEvents((prev) => (cursor ? [...prev, ...(data.events ?? [])] : data.events ?? []));
      setNextCursor(data.nextCursor ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered =
    filter === "all" ? events : events.filter((e) => e.action.startsWith(filter + "."));

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div
            className="p-2 inline-flex"
            style={{
              background: "var(--accent-soft)",
              color: "var(--accent)",
              borderRadius: "var(--radius-control)",
            }}
          >
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1
            className="font-semibold tracking-tight"
            style={{ fontSize: "var(--text-display)", color: "var(--ink)", lineHeight: 1.1 }}
          >
            Audit log
          </h1>
        </div>
        <p
          className="max-w-2xl"
          style={{ fontSize: "var(--text-body)", color: "var(--ink-2)", lineHeight: 1.6 }}
        >
          An append-only record of security-relevant actions on this account and organization.
          Useful for your own internal controls and for procurement / compliance reviews.
        </p>
      </header>

      <div
        role="group"
        aria-label="Filter audit events by category"
        className="flex flex-wrap gap-2"
      >
        {(["all", "auth", "billing", "org", "account"] as const).map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={active}
              className="px-3 py-1.5 font-medium transition focus:outline-none focus-visible:ring-2"
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
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div
          className="p-6 flex items-center gap-3"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--rule)",
            borderRadius: "var(--radius-card)",
            color: "var(--ink-2)",
            fontSize: "var(--text-body-sm)",
          }}
        >
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="p-6 flex items-start gap-3"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--rule)",
            borderRadius: "var(--radius-card)",
            fontSize: "var(--text-body-sm)",
          }}
        >
          <Info
            className="h-5 w-5 flex-shrink-0 mt-0.5"
            style={{ color: "var(--ink-2)" }}
            aria-hidden="true"
          />
          <div>
            <p className="font-medium" style={{ color: "var(--ink)" }}>
              Nothing to show yet
            </p>
            <p className="mt-1" style={{ color: "var(--ink-2)", lineHeight: 1.55 }}>
              Audit events will appear here as you sign in, update billing, or manage your team.
            </p>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((e) => (
            <li
              key={e.id}
              className="p-4"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--rule)",
                borderRadius: "var(--radius-card)",
                boxShadow: "var(--shadow-card-soft)",
              }}
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  {e.result === "success" ? (
                    <CheckCircle2
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: "var(--success)" }}
                      aria-hidden="true"
                    />
                  ) : (
                    <XCircle
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: "var(--warn)" }}
                      aria-hidden="true"
                    />
                  )}
                  <code
                    className="font-mono truncate"
                    style={{ fontSize: "var(--text-body-sm)", color: "var(--ink)" }}
                  >
                    {e.action}
                  </code>
                </div>
                <time
                  dateTime={e.createdAt}
                  className="flex-shrink-0"
                  style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
                >
                  {new Date(e.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </time>
              </div>
              <div
                className="mt-2 flex items-center gap-3 flex-wrap"
                style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
              >
                {e.actor && (
                  <span className="inline-flex items-center gap-1">
                    <UserIcon className="h-3 w-3" aria-hidden="true" />
                    {e.actor.name ?? e.actor.email ?? "Unknown"}
                  </span>
                )}
                {e.ipAddress && <span className="font-mono">{e.ipAddress}</span>}
                {e.resource && (
                  <span>
                    <span style={{ color: "var(--ink-2)", opacity: 0.7 }}>resource:</span>{" "}
                    <code className="font-mono">{e.resource}</code>
                  </span>
                )}
              </div>
              {e.metadata && typeof e.metadata === "object" ? (
                <details className="mt-2">
                  <summary
                    className="cursor-pointer hover:opacity-80"
                    style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
                  >
                    Metadata
                  </summary>
                  <pre
                    className="mt-2 p-2 overflow-x-auto"
                    style={{
                      background: "var(--bg-soft)",
                      color: "var(--ink)",
                      fontSize: "var(--text-caption)",
                      borderRadius: "var(--radius-control)",
                    }}
                  >
                    {JSON.stringify(e.metadata, null, 2)}
                  </pre>
                </details>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {nextCursor && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => load(nextCursor)}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 px-4 py-2 transition disabled:opacity-60 focus:outline-none focus-visible:ring-2"
            style={{
              background: "var(--surface)",
              color: "var(--ink)",
              border: "1px solid var(--rule)",
              fontSize: "var(--text-body-sm)",
              borderRadius: "var(--radius-control)",
            }}
          >
            {loadingMore && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
