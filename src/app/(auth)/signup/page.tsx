"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle, Gift, Building2, GraduationCap } from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref");
  const inviteToken = searchParams.get("invite");

  const [userType, setUserType] = useState<"organization" | "student">("organization");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, referralCode, userType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account");
        setLoading(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created but failed to sign in. Please try logging in.");
        setLoading(false);
        return;
      }

      // Team-seat invites take precedence over the default onboarding
      // destination — otherwise the token is lost after signup and the
      // user can't finish accepting.
      const redirectUrl = inviteToken
        ? `/invite/accept?token=${encodeURIComponent(inviteToken)}`
        : userType === "student"
        ? "/student/onboarding"
        : "/dashboard/organization";
      router.push(redirectUrl);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const passwordRequirements = [
    { met: password.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(password), text: "One uppercase letter" },
    { met: /[0-9]/.test(password), text: "One number" },
  ];

  return (
    <div className="w-full">
      {referralCode && (
        <div
          className="mb-6 p-3 rounded-lg flex items-start gap-2.5"
          style={{
            background: "var(--accent-soft)",
            border: "1px solid var(--accent)",
          }}
        >
          <Gift className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--accent)" }} aria-hidden="true" />
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--ink)" }}>
            You were referred.{" "}
            <span className="font-semibold">5 bonus grant matches</span> are added on signup — they expire 30 days from today.
          </p>
        </div>
      )}

      <div className="mb-8">
        <h1
          className="font-semibold tracking-tight"
          style={{ fontSize: "var(--text-display)", color: "var(--ink)", lineHeight: 1.1 }}
        >
          Create your account
        </h1>
        <p
          className="mt-2"
          style={{ fontSize: "var(--text-body-lg)", color: "var(--ink-2)" }}
        >
          Free to start. AI-powered matching from your first session.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setUserType("organization")}
          className="flex flex-col items-center gap-2 p-4 rounded-lg transition-colors"
          style={
            userType === "organization"
              ? {
                  background: "var(--accent-soft)",
                  border: "1.5px solid var(--accent)",
                }
              : {
                  background: "var(--bg)",
                  border: "1px solid var(--rule)",
                }
          }
          aria-pressed={userType === "organization"}
        >
          <Building2
            className="h-5 w-5"
            style={{ color: userType === "organization" ? "var(--accent)" : "var(--ink-2)" }}
            aria-hidden="true"
          />
          <span
            className="font-medium"
            style={{ fontSize: "var(--text-small)", color: "var(--ink)" }}
          >
            Organization
          </span>
          <span
            className="text-center"
            style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
          >
            Nonprofits, startups, research
          </span>
        </button>
        <button
          type="button"
          onClick={() => setUserType("student")}
          className="flex flex-col items-center gap-2 p-4 rounded-lg transition-colors"
          style={
            userType === "student"
              ? {
                  background: "var(--accent-soft)",
                  border: "1.5px solid var(--accent)",
                }
              : {
                  background: "var(--bg)",
                  border: "1px solid var(--rule)",
                }
          }
          aria-pressed={userType === "student"}
        >
          <GraduationCap
            className="h-5 w-5"
            style={{ color: userType === "student" ? "var(--accent)" : "var(--ink-2)" }}
            aria-hidden="true"
          />
          <span
            className="font-medium"
            style={{ fontSize: "var(--text-small)", color: "var(--ink)" }}
          >
            Student
          </span>
          <span
            className="text-center"
            style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
          >
            Undergrad, grad, medical, law
          </span>
        </button>
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
          <label htmlFor="name" className="block font-medium" style={{ fontSize: "var(--text-small)", color: "var(--ink)" }}>
            Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--ink-2)" }} aria-hidden="true" />
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10"
              style={{ background: "var(--bg)", border: "1px solid var(--rule)", color: "var(--ink)" }}
              required
              aria-required="true"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block font-medium" style={{ fontSize: "var(--text-small)", color: "var(--ink)" }}>
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--ink-2)" }} aria-hidden="true" />
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

        <div className="space-y-2">
          <label htmlFor="password" className="block font-medium" style={{ fontSize: "var(--text-small)", color: "var(--ink)" }}>
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--ink-2)" }} aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              style={{ background: "var(--bg)", border: "1px solid var(--rule)", color: "var(--ink)" }}
              required
              aria-required="true"
              aria-describedby="password-requirements"
            />
          </div>
          {password && (
            <div
              id="password-requirements"
              aria-live="polite"
              aria-label="Password requirements"
              className="space-y-1 mt-2"
            >
              {passwordRequirements.map((req, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2"
                  style={{ fontSize: "var(--text-caption)" }}
                >
                  {req.met ? (
                    <CheckCircle className="h-3 w-3" style={{ color: "var(--success)" }} aria-hidden="true" />
                  ) : (
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ border: "1px solid var(--rule)" }}
                      aria-hidden="true"
                    />
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
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--ink-2)" }} aria-hidden="true" />
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10"
              style={{ background: "var(--bg)", border: "1px solid var(--rule)", color: "var(--ink)" }}
              required
              aria-required="true"
            />
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p style={{ fontSize: "var(--text-caption)", color: "var(--warn)" }}>
              Passwords do not match
            </p>
          )}
        </div>

        <p
          className="text-center"
          style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
        >
          By signing up, you agree to our{" "}
          <Link href="/terms" className="hover:underline" style={{ color: "var(--accent)" }}>
            Terms of Service
          </Link>
          {" "}and{" "}
          <Link href="/privacy" className="hover:underline" style={{ color: "var(--accent)" }}>
            Privacy Policy
          </Link>
          .
        </p>

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
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <p
        className="mt-8 text-center"
        style={{ fontSize: "var(--text-body-sm)", color: "var(--ink-2)" }}
      >
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium transition-colors hover:underline"
          style={{ color: "var(--accent)" }}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--accent)" }} />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
