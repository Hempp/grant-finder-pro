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
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui";
import { Button } from "@/components/ui";
import { Input, Textarea, Select } from "@/components/ui";
import { Badge } from "@/components/ui";
import { UpgradePrompt } from "@/components/subscription/UpgradePrompt";
import { useSubscription } from "@/hooks/useSubscription";

const steps = [
  { id: 1, name: "Project Summary", icon: FileText },
  { id: 2, name: "Technical Approach", icon: Target },
  { id: 3, name: "Team & Capabilities", icon: Users },
  { id: 4, name: "Budget", icon: DollarSign },
  { id: 5, name: "Review & Submit", icon: CheckCircle },
];

interface Grant {
  id: string;
  title: string;
  funder: string;
  amount: string;
  amountMin: number | null;
  amountMax: number | null;
  deadline: string;
  description: string;
  eligibility: string | string[] | null;
  requirements: string | string[] | null;
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const { isPro, canUseFeature, canStartTrial } = useSubscription();
  const [grant, setGrant] = useState<Grant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const [formData, setFormData] = useState({
    // Project Summary
    projectTitle: "",
    projectSummary: "",
    problemStatement: "",
    proposedSolution: "",
    expectedOutcomes: "",

    // Technical Approach
    technicalApproach: "",
    innovationDescription: "",
    methodology: "",
    milestones: "",

    // Team
    teamDescription: "",
    relevantExperience: "",
    keyPersonnel: "",

    // Budget
    totalBudget: "",
    personnelCosts: "",
    equipmentCosts: "",
    otherCosts: "",
    budgetJustification: "",
  });

  // Fetch grant data
  useEffect(() => {
    async function fetchGrant() {
      try {
        const res = await fetch("/api/grants");
        const data = await res.json();
        const foundGrant = data.grants?.find((g: Grant) => g.id === params.id);

        if (foundGrant) {
          setGrant(foundGrant);
          setFormData(prev => ({
            ...prev,
            totalBudget: String(foundGrant.amountMax || foundGrant.amountMin || ""),
          }));
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

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateWithAI = async (field: string, prompt: string) => {
    if (!grant) return;

    // Check if user can use Auto-Apply feature
    if (!canUseFeature("autoApply")) {
      setShowUpgradePrompt(true);
      return;
    }

    setGenerating(true);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field,
          context: formData,
          grantInfo: {
            title: grant.title,
            funder: grant.funder,
            amount: grant.amountMax || grant.amount,
            description: grant.description,
            requirements: grant.requirements,
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

  const saveApplication = async () => {
    if (!grant) return;
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

      const endpoint = applicationId
        ? "/api/applications"
        : "/api/applications";
      const method = applicationId ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: applicationId,
          grantId: grant.id,
          status: "in_progress",
          narrative,
          budget,
          responses: JSON.stringify(formData),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save application");
      }

      const data = await res.json();
      if (!applicationId && data.id) {
        setApplicationId(data.id);
      }

      return true;
    } catch (err) {
      console.error("Failed to save application:", err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    const saved = await saveApplication();
    if (saved) {
      router.push("/dashboard/applications");
    }
  };

  const renderAIButton = (field: string, prompt: string) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => generateWithAI(field, prompt)}
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

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <UpgradePrompt
              feature="AI-Powered Generation"
              description={canStartTrial
                ? "Start your 14-day free trial to unlock Auto-Apply and AI-powered content generation."
                : "Upgrade to Pro to unlock Auto-Apply and AI-powered content generation."
              }
              variant="card"
            />
            <button
              onClick={() => setShowUpgradePrompt(false)}
              className="w-full mt-3 text-slate-400 hover:text-white text-sm py-2"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* Back Button */}
      <Link
        href={`/dashboard/grants`}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Grants
      </Link>

      {/* Header */}
      <div className="mb-8">
        <Badge variant="info" className="mb-2">Application</Badge>
        <h1 className="text-3xl font-bold text-white">{grant.title}</h1>
        <div className="flex items-center gap-4 mt-2 text-slate-400">
          <span>{grant.funder}</span>
          <span>•</span>
          <span className="text-emerald-400 font-medium">
            {grant.amountMax ? formatCurrency(grant.amountMax) : grant.amount}
          </span>
          <span>•</span>
          <span>Due {new Date(grant.deadline).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition flex-shrink-0 ${
                currentStep > step.id
                  ? "bg-emerald-500 border-emerald-500"
                  : currentStep === step.id
                  ? "border-emerald-500 text-emerald-400"
                  : "border-slate-600 text-slate-500"
              }`}
            >
              {currentStep > step.id ? (
                <CheckCircle className="h-5 w-5 text-white" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </div>
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
                    {renderAIButton("projectSummary", "Generate project summary")}
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
                    {renderAIButton("problemStatement", "Generate problem statement")}
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
                    {renderAIButton("technicalApproach", "Generate technical approach")}
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
                    {renderAIButton("teamDescription", "Generate team description")}
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
                    {renderAIButton("budgetJustification", "Generate budget justification")}
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
                  Please review all sections below before submitting. You can go back to edit any section.
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
                  <strong>Note:</strong> Submitting will mark this application as &quot;Ready for Review&quot;.
                  You&apos;ll still be able to make edits before final submission to the grant portal.
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

          {currentStep < 5 ? (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {saving ? "Saving..." : "Save Application"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
