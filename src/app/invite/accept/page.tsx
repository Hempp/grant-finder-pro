"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Sparkles, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

interface InvitationPreview {
  email: string;
  role: string;
  organizationName: string;
  inviterName: string | null;
  inviterEmail: string | null;
  expiresAt: string;
}

type ViewState =
  | { kind: "loading" }
  | { kind: "needs-signup"; token: string; preview: InvitationPreview }
  | { kind: "confirm"; token: string; preview: InvitationPreview }
  | { kind: "accepting" }
  | { kind: "success"; organizationId: string }
  | { kind: "error"; message: string };

// useSearchParams triggers a client-side bailout; wrapping in Suspense
// lets the rest of the shell prerender while the param resolves.
export default function InviteAcceptPage() {
  return (
    <Suspense fallback={<InviteAcceptShell loading />}>
      <InviteAcceptInner />
    </Suspense>
  );
}

function InviteAcceptShell({ loading }: { loading?: boolean }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-emerald-400" aria-hidden="true" />
            <span className="font-bold text-white text-lg">GrantPilot</span>
          </Link>
        </div>
      </header>
      <main id="main-content" className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        {loading && (
          <div className="flex items-center gap-3 text-slate-300">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            Loading invitation…
          </div>
        )}
      </main>
    </div>
  );
}

function InviteAcceptInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: session, status } = useSession();
  const token = params.get("token");

  const [view, setView] = useState<ViewState>({ kind: "loading" });

  useEffect(() => {
    if (status === "loading") return;
    if (!token) {
      setView({ kind: "error", message: "This invitation link is incomplete." });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/org/invitations/preview?token=${encodeURIComponent(token)}`
        );
        const data = await res.json();
        if (cancelled) return;

        if (!data?.valid) {
          setView({
            kind: "error",
            message:
              "This invitation is invalid or has expired. Ask your teammate to send a new one.",
          });
          return;
        }

        const preview: InvitationPreview = {
          email: data.email,
          role: data.role,
          organizationName: data.organizationName,
          inviterName: data.inviterName,
          inviterEmail: data.inviterEmail,
          expiresAt: data.expiresAt,
        };

        if (!session?.user) {
          setView({ kind: "needs-signup", token, preview });
        } else {
          setView({ kind: "confirm", token, preview });
        }
      } catch {
        if (!cancelled) {
          setView({
            kind: "error",
            message: "Network error. Try again in a moment.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, session, status]);

  async function handleAccept() {
    if (!token) return;
    setView({ kind: "accepting" });
    try {
      const res = await fetch("/api/org/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setView({
          kind: "error",
          message: data.error ?? "Failed to accept invitation.",
        });
        return;
      }
      setView({ kind: "success", organizationId: data.organizationId });
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      setView({ kind: "error", message: "Network error. Try again." });
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-emerald-400" aria-hidden="true" />
            <span className="font-bold text-white text-lg">GrantPilot</span>
          </Link>
        </div>
      </header>

      <main
        id="main-content"
        className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12"
      >
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
          {view.kind === "loading" && (
            <div className="flex items-center gap-3 text-slate-300">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              Checking invitation…
            </div>
          )}

          {view.kind === "needs-signup" && (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">
                Join {view.preview.organizationName}
              </h1>
              <InvitationSummary preview={view.preview} />
              <div className="flex flex-col gap-3 mt-6">
                <Link
                  href={`/signup?invite=${encodeURIComponent(view.token)}`}
                  className="inline-flex justify-center items-center px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition focus-ring"
                >
                  Create account
                </Link>
                <Link
                  href={`/login?invite=${encodeURIComponent(view.token)}`}
                  className="inline-flex justify-center items-center px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition focus-ring"
                >
                  Sign in
                </Link>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                Sign up with <span className="text-slate-300">{view.preview.email}</span>
                {" "}to accept — that&apos;s the address this invitation was sent to.
              </p>
            </>
          )}

          {view.kind === "confirm" && (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">
                Join {view.preview.organizationName}
              </h1>
              <InvitationSummary preview={view.preview} />
              <p className="text-slate-400 text-sm mt-4 mb-4">
                Signed in as{" "}
                <span className="text-slate-200 font-medium">{session?.user?.email}</span>.
              </p>
              <button
                type="button"
                onClick={handleAccept}
                className="w-full inline-flex justify-center items-center px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition focus-ring"
              >
                Accept and join {view.preview.organizationName}
              </button>
              <p className="text-xs text-slate-500 mt-4">
                Wrong account?{" "}
                <Link href="/api/auth/signout" className="text-emerald-400 hover:text-emerald-300">
                  Sign out
                </Link>{" "}
                and use the right one.
              </p>
            </>
          )}

          {view.kind === "accepting" && (
            <div className="flex items-center gap-3 text-slate-300">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              Joining organization…
            </div>
          )}

          {view.kind === "success" && (
            <>
              <div className="flex items-center gap-3 text-emerald-400 mb-2">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                <h1 className="text-2xl font-bold">You&apos;re in</h1>
              </div>
              <p className="text-slate-400">Redirecting you to the dashboard…</p>
            </>
          )}

          {view.kind === "error" && (
            <>
              <div className="flex items-center gap-3 text-amber-400 mb-2">
                <AlertTriangle className="h-6 w-6" aria-hidden="true" />
                <h1 className="text-2xl font-bold">We couldn&apos;t accept this invitation</h1>
              </div>
              <p className="text-slate-400 mb-6">{view.message}</p>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm transition focus-ring"
              >
                Back to dashboard
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/** Rendered above both the needs-signup and confirm buttons so the
 *  invitee always sees who invited them, what role they're accepting,
 *  and when the link expires — before any commitment. */
function InvitationSummary({ preview }: { preview: InvitationPreview }) {
  const inviter =
    preview.inviterName && preview.inviterEmail
      ? `${preview.inviterName} (${preview.inviterEmail})`
      : preview.inviterName ?? preview.inviterEmail ?? "A teammate";
  const expiresOn = new Date(preview.expiresAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm">
      <p className="text-slate-300">
        <span className="text-slate-500">Invited by</span>{" "}
        <span className="font-medium">{inviter}</span>
      </p>
      <p className="text-slate-300 mt-1">
        <span className="text-slate-500">Role</span>{" "}
        <span className="font-medium capitalize">{preview.role}</span>
      </p>
      <p className="text-slate-500 mt-2 text-xs">
        Link expires {expiresOn}
      </p>
    </div>
  );
}
