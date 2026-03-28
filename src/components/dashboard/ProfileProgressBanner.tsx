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
      const org = data.organization;

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
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <p className="text-sm font-bold text-white">Profile: {percentage}% complete</p>
            <button
              onClick={() => setDismissed(true)}
              className="text-slate-600 hover:text-slate-400 transition-colors duration-200"
              aria-label="Dismiss profile banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          {nextAction && (
            <p className="text-xs text-slate-400 leading-4">
              Next: Add your {nextAction.label.toLowerCase()} to improve match accuracy
            </p>
          )}
        </div>
        {nextAction && (
          <Link href={nextAction.href} className="flex-shrink-0">
            <Button size="sm" variant="outline">
              Complete
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
