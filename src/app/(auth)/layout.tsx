import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 bg-aurora opacity-60" />
      <div className="absolute inset-0 bg-grid-pattern" />

      {/* Decorative blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-drift" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-teal-500/8 rounded-full blur-[100px] animate-drift" style={{ animationDelay: "-5s" }} />

      <header className="relative z-10 p-6">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <Sparkles className="h-7 w-7 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-bold text-white">
            Grant<span className="text-emerald-400">Pilot</span>
          </span>
        </Link>
      </header>
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        {children}
      </main>
    </div>
  );
}
