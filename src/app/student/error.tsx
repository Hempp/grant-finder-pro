"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";

export default function StudentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Student segment error:", error);
  }, [error]);

  const isAuth = error.message?.toLowerCase().includes("unauth");

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/30 mb-4">
          <AlertCircle className="h-6 w-6 text-purple-400" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          {isAuth ? "Your session expired" : "This page hit a snag"}
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          {isAuth
            ? "Sign in again to keep applying — your essays and matches are saved."
            : "Something went wrong loading this view. Your applications are safe. Try again, or head back to your dashboard."}
        </p>
        {error.digest && (
          <p className="text-xs text-slate-600 mb-4">Error ID: {error.digest}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isAuth ? (
            <Link href="/login">
              <Button className="w-full sm:w-auto">Sign in again</Button>
            </Link>
          ) : (
            <Button onClick={reset} className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
              Try again
            </Button>
          )}
          <Link href="/student">
            <Button variant="secondary" className="w-full sm:w-auto">
              Back to your dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
