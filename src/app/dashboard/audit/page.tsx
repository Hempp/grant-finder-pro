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

  const load = useCallback(
    async (cursor?: string) => {
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
    },
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  const filtered =
    filter === "all"
      ? events
      : events.filter((e) => e.action.startsWith(filter + "."));

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-white">Audit log</h1>
        </div>
        <p className="text-slate-400 text-sm max-w-2xl">
          An append-only record of security-relevant actions on this account
          and organization. Useful for your own internal controls and for
          procurement / compliance reviews.
        </p>
      </header>

      <div
        role="group"
        aria-label="Filter audit events by category"
        className="flex flex-wrap gap-2"
      >
        {(["all", "auth", "billing", "org", "account"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
              filter === f
                ? "bg-emerald-500 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 flex items-center gap-3 text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-slate-400 text-sm flex items-start gap-3">
          <Info className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-slate-300 font-medium">Nothing to show yet</p>
            <p className="mt-1">
              Audit events will appear here as you sign in, update billing, or
              manage your team.
            </p>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((e) => (
            <li
              key={e.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  {e.result === "success" ? (
                    <CheckCircle2
                      className="h-4 w-4 text-emerald-400 flex-shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <XCircle
                      className="h-4 w-4 text-red-400 flex-shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <code className="text-white font-mono text-sm truncate">
                    {e.action}
                  </code>
                </div>
                <time
                  dateTime={e.createdAt}
                  className="text-slate-500 text-xs flex-shrink-0"
                >
                  {new Date(e.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </time>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                {e.actor && (
                  <span className="inline-flex items-center gap-1">
                    <UserIcon className="h-3 w-3" aria-hidden="true" />
                    {e.actor.name ?? e.actor.email ?? "Unknown"}
                  </span>
                )}
                {e.ipAddress && (
                  <span className="font-mono">{e.ipAddress}</span>
                )}
                {e.resource && (
                  <span>
                    <span className="text-slate-500">resource:</span>{" "}
                    <code className="font-mono">{e.resource}</code>
                  </span>
                )}
              </div>
              {e.metadata && typeof e.metadata === "object" ? (
                <details className="mt-2 text-xs">
                  <summary className="text-slate-500 cursor-pointer hover:text-slate-300">
                    Metadata
                  </summary>
                  <pre className="mt-2 p-2 rounded-lg bg-slate-950/60 text-slate-300 overflow-x-auto">
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm transition disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {loadingMore && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
