import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800/60 p-6">
        <Link href="/dashboard" className="flex items-center" aria-label="GrantPilot home">
          <img src="/logo.svg" alt="" height={32} style={{ height: 32, width: "auto" }} />
        </Link>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-12">{children}</main>
    </div>
  );
}
