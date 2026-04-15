"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Mail,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  UserMinus,
  Info,
} from "lucide-react";
import { useToast } from "@/components/ui";

interface Invitation {
  id: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

type Status = "pending" | "accepted" | "expired" | "revoked";

function invitationStatus(inv: Invitation): Status {
  if (inv.revokedAt) return "revoked";
  if (inv.acceptedAt) return "accepted";
  if (new Date(inv.expiresAt).getTime() < Date.now()) return "expired";
  return "pending";
}

export default function TeamPage() {
  const toast = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrationPending, setMigrationPending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<{ email: string; role: Invitation["role"] }>({
    email: "",
    role: "editor",
  });

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/org/invitations");
      if (res.status === 503) {
        const body = await res.json().catch(() => ({}));
        if (body?.code === "migration_pending") {
          setMigrationPending(true);
          setInvitations([]);
          return;
        }
      }
      if (!res.ok) throw new Error("Failed to load invitations");
      const data = await res.json();
      setInvitations(data.invitations ?? []);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't load invitations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // load() is stable via useCallback in the toast context; we intentionally
    // load once on mount. Adding it as a dep causes a render loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/org/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 503 && body?.code === "migration_pending") {
        setMigrationPending(true);
        toast.info(
          "Team invitations are rolling out",
          "Try again in a few minutes."
        );
        return;
      }
      if (res.status === 402 && body?.code === "seat_limit_reached") {
        toast.warning(
          body.inviteCap === 0 ? "Team seats not included" : "Seat limit reached",
          body.error
        );
        return;
      }
      if (!res.ok) {
        toast.error("Invitation not sent", body?.error ?? "Please try again.");
        return;
      }
      toast.success("Invitation sent", `${form.email} has 14 days to accept.`);
      setForm({ email: "", role: "editor" });
      await load();
    } catch {
      toast.error("Network error", "Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRevoke(id: string) {
    try {
      const res = await fetch(`/api/org/invitations/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error("Couldn't revoke", body?.error ?? "Please try again.");
        return;
      }
      toast.success("Invitation revoked");
      await load();
    } catch {
      toast.error("Network error");
    }
  }

  const pending = invitations.filter((i) => invitationStatus(i) === "pending");
  const history = invitations.filter((i) => invitationStatus(i) !== "pending");

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Users className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-white">Team</h1>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-semibold uppercase tracking-wider border border-amber-500/30">
            Phase 1
          </span>
        </div>
        <p className="text-slate-400 text-sm max-w-2xl">
          Invite collaborators to link them to this organization.
        </p>
      </header>

      {/* Honest disclosure — kept up-to-date with what each phase
          actually delivers. Phase 2a just shipped shared reads for
          the grant pipeline, applications, and readiness score. */}
      <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-sky-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm">
          <p className="text-sky-200 font-medium">What team membership unlocks today:</p>
          <ul className="mt-2 text-sky-200/80 space-y-1 list-disc list-inside pl-1">
            <li>Linked account + role on record (admin / editor / viewer).</li>
            <li>
              Shared read access to the organization&apos;s grant pipeline,
              applications, documents, and readiness score.
            </li>
            <li>Audit-log attribution for every action members take.</li>
          </ul>
          <p className="mt-2 text-sky-200 font-medium">Still in progress (phase 2b):</p>
          <ul className="mt-1 text-sky-200/80 space-y-1 list-disc list-inside pl-1">
            <li>Co-authoring with real-time presence on individual applications.</li>
            <li>Shared Content Library edits across the team.</li>
          </ul>
          <p className="mt-3 text-sky-200/70 text-xs">
            Writes still attach to each member&apos;s own account so authorship
            is preserved. An invite you send today works as soon as your
            teammate accepts — no re-invite when phase 2b lands.
          </p>
        </div>
      </div>

      {migrationPending && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-amber-300 font-medium">Team invitations are rolling out.</p>
            <p className="text-amber-200/80 text-sm mt-1">
              This feature requires a database update that&apos;s queued for
              deployment. Check back in a few minutes.
            </p>
          </div>
        </div>
      )}

      <section aria-labelledby="invite-heading" className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 id="invite-heading" className="text-lg font-semibold text-white mb-4">
          Invite a teammate
        </h2>
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 min-w-0">
            <label htmlFor="invite-email" className="sr-only">
              Email address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
                aria-hidden="true"
              />
              <input
                id="invite-email"
                type="email"
                required
                disabled={migrationPending || submitting}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="teammate@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-60"
              />
            </div>
          </div>
          <div>
            <label htmlFor="invite-role" className="sr-only">
              Role
            </label>
            <select
              id="invite-role"
              value={form.role}
              disabled={migrationPending || submitting}
              onChange={(e) =>
                setForm((f) => ({ ...f, role: e.target.value as Invitation["role"] }))
              }
              className="w-full sm:w-auto px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-60"
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={migrationPending || submitting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Mail className="h-4 w-4" aria-hidden="true" />
            )}
            Send invitation
          </button>
        </form>
        <p className="text-xs text-slate-500 mt-3">
          <strong className="text-slate-400">Admin</strong> manages members and
          all content. <strong className="text-slate-400">Editor</strong> creates
          and edits applications. <strong className="text-slate-400">Viewer</strong>
          {" "}has read-only access. Invitations expire after 14 days.
        </p>
      </section>

      <section aria-labelledby="pending-heading">
        <h2 id="pending-heading" className="text-lg font-semibold text-white mb-3">
          Pending invitations
          <span className="text-slate-500 font-normal text-sm ml-2">
            {pending.length}
          </span>
        </h2>
        {loading ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 flex items-center gap-3 text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading…
          </div>
        ) : pending.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-slate-400 text-sm">
            No pending invitations.
          </div>
        ) : (
          <ul className="space-y-2">
            {pending.map((inv) => (
              <li
                key={inv.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{inv.email}</p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {inv.role} · expires{" "}
                    {new Date(inv.expiresAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRevoke(inv.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  aria-label={`Revoke invitation to ${inv.email}`}
                >
                  <UserMinus className="h-4 w-4" aria-hidden="true" />
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {history.length > 0 && (
        <section aria-labelledby="history-heading">
          <h2 id="history-heading" className="text-lg font-semibold text-white mb-3">
            History
          </h2>
          <ul className="space-y-2">
            {history.map((inv) => {
              const status = invitationStatus(inv);
              return (
                <li
                  key={inv.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/30 p-4"
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <StatusIcon status={status} />
                    <div className="min-w-0">
                      <p className="text-slate-200 truncate">{inv.email}</p>
                      <p className="text-slate-500 text-xs mt-0.5 capitalize">
                        {status} · {inv.role}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: Status }) {
  if (status === "accepted") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />;
  }
  if (status === "revoked") {
    return <XCircle className="h-4 w-4 text-red-400" aria-hidden="true" />;
  }
  if (status === "expired") {
    return <RotateCcw className="h-4 w-4 text-amber-400" aria-hidden="true" />;
  }
  return <Clock className="h-4 w-4 text-slate-400" aria-hidden="true" />;
}
