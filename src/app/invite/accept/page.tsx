"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Sparkles, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

type ViewState =
  | { kind: "loading" }
  | { kind: "needs-signup"; token: string }
  | { kind: "confirm"; token: string }
  | { kind: "accepting" }
  | { kind: "success"; organizationId: string }
  | { kind: "error"; message: string };

export default function InviteAcceptPage() {
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
    if (!session?.user) {
      setView({ kind: "needs-signup", token });
      return;
    }
    setView({ kind: "confirm", token });
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
              <h1 className="text-2xl font-bold text-white mb-2">Join on GrantPilot</h1>
              <p className="text-slate-400 mb-6">
                You&apos;ve been invited to collaborate. Create an account or sign in to accept
                the invitation — we&apos;ll return you here automatically.
              </p>
              <div className="flex flex-col gap-3">
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
            </>
          )}

          {view.kind === "confirm" && (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">Accept invitation</h1>
              <p className="text-slate-400 mb-6">
                Signed in as{" "}
                <span className="text-slate-200 font-medium">{session?.user?.email}</span>.
                Clicking below adds you to the organization that invited you.
              </p>
              <button
                type="button"
                onClick={handleAccept}
                className="w-full inline-flex justify-center items-center px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition focus-ring"
              >
                Accept invitation
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
