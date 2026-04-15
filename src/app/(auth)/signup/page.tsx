"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input, Card } from "@/components/ui";
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle, Gift, Building2, GraduationCap } from "lucide-react";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref");

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
      // Register user
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

      // Auto sign in after registration
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

      const redirectUrl = userType === "student" ? "/student/onboarding" : "/dashboard/organization";
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
    <Card className="w-full max-w-md p-5 sm:p-8 glass-card animate-reveal">
      {/* Referral Banner */}
      {referralCode && (
        <div className="mb-4 sm:mb-6 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3 animate-fade-in-down">
          <Gift className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <p className="text-sm text-emerald-300">
            You were referred! <span className="font-semibold">5 bonus grant matches</span> are added to your account on signup — they expire 30 days from today.
          </p>
        </div>
      )}

      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Start winning grants today</h1>
        <p className="text-slate-400 text-sm">Free to start. No credit card. AI-powered matching and drafting from your first session.</p>
      </div>

      {/* User Type Selector */}
      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => setUserType("organization")}
          className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${
            userType === "organization"
              ? "border-emerald-500/50 bg-emerald-500/10"
              : "border-slate-700 hover:border-slate-600"
          }`}
        >
          <Building2 className="h-6 w-6 text-slate-300" />
          <span className="text-sm font-medium text-white">Organization</span>
          <span className="text-xs text-slate-400 text-center">Nonprofits, startups, research</span>
        </button>
        <button
          type="button"
          onClick={() => setUserType("student")}
          className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${
            userType === "student"
              ? "border-emerald-500/50 bg-emerald-500/10"
              : "border-slate-700 hover:border-slate-600"
          }`}
        >
          <GraduationCap className="h-6 w-6 text-slate-300" />
          <span className="text-sm font-medium text-white">Student</span>
          <span className="text-xs text-slate-400 text-center">Undergrad, graduate, medical, law</span>
        </button>
      </div>

      {/* Social Signup */}
      <div className="space-y-3 mb-6">
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard/organization" })}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-medium py-2.5 px-4 rounded-lg transition-colors"
        >
          <GoogleIcon />
          Sign up with Google
        </button>
        <button
          onClick={() => signIn("github", { callbackUrl: "/dashboard/organization" })}
          className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 px-4 rounded-lg border border-slate-700 transition-colors"
        >
          <GitHubIcon />
          Sign up with GitHub
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-slate-900 text-slate-500">or sign up with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm animate-shake"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-300">Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" aria-hidden="true" />
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 glass-input text-white placeholder:text-slate-500"
              required
              aria-required="true"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-300">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 glass-input text-white placeholder:text-slate-500"
              required
              aria-required="true"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-slate-300">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 glass-input text-white placeholder:text-slate-500"
              required
              aria-required="true"
            />
          </div>
          {password && (
            <div className="space-y-1 mt-2">
              {passwordRequirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {req.met ? (
                    <CheckCircle className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-slate-600" />
                  )}
                  <span className={req.met ? "text-emerald-400" : "text-slate-500"}>
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" aria-hidden="true" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 glass-input text-white placeholder:text-slate-500"
              required
              aria-required="true"
            />
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-400">Passwords do not match</p>
          )}
        </div>

        <p className="text-xs text-slate-500 text-center">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="text-emerald-400 hover:text-emerald-300">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300">Privacy Policy</Link>.
        </p>

        <Button
          type="submit"
          className="w-full btn-magnetic"
          variant="gradient"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-slate-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          Sign in
        </Link>
      </div>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <Card className="w-full max-w-md p-5 sm:p-8 glass-card flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </Card>
    }>
      <SignupForm />
    </Suspense>
  );
}
