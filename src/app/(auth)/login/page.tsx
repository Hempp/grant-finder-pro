"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";

// useSearchParams triggers a client-side bailout; the Suspense wrapper
// lets Next prerender the shell around it.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const nextRedirect = inviteToken
    ? `/invite/accept?token=${encodeURIComponent(inviteToken)}`
    : "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email or password doesn't match. Try again, or reset your password below.");
        setLoading(false);
        return;
      }

      router.push(nextRedirect);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
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
          Welcome back
        </h1>
        <p
          className="mt-2"
          style={{ fontSize: "var(--text-body-lg)", color: "var(--ink-2)" }}
        >
          Pick up where you left off — your grants and scholarships are waiting.
        </p>
      </div>

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
          <label
            htmlFor="email"
            className="block font-medium"
            style={{ fontSize: "var(--text-small)", color: "var(--ink)" }}
          >
            Email
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
              style={{
                background: "var(--bg)",
                border: "1px solid var(--rule)",
                color: "var(--ink)",
              }}
              required
              aria-required="true"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block font-medium"
              style={{ fontSize: "var(--text-small)", color: "var(--ink)" }}
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="font-medium transition-colors hover:underline"
              style={{ fontSize: "var(--text-caption)", color: "var(--accent)" }}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: "var(--ink-2)" }}
              aria-hidden="true"
            />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--rule)",
                color: "var(--ink)",
              }}
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
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <p
        className="mt-8 text-center"
        style={{ fontSize: "var(--text-body-sm)", color: "var(--ink-2)" }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium transition-colors hover:underline"
          style={{ color: "var(--accent)" }}
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
