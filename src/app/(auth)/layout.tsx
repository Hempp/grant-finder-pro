import { Metadata } from "next";
import Link from "next/link";
import { AuthMotifPanel } from "@/components/auth/AuthMotifPanel";

export const metadata: Metadata = {
  title: {
    template: "%s | GrantPilot",
    default: "Sign In | GrantPilot",
  },
  description: "Access your GrantPilot account to find grants, manage applications, and track funding.",
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-theme="editorial"
      className="min-h-screen grid md:grid-cols-2"
      style={{ background: "var(--bg)", color: "var(--ink)" }}
    >
      <div className="flex flex-col">
        <header className="p-6 sm:p-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 group"
            aria-label="GrantPilot home"
          >
            <img
              src="/logo.svg"
              alt=""
              height={28}
              style={{ height: 28, width: "auto" }}
              className="transition-transform group-hover:scale-105"
            />
            <span
              className="font-semibold"
              style={{ fontSize: "var(--text-title)", color: "var(--ink)" }}
            >
              GrantPilot
            </span>
          </Link>
        </header>
        <main className="flex-1 flex items-start sm:items-center justify-center px-4 sm:px-8 pb-12">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
      <AuthMotifPanel />
    </div>
  );
}
