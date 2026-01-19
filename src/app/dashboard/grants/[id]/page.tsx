"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Clock,
  DollarSign,
  ExternalLink,
  Star,
  StarOff,
  CheckCircle,
  AlertTriangle,
  FileText,
  Users,
  Target,
  Calendar,
  Loader2,
  AlertCircle,
  Globe,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { AutoApplyModal } from "@/components/auto-apply";
import { useSubscription } from "@/hooks/useSubscription";

interface Grant {
  id: string;
  title: string;
  funder: string;
  description: string | null;
  amount: string;
  amountMin: number | null;
  amountMax: number | null;
  deadline: string;
  type: string | null;
  category: string | null;
  matchScore: number | null;
  status: string | null;
  url: string | null;
  eligibility: string | string[] | null;
  requirements: string | string[] | null;
  focusAreas: string | string[] | null;
  location: string | null;
  matchReasons: Array<{ reason: string; score: number }> | null;
  matchBreakdown: Record<string, number> | null;
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

function parseArrayField(field: string | string[] | null): string[] {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  // Try parsing as JSON array
  try {
    const parsed = JSON.parse(field);
    return Array.isArray(parsed) ? parsed : [field];
  } catch {
    // Split by newlines or semicolons if not JSON
    return field.split(/[;\n]/).map(s => s.trim()).filter(Boolean);
  }
}

export default function GrantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { subscription, canUseFeature } = useSubscription();
  const [grant, setGrant] = useState<Grant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showAutoApplyModal, setShowAutoApplyModal] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [hasDocuments, setHasDocuments] = useState(false);
  const [existingApplicationId, setExistingApplicationId] = useState<string | undefined>(undefined);

  // Fetch user readiness (profile & documents)
  useEffect(() => {
    async function checkReadiness() {
      try {
        // Check organization profile
        const orgRes = await fetch("/api/organizations");
        if (orgRes.ok) {
          const orgData = await orgRes.json();
          setHasProfile(Boolean(orgData?.name && orgData?.description));
        }

        // Check documents
        const docsRes = await fetch("/api/documents");
        if (docsRes.ok) {
          const docsData = await docsRes.json();
          setHasDocuments(Array.isArray(docsData) && docsData.length > 0);
        }

        // Check for existing application
        const appsRes = await fetch("/api/applications");
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          const existingApp = appsData.find((app: { grantId: string }) => app.grantId === params.id);
          if (existingApp) {
            setExistingApplicationId(existingApp.id);
          }
        }
      } catch (err) {
        console.error("Failed to check readiness:", err);
      }
    }
    checkReadiness();
  }, [params.id]);

  useEffect(() => {
    async function fetchGrant() {
      try {
        const res = await fetch("/api/grants");
        const data = await res.json();
        const foundGrant = data.grants?.find((g: Grant) => g.id === params.id);

        if (foundGrant) {
          setGrant(foundGrant);
          setSaved(foundGrant.status === "saved");
        } else {
          setError("Grant not found");
        }
      } catch (err) {
        console.error("Failed to fetch grant:", err);
        setError("Failed to load grant details");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchGrant();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (error || !grant) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Grant Not Found</h2>
            <p className="text-slate-400 mb-4">{error || "Unable to load grant details."}</p>
            <Link href="/dashboard/grants">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Grants
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysUntilDeadline = Math.ceil(
    (new Date(grant.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const eligibility = parseArrayField(grant.eligibility);
  const requirements = parseArrayField(grant.requirements);
  const focusAreas = parseArrayField(grant.focusAreas);

  // Format amount display
  const amountDisplay = grant.amountMin && grant.amountMax
    ? `${formatCurrency(grant.amountMin)} - ${formatCurrency(grant.amountMax)}`
    : grant.amountMax
    ? formatCurrency(grant.amountMax)
    : grant.amount;

  // Get grant type badge color
  const getTypeBadgeColor = (type: string | null): "info" | "success" | "warning" | "default" => {
    switch (type?.toLowerCase()) {
      case "federal": return "info";
      case "state": return "success";
      case "foundation": return "warning";
      case "private": return "warning";
      default: return "default";
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Back Button */}
      <Link
        href="/dashboard/grants"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Grants
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            {grant.type && (
              <Badge variant={getTypeBadgeColor(grant.type)}>
                {grant.type.charAt(0).toUpperCase() + grant.type.slice(1)}
              </Badge>
            )}
            {grant.category && (
              <Badge variant="default">{grant.category.toUpperCase()}</Badge>
            )}
            {grant.matchScore && grant.matchScore > 80 && (
              <Badge variant="success">
                <Target className="h-3 w-3 mr-1" />
                {grant.matchScore}% Match
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{grant.title}</h1>
          <div className="flex items-center gap-2 text-slate-400">
            <Building2 className="h-5 w-5" />
            <span className="text-lg">{grant.funder}</span>
          </div>
          {grant.location && (
            <div className="flex items-center gap-2 text-slate-500 mt-1">
              <MapPin className="h-4 w-4" />
              <span>{grant.location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSaved(!saved)}
            className={`p-3 rounded-lg transition ${
              saved
                ? "bg-amber-500/20 text-amber-400"
                : "bg-slate-800 text-slate-500 hover:text-white"
            }`}
          >
            {saved ? (
              <Star className="h-6 w-6 fill-current" />
            ) : (
              <StarOff className="h-6 w-6" />
            )}
          </button>
          {grant.url && (
            <a
              href={grant.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
            >
              <ExternalLink className="h-6 w-6" />
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{amountDisplay}</p>
                <p className="text-slate-400 text-sm">Award Amount</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className={`h-8 w-8 mx-auto mb-2 ${daysUntilDeadline <= 14 ? "text-red-400" : daysUntilDeadline <= 30 ? "text-amber-400" : "text-emerald-400"}`} />
                <p className="text-2xl font-bold text-white">
                  {daysUntilDeadline > 0 ? `${daysUntilDeadline} days` : "Expired"}
                </p>
                <p className="text-slate-400 text-sm">Until Deadline</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-emerald-400">
                  {grant.matchScore ? `${grant.matchScore}%` : "N/A"}
                </p>
                <p className="text-slate-400 text-sm">Match Score</p>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-white">About This Grant</h2>
            </CardHeader>
            <CardContent>
              {grant.description ? (
                <p className="text-slate-300 whitespace-pre-line">{grant.description}</p>
              ) : (
                <p className="text-slate-500 italic">No description available.</p>
              )}

              {/* Focus Areas */}
              {focusAreas.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-slate-500 text-sm mb-2">Focus Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {focusAreas.map((area, idx) => (
                      <Badge key={idx} variant="default">{area}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Eligibility */}
          {eligibility.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-400" />
                  Eligibility Requirements
                </h2>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {eligibility.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Application Requirements */}
          {requirements.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  Application Requirements
                </h2>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {requirements.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-sm text-slate-400">
                        {idx + 1}
                      </div>
                      <span className="text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Deadline Info */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-400" />
                Deadline
              </h2>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-24 text-slate-500 text-sm">
                  {new Date(grant.deadline).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-300">Application Deadline</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply CTA */}
          <Card className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-emerald-500/30">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Ready to Apply?</h3>
              <p className="text-slate-400 text-sm mb-4">
                Let AI generate a complete application draft based on your profile and documents.
              </p>
              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => setShowAutoApplyModal(true)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Auto-Apply with AI
                </Button>
                <Link href={`/dashboard/grants/${params.id}/apply`} className="block">
                  <Button size="lg" variant="secondary" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Manual Application
                  </Button>
                </Link>
              </div>
              {existingApplicationId && (
                <Link
                  href={`/dashboard/applications/${existingApplicationId}`}
                  className="block mt-3 text-sm text-emerald-400 hover:text-emerald-300 transition"
                >
                  View existing application →
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Match Analysis */}
          {grant.matchReasons && grant.matchReasons.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-white">Why You Match</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {grant.matchReasons.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-300 text-sm">{item.reason}</span>
                      <span className="text-emerald-400 font-medium">{item.score}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Match Breakdown (if no detailed reasons) */}
          {!grant.matchReasons && grant.matchBreakdown && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-white">Match Analysis</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(grant.matchBreakdown).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-300 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-emerald-400 font-medium">{value}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Deadline Warning */}
          {daysUntilDeadline > 0 && daysUntilDeadline <= 14 && (
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium">Deadline Approaching</p>
                  <p className="text-slate-400 text-sm mt-1">
                    Only {daysUntilDeadline} days left to submit. Start your application now.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {daysUntilDeadline <= 0 && (
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium">Deadline Passed</p>
                  <p className="text-slate-400 text-sm mt-1">
                    This grant deadline has passed. Check for future cycles.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-4 space-y-2">
              {grant.url && (
                <a
                  href={grant.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition text-slate-300 hover:text-white"
                >
                  <Globe className="h-5 w-5" />
                  <span>View Official Page</span>
                </a>
              )}
              <button
                onClick={() => setSaved(!saved)}
                className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition text-slate-300 hover:text-white w-full"
              >
                {saved ? <Star className="h-5 w-5 text-amber-400 fill-current" /> : <StarOff className="h-5 w-5" />}
                <span>{saved ? "Saved to List" : "Save for Later"}</span>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Auto-Apply Modal */}
      <AutoApplyModal
        isOpen={showAutoApplyModal}
        onClose={() => setShowAutoApplyModal(false)}
        grant={{
          id: grant.id,
          title: grant.title,
          funder: grant.funder,
          amount: grant.amountMax ? formatCurrency(grant.amountMax) : grant.amount,
          deadline: grant.deadline ? new Date(grant.deadline) : null,
        }}
        hasProfile={hasProfile}
        hasDocuments={hasDocuments}
        applicationId={existingApplicationId}
        onGenerate={(applicationId) => {
          router.push(`/dashboard/applications/${applicationId}/draft`);
        }}
        subscription={{
          canUseAutoApply: canUseFeature("autoApply"),
          autoApplyRemaining: subscription?.usage?.autoApplyRemaining ?? 0,
          plan: subscription?.plan ?? "free",
        }}
      />
    </div>
  );
}
