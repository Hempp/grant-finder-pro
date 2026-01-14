"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui";
import { Button } from "@/components/ui";
import { Input, Textarea, Select } from "@/components/ui";
import { Badge } from "@/components/ui";

const steps = [
  { id: 1, name: "Project Summary", icon: FileText },
  { id: 2, name: "Technical Approach", icon: Target },
  { id: 3, name: "Team & Capabilities", icon: Users },
  { id: 4, name: "Budget", icon: DollarSign },
  { id: 5, name: "Review & Submit", icon: CheckCircle },
];

// Mock grant info
const grantInfo = {
  title: "SBIR Phase I - AI/ML Innovation",
  funder: "National Science Foundation",
  amount: "$275,000",
  deadline: "2024-03-15",
};

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

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
    totalBudget: "275000",
    personnelCosts: "",
    equipmentCosts: "",
    otherCosts: "",
    budgetJustification: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateWithAI = async (field: string, prompt: string) => {
    setGenerating(true);

    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const aiResponses: Record<string, string> = {
      projectSummary: `Our project addresses the critical challenge of [problem area] through innovative AI/ML technologies. We propose to develop a novel [solution type] that leverages advanced machine learning algorithms to [key capability].

The proposed research will result in a prototype system capable of [specific outcomes], with direct applications in [target market]. Our approach combines cutting-edge [technology] with proven methodologies to deliver measurable improvements in [metrics].

This Phase I effort will establish technical feasibility and lay the groundwork for Phase II commercialization, targeting a $[X]B market opportunity in [industry sector].`,

      problemStatement: `Current solutions in [domain] face significant limitations including [limitation 1], [limitation 2], and [limitation 3]. These challenges result in [negative outcomes] for [stakeholders], costing the industry an estimated $[X]B annually.

Existing approaches rely on [traditional methods] which fail to address [specific gap]. Our research indicates that [percentage]% of [target users] struggle with [pain point], creating an urgent need for innovative solutions.

The proposed technology directly addresses these gaps by [approach], enabling [benefits] that are not possible with current state-of-the-art methods.`,

      technicalApproach: `Our technical approach consists of three integrated phases:

Phase 1 - Foundation Development (Months 1-3):
• Develop core ML architecture based on [approach]
• Implement data preprocessing pipeline
• Establish baseline performance metrics

Phase 2 - Algorithm Innovation (Months 4-6):
• Design novel [algorithm type] for [specific task]
• Integrate [technique] for improved accuracy
• Optimize for computational efficiency

Phase 3 - Validation & Integration (Months 7-9):
• Conduct comprehensive testing with real-world data
• Benchmark against existing solutions
• Prepare for Phase II scale-up

Key innovations include our proprietary [technique], which achieves [X]% improvement over current methods while reducing [resource] requirements by [Y]%.`,

      teamDescription: `Our team combines deep technical expertise with proven commercialization experience:

[Founder Name], CEO & Principal Investigator - [X] years in AI/ML research, previously [role] at [company]. PhD in [field] from [university]. Published [N] papers in top-tier venues.

[Technical Lead], CTO - Former [role] at [tech company], expertise in [specialization]. Led development of [product/system] serving [N] users.

[Domain Expert], Advisor - [X] years industry experience in [sector]. Previously [executive role] at [company]. Deep network in target market.

The team has collectively raised $[X]M in prior funding, published [N] peer-reviewed papers, and holds [N] patents in relevant technologies.`,

      budgetJustification: `Personnel ($185,000):
• PI at 50% effort: $75,000 - Leads technical development and project management
• Senior Engineer at 100% effort: $85,000 - Core algorithm development
• Research Assistant at 50% effort: $25,000 - Data preparation and testing

Equipment ($40,000):
• Cloud computing resources: $25,000 - Required for model training at scale
• Development workstations: $10,000 - High-performance systems for team
• Software licenses: $5,000 - Required development tools

Other Direct Costs ($30,000):
• Data acquisition: $15,000 - Licensed datasets for training
• Travel: $10,000 - Conference presentations and partner meetings
• Publication costs: $5,000 - Open access fees for dissemination

Indirect Costs ($20,000):
• Facilities and administrative costs at negotiated rate`,
    };

    const response = aiResponses[field] || `AI-generated content for ${field}. This would be customized based on your organization profile and the specific grant requirements.`;

    updateField(field, response);
    setGenerating(false);
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

  const handleSubmit = async () => {
    // Save application and redirect
    console.log("Submitting application:", formData);
    router.push("/dashboard/applications");
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

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href={`/dashboard/grants/${params.id}`}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Grant Details
      </Link>

      {/* Header */}
      <div className="mb-8">
        <Badge variant="info" className="mb-2">Application</Badge>
        <h1 className="text-3xl font-bold text-white">{grantInfo.title}</h1>
        <div className="flex items-center gap-4 mt-2 text-slate-400">
          <span>{grantInfo.funder}</span>
          <span>•</span>
          <span className="text-emerald-400 font-medium">{grantInfo.amount}</span>
          <span>•</span>
          <span>Due {new Date(grantInfo.deadline).toLocaleDateString()}</span>
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
            <Button onClick={handleSubmit}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Application
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
