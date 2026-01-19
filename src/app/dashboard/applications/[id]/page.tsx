"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Sparkles,
  FileText,
  DollarSign,
  Users,
  Target,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  Edit3,
  Calendar,
  Building2,
  Clock,
  Trash2,
  Send,
  Wand2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui";
import { Button } from "@/components/ui";
import { Input, Textarea } from "@/components/ui";
import { Badge } from "@/components/ui";

const steps = [
  { id: 1, name: "Project Summary", icon: FileText },
  { id: 2, name: "Technical Approach", icon: Target },
  { id: 3, name: "Team & Capabilities", icon: Users },
  { id: 4, name: "Budget", icon: DollarSign },
  { id: 5, name: "Review & Submit", icon: CheckCircle },
];

interface Application {
  id: string;
  grantId: string;
  status: string;
  responses?: string;
  narrative?: string;
  budget?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  grant: {
    id: string;
    title: string;
    funder: string;
    amount: number;
    amountMin: number | null;
    amountMax: number | null;
    deadline: string;
    description: string;
    eligibility: string | null;
    requirements: string | null;
  };
}

interface FormData {
  projectTitle: string;
  projectSummary: string;
  problemStatement: string;
  proposedSolution: string;
  expectedOutcomes: string;
  technicalApproach: string;
  innovationDescription: string;
  methodology: string;
  milestones: string;
  teamDescription: string;
  relevantExperience: string;
  keyPersonnel: string;
  totalBudget: string;
  personnelCosts: string;
  equipmentCosts: string;
  otherCosts: string;
  budgetJustification: string;
}

const statusConfig: Record<string, { label: string; color: "default" | "success" | "warning" | "danger" | "info"; icon: React.ElementType }> = {
  draft: { label: "Draft", color: "default", icon: FileText },
  in_progress: { label: "In Progress", color: "warning", icon: AlertCircle },
  ready_for_review: { label: "Ready for Review", color: "info", icon: CheckCircle },
  submitted: { label: "Submitted", color: "success", icon: CheckCircle },
  pending: { label: "Pending Review", color: "info", icon: Clock },
  awarded: { label: "Awarded", color: "success", icon: CheckCircle },
  rejected: { label: "Rejected", color: "danger", icon: AlertCircle },
};

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [currentStep, setCurrentStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    projectTitle: "",
    projectSummary: "",
    problemStatement: "",
    proposedSolution: "",
    expectedOutcomes: "",
    technicalApproach: "",
    innovationDescription: "",
    methodology: "",
    milestones: "",
    teamDescription: "",
    relevantExperience: "",
    keyPersonnel: "",
    totalBudget: "",
    personnelCosts: "",
    equipmentCosts: "",
    otherCosts: "",
    budgetJustification: "",
  });

  // Fetch application data
  useEffect(() => {
    async function fetchApplication() {
      try {
        const res = await fetch(`/api/applications/${params.id}`);
        if (!res.ok) {
          throw new Error("Application not found");
        }
        const data: Application = await res.json();
        setApplication(data);

        // Parse saved responses into form data
        if (data.responses) {
          try {
            const savedFormData = JSON.parse(data.responses);
            setFormData(savedFormData);
          } catch (e) {
            console.error("Failed to parse saved responses:", e);
          }
        }

        // If application is in progress, start in edit mode
        if (["draft", "in_progress"].includes(data.status)) {
          setMode("edit");
        }
      } catch (err) {
        console.error("Failed to fetch application:", err);
        setError("Application not found");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchApplication();
    }
  }, [params.id]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateWithAI = async (field: string) => {
    if (!application) return;
    setGenerating(true);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field,
          context: formData,
          grantInfo: {
            title: application.grant.title,
            funder: application.grant.funder,
            amount: application.grant.amountMax || application.grant.amount,
            description: application.grant.description,
            requirements: application.grant.requirements,
          },
        }),
      });

      const data = await res.json();
      if (data.content) {
        updateField(field, data.content);
      }
    } catch (err) {
      console.error("AI generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const saveApplication = async (newStatus?: string) => {
    if (!application) return false;
    setSaving(true);

    try {
      const narrative = `
# ${formData.projectTitle || "Untitled Project"}

## Project Summary
${formData.projectSummary}

## Problem Statement
${formData.problemStatement}

## Proposed Solution
${formData.proposedSolution}

## Expected Outcomes
${formData.expectedOutcomes}

## Technical Approach
${formData.technicalApproach}

## Innovation
${formData.innovationDescription}

## Methodology
${formData.methodology}

## Milestones
${formData.milestones}

## Team
${formData.teamDescription}

## Relevant Experience
${formData.relevantExperience}

## Key Personnel
${formData.keyPersonnel}
      `.trim();

      const budget = `
Personnel: $${formData.personnelCosts || 0}
Equipment: $${formData.equipmentCosts || 0}
Other: $${formData.otherCosts || 0}
Total: $${formData.totalBudget || 0}

Justification:
${formData.budgetJustification}
      `.trim();

      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: application.id,
          grantId: application.grantId,
          status: newStatus || application.status,
          narrative,
          budget,
          responses: JSON.stringify(formData),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save application");
      }

      const updated = await res.json();
      setApplication({ ...application, ...updated, status: newStatus || application.status });

      return true;
    } catch (err) {
      console.error("Failed to save application:", err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndContinue = async () => {
    const saved = await saveApplication("in_progress");
    if (saved && currentStep < 5) {
      nextStep();
    }
  };

  const handleMarkReadyForReview = async () => {
    const saved = await saveApplication("ready_for_review");
    if (saved) {
      router.push("/dashboard/applications");
    }
  };

  const handleDelete = async () => {
    if (!application || !confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/applications/${application.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/dashboard/applications");
      }
    } catch (err) {
      console.error("Failed to delete application:", err);
    } finally {
      setDeleting(false);
    }
  };

  const renderAIButton = (field: string) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => generateWithAI(field)}
      disabled={generating}
      className="text-emerald-400 hover:text-emerald-300"
    >
      {generating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Sparkles className="h-4 w-4 mr-1" />
          Generate with AI
        </>
      )}
    </Button>
  );

  const renderCopyButton = (text: string, field: string) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => copyToClipboard(text, field)}
      className="text-slate-400 hover:text-white"
    >
      {copied === field ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
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
      <div className="p-8 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Application Not Found</h2>
            <p className="text-slate-400 mb-4">{error || "Unable to load application details."}</p>
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

  const status = statusConfig[application.status] || statusConfig.draft;
  const daysUntil = getDaysUntilDeadline(application.grant.deadline);
  const isEditable = ["draft", "in_progress", "ready_for_review"].includes(application.status);

  // View mode - show application summary
  if (mode === "view") {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/dashboard/applications"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{application.grant.title}</h1>
              <Badge variant={status.color}>
                <status.icon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {application.grant.funder}
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">
                {formatCurrency(application.grant.amountMax || application.grant.amount)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Due {new Date(application.grant.deadline).toLocaleDateString()}
                {daysUntil > 0 && daysUntil <= 14 && (
                  <Badge variant="warning" className="ml-2">{daysUntil} days left</Badge>
                )}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/dashboard/applications/${params.id}/draft`}>
              <Button variant="secondary">
                <Wand2 className="h-4 w-4 mr-2" />
                AI Draft
              </Button>
            </Link>
            {isEditable && (
              <Button onClick={() => setMode("edit")}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Application
              </Button>
            )}
          </div>
        </div>

        {/* Application Details */}
        <div className="space-y-6">
          {/* Project Summary */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-400" />
                Project Summary
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.projectTitle && (
                  <div>
                    <h3 className="text-white font-medium mb-1">Project Title</h3>
                    <p className="text-slate-400">{formData.projectTitle}</p>
                  </div>
                )}
                {formData.projectSummary && (
                  <div>
                    <h3 className="text-white font-medium mb-1">Summary</h3>
                    <p className="text-slate-400 whitespace-pre-wrap">{formData.projectSummary}</p>
                  </div>
                )}
                {formData.problemStatement && (
                  <div>
                    <h3 className="text-white font-medium mb-1">Problem Statement</h3>
                    <p className="text-slate-400 whitespace-pre-wrap">{formData.problemStatement}</p>
                  </div>
                )}
                {!formData.projectTitle && !formData.projectSummary && !formData.problemStatement && (
                  <p className="text-slate-500 italic">No project summary entered yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Technical Approach */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-400" />
                Technical Approach
              </h2>
            </CardHeader>
            <CardContent>
              {formData.technicalApproach ? (
                <p className="text-slate-400 whitespace-pre-wrap">{formData.technicalApproach}</p>
              ) : (
                <p className="text-slate-500 italic">No technical approach entered yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Team */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Team & Capabilities
              </h2>
            </CardHeader>
            <CardContent>
              {formData.teamDescription ? (
                <p className="text-slate-400 whitespace-pre-wrap">{formData.teamDescription}</p>
              ) : (
                <p className="text-slate-500 italic">No team description entered yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Budget */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-amber-400" />
                Budget
              </h2>
            </CardHeader>
            <CardContent>
              {formData.totalBudget ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <p className="text-slate-400 text-sm">Total Budget</p>
                      <p className="text-2xl font-bold text-white">${parseInt(formData.totalBudget).toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <p className="text-slate-400 text-sm">Personnel</p>
                      <p className="text-xl font-semibold text-white">${parseInt(formData.personnelCosts || "0").toLocaleString()}</p>
                    </div>
                  </div>
                  {formData.budgetJustification && (
                    <div>
                      <h3 className="text-white font-medium mb-1">Justification</h3>
                      <p className="text-slate-400 whitespace-pre-wrap">{formData.budgetJustification}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 italic">No budget entered yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <Button variant="secondary" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Application
            </Button>

            {isEditable && (
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setMode("edit")}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Continue Editing
                </Button>
                {application.status !== "ready_for_review" && (
                  <Button onClick={handleMarkReadyForReview} disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Mark Ready for Review
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Edit mode - show step-by-step form
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => setMode("view")}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Overview
      </button>

      {/* Header */}
      <div className="mb-8">
        <Badge variant={status.color} className="mb-2">
          <status.icon className="h-3 w-3 mr-1" />
          {status.label}
        </Badge>
        <h1 className="text-3xl font-bold text-white">{application.grant.title}</h1>
        <div className="flex items-center gap-4 mt-2 text-slate-400">
          <span>{application.grant.funder}</span>
          <span>•</span>
          <span className="text-emerald-400 font-medium">
            {formatCurrency(application.grant.amountMax || application.grant.amount)}
          </span>
          <span>•</span>
          <span>Due {new Date(application.grant.deadline).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => setCurrentStep(step.id)}
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition flex-shrink-0 ${
                currentStep > step.id
                  ? "bg-emerald-500 border-emerald-500"
                  : currentStep === step.id
                  ? "border-emerald-500 text-emerald-400"
                  : "border-slate-600 text-slate-500 hover:border-slate-500"
              }`}
            >
              {currentStep > step.id ? (
                <CheckCircle className="h-5 w-5 text-white" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </button>
            <span
              className={`ml-2 font-medium whitespace-nowrap ${
                currentStep >= step.id ? "text-white" : "text-slate-500"
              }`}
            >
              {step.name}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-3 ${
                  currentStep > step.id ? "bg-emerald-500" : "bg-slate-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {steps[currentStep - 1].name}
          </h2>
          {currentStep < 5 && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              AI can help generate content
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Project Summary */}
          {currentStep === 1 && (
            <>
              <Input
                label="Project Title"
                placeholder="Enter a concise, descriptive title for your project"
                value={formData.projectTitle}
                onChange={(e) => updateField("projectTitle", e.target.value)}
              />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-300">
                    Project Summary
                  </label>
                  <div className="flex gap-2">
                    {formData.projectSummary && renderCopyButton(formData.projectSummary, "projectSummary")}
                    {renderAIButton("projectSummary")}
                  </div>
                </div>
                <Textarea
                  placeholder="Provide a comprehensive overview of your proposed project..."
                  rows={6}
                  value={formData.projectSummary}
                  onChange={(e) => updateField("projectSummary", e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-300">
                    Problem Statement
                  </label>
                  <div className="flex gap-2">
                    {formData.problemStatement && renderCopyButton(formData.problemStatement, "problemStatement")}
                    {renderAIButton("problemStatement")}
                  </div>
                </div>
                <Textarea
                  placeholder="Describe the problem or challenge your project addresses..."
                  rows={5}
                  value={formData.problemStatement}
                  onChange={(e) => updateField("problemStatement", e.target.value)}
                />
              </div>

              <Textarea
                label="Proposed Solution"
                placeholder="Explain how your project will solve the problem..."
                rows={4}
                value={formData.proposedSolution}
                onChange={(e) => updateField("proposedSolution", e.target.value)}
              />

              <Textarea
                label="Expected Outcomes"
                placeholder="List the anticipated results and impact of your project..."
                rows={3}
                value={formData.expectedOutcomes}
                onChange={(e) => updateField("expectedOutcomes", e.target.value)}
              />
            </>
          )}

          {/* Step 2: Technical Approach */}
          {currentStep === 2 && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-300">
                    Technical Approach
                  </label>
                  <div className="flex gap-2">
                    {formData.technicalApproach && renderCopyButton(formData.technicalApproach, "technicalApproach")}
                    {renderAIButton("technicalApproach")}
                  </div>
                </div>
                <Textarea
                  placeholder="Describe your technical methodology and approach in detail..."
                  rows={8}
                  value={formData.technicalApproach}
                  onChange={(e) => updateField("technicalApproach", e.target.value)}
                />
              </div>

              <Textarea
                label="Innovation Description"
                placeholder="Explain what makes your approach innovative and novel..."
                rows={4}
                value={formData.innovationDescription}
                onChange={(e) => updateField("innovationDescription", e.target.value)}
              />

              <Textarea
                label="Research Methodology"
                placeholder="Detail the research methods and techniques you'll employ..."
                rows={4}
                value={formData.methodology}
                onChange={(e) => updateField("methodology", e.target.value)}
              />

              <Textarea
                label="Key Milestones"
                placeholder="List major milestones and deliverables for the project..."
                rows={4}
                value={formData.milestones}
                onChange={(e) => updateField("milestones", e.target.value)}
              />
            </>
          )}

          {/* Step 3: Team */}
          {currentStep === 3 && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-300">
                    Team Description
                  </label>
                  <div className="flex gap-2">
                    {formData.teamDescription && renderCopyButton(formData.teamDescription, "teamDescription")}
                    {renderAIButton("teamDescription")}
                  </div>
                </div>
                <Textarea
                  placeholder="Describe your team's composition and qualifications..."
                  rows={6}
                  value={formData.teamDescription}
                  onChange={(e) => updateField("teamDescription", e.target.value)}
                />
              </div>

              <Textarea
                label="Relevant Experience"
                placeholder="Highlight relevant experience and past accomplishments..."
                rows={5}
                value={formData.relevantExperience}
                onChange={(e) => updateField("relevantExperience", e.target.value)}
              />

              <Textarea
                label="Key Personnel"
                placeholder="List key team members and their roles in the project..."
                rows={4}
                value={formData.keyPersonnel}
                onChange={(e) => updateField("keyPersonnel", e.target.value)}
              />
            </>
          )}

          {/* Step 4: Budget */}
          {currentStep === 4 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Total Budget Requested"
                  type="number"
                  value={formData.totalBudget}
                  onChange={(e) => updateField("totalBudget", e.target.value)}
                />
                <Input
                  label="Personnel Costs"
                  type="number"
                  placeholder="$0"
                  value={formData.personnelCosts}
                  onChange={(e) => updateField("personnelCosts", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Equipment Costs"
                  type="number"
                  placeholder="$0"
                  value={formData.equipmentCosts}
                  onChange={(e) => updateField("equipmentCosts", e.target.value)}
                />
                <Input
                  label="Other Direct Costs"
                  type="number"
                  placeholder="$0"
                  value={formData.otherCosts}
                  onChange={(e) => updateField("otherCosts", e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-300">
                    Budget Justification
                  </label>
                  <div className="flex gap-2">
                    {formData.budgetJustification && renderCopyButton(formData.budgetJustification, "budgetJustification")}
                    {renderAIButton("budgetJustification")}
                  </div>
                </div>
                <Textarea
                  placeholder="Provide detailed justification for each budget category..."
                  rows={8}
                  value={formData.budgetJustification}
                  onChange={(e) => updateField("budgetJustification", e.target.value)}
                />
              </div>
            </>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-emerald-400 font-medium mb-2">
                  <CheckCircle className="h-5 w-5" />
                  Application Ready for Review
                </div>
                <p className="text-slate-400 text-sm">
                  Please review all sections below before marking as ready. You can click on any step above to edit that section.
                </p>
              </div>

              {/* Summary of all sections */}
              <div className="space-y-4">
                <Card className="bg-slate-900/50">
                  <CardContent className="p-4">
                    <h3 className="text-white font-medium mb-2">Project Summary</h3>
                    <p className="text-slate-400 text-sm line-clamp-3">
                      {formData.projectSummary || "Not completed"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50">
                  <CardContent className="p-4">
                    <h3 className="text-white font-medium mb-2">Technical Approach</h3>
                    <p className="text-slate-400 text-sm line-clamp-3">
                      {formData.technicalApproach || "Not completed"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50">
                  <CardContent className="p-4">
                    <h3 className="text-white font-medium mb-2">Team</h3>
                    <p className="text-slate-400 text-sm line-clamp-3">
                      {formData.teamDescription || "Not completed"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50">
                  <CardContent className="p-4">
                    <h3 className="text-white font-medium mb-2">Budget</h3>
                    <p className="text-slate-400 text-sm">
                      Total: ${parseInt(formData.totalBudget || "0").toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
                <p className="text-amber-400 text-sm">
                  <strong>Note:</strong> Marking as &quot;Ready for Review&quot; means you&apos;ve completed all sections.
                  You can still make edits before final submission to the grant portal.
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="secondary"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep < 5 ? (
              <>
                <Button variant="secondary" onClick={() => saveApplication()} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Save Draft
                </Button>
                <Button onClick={handleSaveAndContinue} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Save & Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            ) : (
              <Button onClick={handleMarkReadyForReview} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {saving ? "Saving..." : "Mark Ready for Review"}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
