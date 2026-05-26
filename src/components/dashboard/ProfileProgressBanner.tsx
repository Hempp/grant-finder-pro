"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui";

interface ProfileField {
  key: string;
  label: string;
  filled: boolean;
  href: string;
}

export function ProfileProgressBanner() {
  const [fields, setFields] = useState<ProfileField[] | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/organizations");
      if (!res.ok) return;
      const data = await res.json();
      // API returns org directly (or null), not wrapped in { organization }
      const org = data?.id ? data : data?.organization || null;

      const docsRes = await fetch("/api/documents");
      const docsData = docsRes.ok ? await docsRes.json() : { documents: [] };
      const hasDocuments = (docsData.documents || []).length > 0;

      const profileFields: ProfileField[] = [
        { key: "name", label: "Organization name", filled: !!org?.name, href: "/dashboard/organization" },
        { key: "type", label: "Organization type", filled: !!org?.type, href: "/dashboard/organization" },
        { key: "state", label: "State", filled: !!org?.state, href: "/dashboard/organization" },
        { key: "mission", label: "Mission statement", filled: !!org?.mission, href: "/dashboard/organization" },
        { key: "teamSize", label: "Team size", filled: !!org?.teamSize, href: "/dashboard/organization" },
        { key: "revenue", label: "Revenue range", filled: !!org?.revenue, href: "/dashboard/organization" },
        { key: "fundingTarget", label: "Funding target", filled: !!org?.fundingTarget, href: "/dashboard/organization" },
        { key: "documents", label: "At least one document", filled: hasDocuments, href: "/dashboard/documents" },
      ];

      setFields(profileFields);
    } catch {
      // silently fail
    }
  }

  if (!fields || dismissed) return null;

  const filledCount = fields.filter((f) => f.filled).length;
  const percentage = Math.round((filledCount / fields.length) * 100);

  if (percentage >= 80) return null;

  const nextAction = fields.find((f) => !f.filled);

  return (
    <div
      className="p-4"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--rule)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card-soft)",
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <p
              className="font-semibold"
              style={{ fontSize: "var(--text-body-sm)", color: "var(--ink)" }}
            >
              Profile: {percentage}% complete
            </p>
            <button
              onClick={() => setDismissed(true)}
              className="transition-colors hover:opacity-80"
              style={{ color: "var(--ink-2)" }}
              aria-label="Dismiss profile banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden mb-2"
            style={{ background: "var(--bg-soft)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%`, background: "var(--accent)" }}
            />
          </div>
          {nextAction && (
            <p
              style={{
                fontSize: "var(--text-caption)",
                color: "var(--ink-2)",
                lineHeight: 1.5,
              }}
            >
              Next: Add your {nextAction.label.toLowerCase()} to improve match accuracy
            </p>
          )}
        </div>
        {nextAction && (
          <Link href={nextAction.href} className="flex-shrink-0">
            <Button
              size="sm"
              style={{
                background: "var(--surface)",
                color: "var(--accent)",
                border: "1px solid var(--accent)",
                borderRadius: "var(--radius-control)",
              }}
            >
              Complete
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
