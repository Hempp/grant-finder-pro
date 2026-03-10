"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Sparkles,
  LayoutDashboard,
  Search,
  FileText,
  Building2,
  Upload,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  Gift,
} from "lucide-react";
import { TrialBanner } from "@/components/subscription/TrialBanner";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Find Grants", href: "/dashboard/grants", icon: Search },
  { name: "Applications", href: "/dashboard/applications", icon: FileText },
  { name: "Documents", href: "/dashboard/documents", icon: Upload },
  { name: "Organization", href: "/dashboard/organization", icon: Building2 },
  { name: "Referrals", href: "/dashboard/referrals", icon: Gift },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row">
      {/* Mobile Header - sticky so it stays visible on scroll */}
      <div className="lg:hidden glass-dark border-b border-slate-800 p-3 sm:p-4 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-emerald-400" />
          <span className="text-lg font-bold text-white">GrantPilot</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white transition"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[280px] sm:w-64 max-w-[85vw] bg-slate-950/95 lg:bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/60 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo - Desktop only */}
        <div className="hidden lg:block p-6 border-b border-slate-800/60">
          <Link href="/" className="flex items-center gap-2 group">
            <Sparkles className="h-8 w-8 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold text-white">
              Grant<span className="text-emerald-400">Pilot</span>
            </span>
          </Link>
        </div>

        {/* Mobile close button area */}
        <div className="lg:hidden p-4 border-b border-slate-800/60 flex items-center justify-between">
          <span className="text-lg font-bold text-white">Menu</span>
          <button
            onClick={closeMobileMenu}
            className="p-2 text-slate-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info */}
        {session?.user && (
          <div className="p-4 border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0 ring-1 ring-emerald-500/20">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || ""}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <User className="h-5 w-5 text-emerald-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {session.user.name || "User"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobileMenu}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-4 py-3 sm:py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-400 ml-0 pl-3.5"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 hover:translate-x-1"
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-slate-800/60 space-y-0.5">
          <Link
            href="/dashboard/settings"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 sm:py-2.5 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all duration-200 hover:translate-x-1"
          >
            <Settings className="h-5 w-5" />
            <span className="font-medium text-sm">Settings</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 sm:py-2.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main id="main-content" className="flex-1 overflow-auto bg-slate-950" role="main">
        <TrialBanner />
        <div className="bg-glow-emerald">
          {children}
        </div>
      </main>
    </div>
  );
}
