"use client";

import { useState, useEffect } from "react";
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
  BookOpen,
  Users,
  ShieldCheck,
} from "lucide-react";
import { TrialBanner } from "@/components/subscription/TrialBanner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { ToastProvider } from "@/components/ui";

// Core nav — always visible. New users see these four.
const coreNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Find Grants", href: "/dashboard/grants", icon: Search },
  { name: "Applications", href: "/dashboard/applications", icon: FileText },
  { name: "Profile", href: "/dashboard/organization", icon: Building2 },
];

// Extended nav — shown once the user has started using the product
// (has at least one application or completed their profile).
const extendedNavGroups = [
  {
    label: "Workspace",
    items: [
      { name: "Documents", href: "/dashboard/documents", icon: Upload },
      { name: "Library", href: "/dashboard/library", icon: BookOpen },
    ],
  },
  {
    label: "Organization",
    items: [
      { name: "Team", href: "/dashboard/team", icon: Users },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
  {
    label: "More",
    items: [
      { name: "Referrals", href: "/dashboard/referrals", icon: Gift },
      { name: "Audit log", href: "/dashboard/audit", icon: ShieldCheck },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showExtendedNav, setShowExtendedNav] = useState(false);

  // Redirect students to /student dashboard + check activation status
  useEffect(() => {
    fetch("/api/user/type")
      .then((res) => res.json())
      .then((data) => {
        if (data.userType === "student") {
          window.location.href = "/student";
        }
      })
      .catch(() => {});
    // Show extended nav once user has any activity — simple check via
    // applications count. Alternatively, if they're navigating to an
    // extended route, show it immediately.
    fetch("/api/applications")
      .then((res) => res.json())
      .then((apps) => {
        if (Array.isArray(apps) && apps.length > 0) {
          setShowExtendedNav(true);
        }
      })
      .catch(() => {});
  }, []);

  // Always show extended nav if the user is currently ON one of those pages
  useEffect(() => {
    const extendedPaths = ["/dashboard/documents", "/dashboard/library", "/dashboard/team", "/dashboard/settings", "/dashboard/referrals", "/dashboard/audit"];
    if (extendedPaths.some((p) => pathname.startsWith(p))) {
      setShowExtendedNav(true);
    }
  }, [pathname]);

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
          <img src="/logo.svg" alt="" width={28} height={28} />
          <span className="text-lg font-bold text-white">Grant<span className="text-emerald-400">Pilot</span></span>
        </Link>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 min-w-11 min-h-11 flex items-center justify-center text-slate-400 hover:text-white transition-colors duration-200"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
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
        <div className="hidden lg:flex items-center justify-between p-6 border-b border-slate-800/60">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/logo.svg" alt="" width={36} height={36} className="group-hover:scale-105 transition-transform duration-200" />
            <span className="text-xl font-bold text-white">
              Grant<span className="text-emerald-400">Pilot</span>
            </span>
          </Link>
          <NotificationBell />
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

        {/* Navigation — progressive disclosure: new users see 4 core
            items; extended groups reveal after first activity or when
            the user navigates to one of those pages directly. */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {/* Core items — always visible */}
          <div>
            {coreNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMobileMenu}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-400 pl-3"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  <span className="font-medium text-sm leading-5">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Extended groups — revealed after activation */}
          {showExtendedNav && extendedNavGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              {group.label && (
                <p className="text-xs text-slate-600 uppercase tracking-wider font-medium px-4 pt-6 pb-1">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMobileMenu}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-400 pl-3"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    }`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    <span className="font-medium text-sm leading-5">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-slate-800/60">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium text-sm leading-5">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main id="main-content" className="flex-1 overflow-auto bg-slate-950" role="main">
        <ToastProvider>
          <TrialBanner />
          <Breadcrumbs />
          <ErrorBoundary>
            <div className="bg-glow-emerald">
              {children}
            </div>
          </ErrorBoundary>
        </ToastProvider>
      </main>
    </div>
  );
}
