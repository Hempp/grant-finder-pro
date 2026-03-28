"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/grants": "Find Grants",
  "/dashboard/applications": "Applications",
  "/dashboard/documents": "Documents",
  "/dashboard/organization": "Profile",
  "/dashboard/settings": "Settings",
  "/dashboard/referrals": "Referrals",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length < 3) return null;

  const crumbs: { label: string; href?: string }[] = [];
  let currentPath = "";

  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const isLast = i === segments.length - 1;

    if (i === 0) continue;

    const label = routeLabels[currentPath];
    if (label) {
      crumbs.push({ label, href: isLast ? undefined : currentPath });
    } else if (isLast) {
      const segment = segments[i];
      if (segment === "apply") {
        crumbs.push({ label: "Apply" });
      } else if (segment === "draft") {
        crumbs.push({ label: "Draft" });
      }
    } else {
      const parentPath = currentPath.split("/").slice(0, -1).join("/");
      const parentLabel = routeLabels[parentPath];
      if (parentLabel && !crumbs.find((c) => c.label === parentLabel)) {
        crumbs.push({ label: parentLabel, href: parentPath });
      }
    }
  }

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="px-6 lg:px-8 pt-4">
      <ol className="flex items-center gap-2 text-sm">
        <li>
          <Link
            href="/dashboard"
            className="text-slate-500 hover:text-white transition-colors duration-200"
          >
            Dashboard
          </Link>
        </li>
        {crumbs.map((crumb, i) => (
          <li key={i} className="flex items-center gap-2">
            <ChevronRight className="h-3 w-3 text-slate-600" aria-hidden="true" />
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="text-slate-500 hover:text-white transition-colors duration-200"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-slate-300 font-medium">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
