"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookmarkPlus, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { Button } from "@/components/ui";

interface TemplateSummary {
  id: string;
  name: string;
  description: string | null;
  grantCategory: string | null;
  grantType: string | null;
  usageCount: number;
  lastUsedAt: string | null;
  updatedAt: string;
}

function relativeDays(iso: string | null): string {
  if (!iso) return "Never used";
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.round(ms / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Used today";
  if (days === 1) return "Used yesterday";
  if (days < 30) return `Used ${days} days ago`;
  if (days < 365) return `Used ${Math.round(days / 30)} months ago`;
  return `Used ${Math.round(days / 365)} years ago`;
}

/**
 * Surfaces user-saved application templates that match the current grant's
 * category/type. The /api/templates GET endpoint already filters with the
 * "exact match OR null" logic — null-scoped templates apply to any grant,
 * scoped templates only match their declared category/type.
 *
 * Click → routes to the apply wizard with ?templateId=X — the wizard
 * already hydrates formData from /api/templates/[id]/apply on mount.
 *
 * Hidden when the user has no matching templates (don't take up real
 * estate when there's nothing to show; the apply wizard's "Save as
 * template" button is the entry point for a user's first template).
 */
export function TemplateMatchPicker({
  grantId,
  grantCategory,
  grantType,
}: {
  grantId: string;
  grantCategory: string | null | undefined;
  grantType: string | null | undefined;
}) {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (grantCategory) params.set("grantCategory", grantCategory);
    if (grantType) params.set("grantType", grantType);
    fetch(`/api/templates?${params.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setTemplates(Array.isArray(data?.templates) ? data.templates : []);
      })
      .catch((err) => {
        if (cancelled) return;
        // Quiet failure — the apply CTA above is the primary path.
        // We don't want a broken bell-style 401-flash here either.
        console.warn("Template match fetch failed:", err);
        setError("Couldn't load your templates.");
      });
    return () => {
      cancelled = true;
    };
  }, [grantCategory, grantType]);

  // Loading or empty: render nothing. The component is additive — its
  // job is to surface a shortcut, not announce its own existence.
  if (templates === null || templates.length === 0) return null;
  if (error) return null;

  return (
    <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
      <CardHeader className="pb-2">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <BookmarkPlus className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          Reuse a template
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          {templates.length === 1
            ? "1 of your saved templates matches this grant."
            : `${templates.length} of your saved templates match this grant.`}
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <ul className="space-y-2">
          {templates.slice(0, 3).map((tpl) => (
            <li key={tpl.id}>
              <button
                type="button"
                onClick={() =>
                  router.push(`/dashboard/grants/${grantId}/apply?templateId=${tpl.id}`)
                }
                className="w-full text-left rounded-lg border border-slate-800 hover:border-emerald-500/40 bg-slate-900/40 hover:bg-slate-900/70 px-3 py-2.5 transition flex items-center justify-between gap-3 group focus-ring"
                aria-label={`Apply with template ${tpl.name}`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{tpl.name}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {tpl.usageCount > 0
                      ? `Used ${tpl.usageCount}× · ${relativeDays(tpl.lastUsedAt)}`
                      : "Not used yet"}
                  </p>
                </div>
                <ArrowRight
                  className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition flex-shrink-0"
                  aria-hidden="true"
                />
              </button>
            </li>
          ))}
        </ul>
        {templates.length > 3 && (
          <p className="text-xs text-slate-500 text-center mt-3">
            {templates.length - 3} more — start applying and pick from the wizard.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function TemplateMatchPickerSkeleton() {
  // Optional skeleton if a parent wants to wrap in Suspense later.
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 flex items-center gap-2 text-slate-500 text-sm">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Looking for matching templates…
    </div>
  );
}
