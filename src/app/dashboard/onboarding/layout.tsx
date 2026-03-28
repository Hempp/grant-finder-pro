import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800/60 p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-emerald-400" />
          <span className="text-xl font-bold text-white">
            Grant<span className="text-emerald-400">Pilot</span>
          </span>
        </Link>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-12">{children}</main>
    </div>
  );
}
