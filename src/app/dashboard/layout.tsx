"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
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
    fetch("/api/applications")
      .then((res) => res.json())
      .then((apps) => {
        if (Array.isArray(apps) && apps.length > 0) {
          setShowExtendedNav(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const extendedPaths = [
      "/dashboard/documents",
      "/dashboard/library",
      "/dashboard/team",
      "/dashboard/settings",
      "/dashboard/referrals",
      "/dashboard/audit",
    ];
    if (extendedPaths.some((p) => pathname.startsWith(p))) {
      setShowExtendedNav(true);
    }
  }, [pathname]);

  const handleSignOut = () => signOut({ callbackUrl: "/" });
  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Active-state class is computed once — applied to both nav blocks.
  const navItemStyle = (active: boolean): React.CSSProperties =>
    active
      ? {
          background: "var(--accent-soft)",
          color: "var(--accent)",
          borderLeft: "2px solid var(--accent)",
          paddingLeft: 14,
        }
      : { color: "var(--ink-2)" };

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{ background: "var(--bg)", color: "var(--ink)" }}
    >
      {/* Mobile header */}
      <div
        className="lg:hidden flex items-center justify-between p-3 sm:p-4 sticky top-0 z-30"
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="GrantPilot home"
        >
          <img src="/logo.svg" alt="" width={28} height={28} />
          <span
            className="font-semibold"
            style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
          >
            GrantPilot
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 min-w-11 min-h-11 flex items-center justify-center transition-colors"
            style={{ color: "var(--ink-2)" }}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: "rgba(15, 23, 42, 0.4)" }}
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-[280px] sm:w-64 max-w-[85vw] flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          background: "var(--surface)",
          borderRight: "1px solid var(--rule)",
        }}
      >
        {/* Desktop logo */}
        <div
          className="hidden lg:flex items-center justify-between p-6"
          style={{ borderBottom: "1px solid var(--rule)" }}
        >
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="GrantPilot home"
          >
            <img
              src="/logo.svg"
              alt=""
              width={32}
              height={32}
              className="transition-transform group-hover:scale-105"
            />
            <span
              className="font-semibold"
              style={{ fontSize: "var(--text-title)", color: "var(--ink)" }}
            >
              GrantPilot
            </span>
          </Link>
          <NotificationBell />
        </div>

        {/* Mobile close */}
        <div
          className="lg:hidden p-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--rule)" }}
        >
          <span
            className="font-semibold"
            style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
          >
            Menu
          </span>
          <button
            onClick={closeMobileMenu}
            className="p-2"
            style={{ color: "var(--ink-2)" }}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User identity */}
        {session?.user && (
          <div
            className="p-4"
            style={{ borderBottom: "1px solid var(--rule)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                }}
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || ""}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-medium truncate"
                  style={{ fontSize: "var(--text-body-sm)", color: "var(--ink)" }}
                >
                  {session.user.name || "User"}
                </p>
                <p
                  className="truncate"
                  style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
                >
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div>
            {coreNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMobileMenu}
                  aria-current={isActive ? "page" : undefined}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2"
                  style={{
                    ...navItemStyle(isActive),
                    fontSize: "var(--text-body-sm)",
                  }}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {showExtendedNav &&
            extendedNavGroups.map((group, groupIdx) => (
              <div key={groupIdx}>
                {group.label && (
                  <p
                    className="px-4 pt-6 pb-1 font-medium"
                    style={{
                      color: "var(--ink-2)",
                      fontSize: "var(--text-micro)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
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
                      className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2"
                      style={{
                        ...navItemStyle(isActive),
                        fontSize: "var(--text-body-sm)",
                      }}
                    >
                      <item.icon
                        className="h-5 w-5 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
        </nav>

        {/* Sign out */}
        <div className="p-3" style={{ borderTop: "1px solid var(--rule)" }}>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full focus-visible:outline-none focus-visible:ring-2"
            style={{
              color: "var(--ink-2)",
              fontSize: "var(--text-body-sm)",
            }}
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        id="main-content"
        className="flex-1 overflow-auto"
        role="main"
        style={{ background: "var(--bg)" }}
      >
        <ToastProvider>
          <TrialBanner />
          <Breadcrumbs />
          <ErrorBoundary>{children}</ErrorBoundary>
        </ToastProvider>
      </main>
    </div>
  );
}
