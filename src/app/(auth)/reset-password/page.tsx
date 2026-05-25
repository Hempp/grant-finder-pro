"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { Lock, Loader2, AlertCircle, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordRequirements = [
    { met: password.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(password), text: "One uppercase letter" },
    { met: /[0-9]/.test(password), text: "One number" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full text-center space-y-5">
        <AlertCircle
          className="h-10 w-10 mx-auto"
          style={{ color: "var(--warn)" }}
          aria-hidden="true"
        />
        <h1
          className="font-semibold tracking-tight"
          style={{ fontSize: "var(--text-display)", color: "var(--ink)", lineHeight: 1.1 }}
        >
          Invalid reset link
        </h1>
        <p style={{ fontSize: "var(--text-body-lg)", color: "var(--ink-2)" }}>
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block font-medium transition-colors hover:underline"
          style={{ color: "var(--accent)" }}
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1
          className="font-semibold tracking-tight"
          style={{ fontSize: "var(--text-display)", color: "var(--ink)", lineHeight: 1.1 }}
        >
          Set a new password
        </h1>
        <p
          className="mt-2"
          style={{ fontSize: "var(--text-body-lg)", color: "var(--ink-2)" }}
        >
          Choose a strong password for your account.
        </p>
      </div>

      {success ? (
        <div
          className="flex items-start gap-2.5 p-4 rounded-lg"
          style={{
            background: "var(--success-soft)",
            border: "1px solid var(--success)",
          }}
        >
          <CheckCircle
            className="h-4 w-4 mt-0.5 flex-shrink-0"
            style={{ color: "var(--success)" }}
            aria-hidden="true"
          />
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--ink)" }}>
            Password reset. Redirecting you to sign in.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-2.5 p-3 rounded-lg"
              style={{
                background: "var(--warn-soft)",
                border: "1px solid var(--warn)",
                color: "var(--warn)",
                fontSize: "var(--text-body-sm)",
              }}
            >
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="password" className="block font-medium" style={{ fontSize: "var(--text-small)", color: "var(--ink)" }}>
              New password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: "var(--ink-2)" }}
                aria-hidden="true"
              />
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                style={{ background: "var(--bg)", border: "1px solid var(--rule)", color: "var(--ink)" }}
                required
              />
            </div>
            {password && (
              <div className="space-y-1 mt-2">
                {passwordRequirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-2" style={{ fontSize: "var(--text-caption)" }}>
                    {req.met ? (
                      <CheckCircle className="h-3 w-3" style={{ color: "var(--success)" }} aria-hidden="true" />
                    ) : (
                      <div className="h-3 w-3 rounded-full" style={{ border: "1px solid var(--rule)" }} aria-hidden="true" />
                    )}
                    <span style={{ color: req.met ? "var(--success)" : "var(--ink-2)" }}>{req.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block font-medium" style={{ fontSize: "var(--text-small)", color: "var(--ink)" }}>
              Confirm password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: "var(--ink-2)" }}
                aria-hidden="true"
              />
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
                style={{ background: "var(--bg)", border: "1px solid var(--rule)", color: "var(--ink)" }}
                required
              />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p style={{ fontSize: "var(--text-caption)", color: "var(--warn)" }}>
                Passwords do not match
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full !text-white"
            style={{
              background: "var(--accent)",
              borderColor: "var(--accent)",
              fontSize: "var(--text-body)",
              padding: "12px 16px",
              height: "auto",
              borderRadius: "var(--radius-control)",
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset password"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--accent)" }} />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
