"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { Mail, Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1
          className="font-semibold tracking-tight"
          style={{ fontSize: "var(--text-display)", color: "var(--ink)", lineHeight: 1.1 }}
        >
          Forgot your password?
        </h1>
        <p
          className="mt-2"
          style={{ fontSize: "var(--text-body-lg)", color: "var(--ink-2)" }}
        >
          {success
            ? "Check your email — we sent you a secure reset link."
            : "Enter your email and we'll send you a reset link."}
        </p>
      </div>

      {success ? (
        <div className="space-y-6">
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
              If an account exists with{" "}
              <span className="font-semibold">{email}</span>, we&apos;ve sent a password reset link. Check your inbox and spam folder.
            </p>
          </div>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 font-medium transition-colors hover:underline"
            style={{ color: "var(--accent)", fontSize: "var(--text-body-sm)" }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <label htmlFor="email" className="block font-medium" style={{ fontSize: "var(--text-small)", color: "var(--ink)" }}>
              Email address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: "var(--ink-2)" }}
                aria-hidden="true"
              />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                style={{ background: "var(--bg)", border: "1px solid var(--rule)", color: "var(--ink)" }}
                required
                aria-required="true"
              />
            </div>
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
                Sending...
              </>
            ) : (
              "Email me a reset link"
            )}
          </Button>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 transition-colors hover:underline"
            style={{ color: "var(--ink-2)", fontSize: "var(--text-body-sm)" }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to sign in
          </Link>
        </form>
      )}
    </div>
  );
}
