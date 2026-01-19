"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Building2,
  Clock,
  Eye,
} from "lucide-react";
import { Card, CardContent, Button, Badge } from "@/components/ui";
import { ApplicationSection, ResponseData, Suggestion, ApplicationDraft } from "@/lib/auto-apply/types";
import DraftOverview from "@/components/auto-apply/DraftOverview";
import SectionEditor from "@/components/auto-apply/SectionEditor";
import FinalReview from "@/components/auto-apply/FinalReview";

interface Application {
  id: string;
  grantId: string;
  status: string;
  grant: {
    id: string;
    title: string;
    funder: string;
    amount: number;
    amountMax: number | null;
    deadline: string;
    description: string | null;
    url: string | null;
  };
}

type ViewMode = "overview" | "edit" | "review";

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

export default function ApplicationDraftPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [draft, setDraft] = useState<ApplicationDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  // Fetch application and draft data
  const fetchData = useCallback(async () => {
    try {
      // Fetch application
      const appRes = await fetch(`/api/applications/${params.id}`);
      if (!appRes.ok) {
        throw new Error("Application not found");
      }
      const appData: Application = await appRes.json();
      setApplication(appData);

      // Fetch draft
      const draftRes = await fetch(`/api/applications/${params.id}/draft`);
      if (draftRes.ok) {
        const draftData = await draftRes.json();
        setDraft(draftData);
      } else if (draftRes.status !== 404) {
        throw new Error("Failed to load draft");
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchData();
    }
  }, [params.id, fetchData]);

  // Handle section edit
  const handleEditSection = (sectionId: string) => {
    setEditingSectionId(sectionId);
    setViewMode("edit");
  };

  // Handle regenerate section
  const handleRegenerateSection = async (sectionId: string, instructions?: string) => {
    if (!draft) return;
    setRegenerating(true);

    try {
      const res = await fetch(`/api/applications/${params.id}/draft`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "regenerate",
          sectionId,
          instructions,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to regenerate section");
      }

      const updatedDraft = await res.json();
      setDraft(updatedDraft);
    } catch (err) {
      console.error("Failed to regenerate section:", err);
    } finally {
      setRegenerating(false);
    }
  };

  // Handle save section
  const handleSaveSection = async (sectionId: string, content: string) => {
    if (!draft) return;

    try {
      const res = await fetch(`/api/applications/${params.id}/draft`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          sectionId,
          content,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save section");
      }

      const updatedDraft = await res.json();
      setDraft(updatedDraft);
    } catch (err) {
      console.error("Failed to save section:", err);
      throw err;
    }
  };

  // Handle back from edit
  const handleBackFromEdit = () => {
    setEditingSectionId(null);
    setViewMode("overview");
  };

  // Handle review
  const handleGoToReview = () => {
    setViewMode("review");
  };

  // Handle back from review
  const handleBackFromReview = () => {
    setViewMode("overview");
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!application) return;

    try {
      // Update application status to submitted
      await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: application.id,
          grantId: application.grantId,
          status: "submitted",
        }),
      });

      router.push("/dashboard/applications");
    } catch (err) {
      console.error("Failed to mark as submitted:", err);
    }
  };

  // Calculate stats
  const calculateStats = () => {
    if (!draft) {
      return {
        completionScore: 0,
        overallConfidence: 0,
        missingRequirements: [] as string[],
        suggestions: [] as Suggestion[],
      };
    }

    const sections = draft.sections as ApplicationSection[];
    const responses = draft.responses as Record<string, ResponseData>;

    // Calculate completion score
    const requiredSections = sections.filter(s => s.required);
    const completedRequired = requiredSections.filter(s => {
      const response = responses[s.id];
      return response?.content && response.content.trim().length > 0;
    });
    const completionScore = requiredSections.length > 0
      ? Math.round((completedRequired.length / requiredSections.length) * 100)
      : 100;

    // Calculate overall confidence
    const confidenceScores = Object.values(responses)
      .filter(r => r.content)
      .map(r => r.confidenceScore);
    const overallConfidence = confidenceScores.length > 0
      ? Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length)
      : 0;

    // Find missing requirements
    const missingRequirements = requiredSections
      .filter(s => {
        const response = responses[s.id];
        return !response?.content || response.content.trim().length === 0;
      })
      .map(s => s.title);

    // Get suggestions
    const suggestions = (draft.suggestions as Suggestion[]) || [];

    return {
      completionScore,
      overallConfidence,
      missingRequirements,
      suggestions,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Error Loading Draft</h2>
            <p className="text-slate-400 mb-4">{error || "Unable to load draft."}</p>
            <Link href="/dashboard/applications">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Applications
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No draft yet - show generation prompt
  if (!draft) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <Link
          href={`/dashboard/applications/${params.id}`}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Application
        </Link>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/30">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-10 w-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Draft Generated Yet</h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Use the Auto-Apply feature to have AI generate a complete application draft
              based on your profile and documents.
            </p>
            <Link href={`/dashboard/grants/${application.grantId}`}>
              <Button size="lg">
                <Sparkles className="h-5 w-5 mr-2" />
                Go to Grant & Generate Draft
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sections = draft.sections as ApplicationSection[];
  const responses = draft.responses as Record<string, ResponseData>;
  const { completionScore, overallConfidence, missingRequirements, suggestions } = calculateStats();
  const funderType = (draft.funderType as string) || "foundation";
  const daysUntilDeadline = Math.ceil(
    (new Date(application.grant.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  // Edit view
  if (viewMode === "edit" && editingSectionId) {
    const section = sections.find(s => s.id === editingSectionId);
    const response = responses[editingSectionId];

    if (!section || !response) {
      return (
        <div className="p-4 sm:p-8 max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Section Not Found</h2>
              <Button onClick={handleBackFromEdit}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Overview
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <SectionEditor
          section={section}
          response={response}
          applicationId={application.id}
          onBack={handleBackFromEdit}
          onSave={handleSaveSection}
          onRegenerate={handleRegenerateSection}
        />
      </div>
    );
  }

  // Review view
  if (viewMode === "review") {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <FinalReview
          sections={sections}
          responses={responses}
          completionScore={completionScore}
          overallConfidence={overallConfidence}
          missingRequirements={missingRequirements}
          grantTitle={application.grant.title}
          grantUrl={application.grant.url}
          onBack={handleBackFromReview}
          onSubmit={handleSubmit}
        />
      </div>
    );
  }

  // Overview view (default)
  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      {/* Back Button */}
      <Link
        href={`/dashboard/applications/${params.id}`}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Application
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="info">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Draft
            </Badge>
            {completionScore >= 80 && (
              <Badge variant="success">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ready for Review
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{application.grant.title}</h1>
          <div className="flex items-center gap-4 text-slate-400 text-sm flex-wrap">
            <span className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {application.grant.funder}
            </span>
            <span className="text-emerald-400 font-medium">
              {formatCurrency(application.grant.amountMax || application.grant.amount)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : "Deadline passed"}
            </span>
          </div>
        </div>

        <Button onClick={handleGoToReview}>
          <Eye className="h-4 w-4 mr-2" />
          Review & Export
        </Button>
      </div>

      {/* Draft Overview */}
      <DraftOverview
        sections={sections}
        responses={responses}
        completionScore={completionScore}
        overallConfidence={overallConfidence}
        missingRequirements={missingRequirements}
        suggestions={suggestions}
        funderType={funderType}
        onEditSection={handleEditSection}
        onRegenerateSection={(sectionId) => handleRegenerateSection(sectionId)}
      />

      {/* Bottom Action Bar */}
      <div className="mt-6 flex items-center justify-between">
        <Link href={`/dashboard/applications/${params.id}`}>
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Application
          </Button>
        </Link>

        <Button onClick={handleGoToReview} disabled={regenerating}>
          {regenerating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Eye className="h-4 w-4 mr-2" />
          )}
          Review & Export
        </Button>
      </div>
    </div>
  );
}
