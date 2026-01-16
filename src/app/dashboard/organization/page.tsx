"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Building2, Target, Users, DollarSign, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui";
import { Button } from "@/components/ui";
import { Input, Textarea, Select } from "@/components/ui";

const steps = [
  { id: 1, name: "Basic Info", icon: Building2 },
  { id: 2, name: "Mission", icon: Target },
  { id: 3, name: "Team", icon: Users },
  { id: 4, name: "Funding", icon: DollarSign },
];

const organizationTypes = [
  { value: "", label: "Select type..." },
  { value: "startup", label: "Startup" },
  { value: "small_business", label: "Small Business" },
  { value: "nonprofit", label: "Nonprofit" },
  { value: "research", label: "Research Institution" },
  { value: "university", label: "University" },
];

const legalStructures = [
  { value: "", label: "Select structure..." },
  { value: "llc", label: "LLC" },
  { value: "c_corp", label: "C Corporation" },
  { value: "s_corp", label: "S Corporation" },
  { value: "501c3", label: "501(c)(3) Nonprofit" },
  { value: "501c4", label: "501(c)(4) Nonprofit" },
  { value: "sole_prop", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
];

const states = [
  { value: "", label: "Select state..." },
  { value: "CA", label: "California" },
  { value: "NY", label: "New York" },
  { value: "TX", label: "Texas" },
  { value: "FL", label: "Florida" },
  { value: "WA", label: "Washington" },
  { value: "MA", label: "Massachusetts" },
  { value: "CO", label: "Colorado" },
  { value: "IL", label: "Illinois" },
  // Add more as needed
];

const teamSizes = [
  { value: "", label: "Select size..." },
  { value: "1", label: "Just me" },
  { value: "2-5", label: "2-5 employees" },
  { value: "6-10", label: "6-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "200+", label: "200+ employees" },
];

const revenueRanges = [
  { value: "", label: "Select range..." },
  { value: "pre_revenue", label: "Pre-revenue" },
  { value: "0-100k", label: "$0 - $100K" },
  { value: "100k-500k", label: "$100K - $500K" },
  { value: "500k-1m", label: "$500K - $1M" },
  { value: "1m-5m", label: "$1M - $5M" },
  { value: "5m+", label: "$5M+" },
];

const fundingRanges = [
  { value: "", label: "Select range..." },
  { value: "25k-50k", label: "$25K - $50K" },
  { value: "50k-100k", label: "$50K - $100K" },
  { value: "100k-250k", label: "$100K - $250K" },
  { value: "250k-500k", label: "$250K - $500K" },
  { value: "500k-1m", label: "$500K - $1M" },
  { value: "1m+", label: "$1M+" },
];

export default function OrganizationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    type: "",
    legalStructure: "",
    ein: "",
    website: "",
    city: "",
    state: "",
    // Mission
    mission: "",
    vision: "",
    problemStatement: "",
    solution: "",
    targetMarket: "",
    // Team
    teamSize: "",
    founderBackground: "",
    // Funding
    annualRevenue: "",
    fundingSeeking: "",
    previousFunding: "",
  });

  // Fetch existing organization data on mount
  useEffect(() => {
    async function fetchOrganization() {
      try {
        const res = await fetch("/api/organizations");
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setFormData({
              name: data.name || "",
              type: data.type || "",
              legalStructure: data.legalStructure || "",
              ein: data.ein || "",
              website: data.website || "",
              city: data.city || "",
              state: data.state || "",
              mission: data.mission || "",
              vision: data.vision || "",
              problemStatement: data.problemStatement || "",
              solution: data.solution || "",
              targetMarket: data.targetMarket || "",
              teamSize: data.teamSize || "",
              founderBackground: data.founderBackground || "",
              annualRevenue: data.annualRevenue || "",
              fundingSeeking: data.fundingSeeking || "",
              previousFunding: data.previousFunding || "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch organization:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrganization();
  }, []);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Profile saved successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save profile");
      }
    } catch (error) {
      console.error("Failed to save organization:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Organization Profile</h1>
        <p className="text-slate-400 mt-1">
          Complete your profile to improve grant matching accuracy.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition ${
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
              className={`ml-3 font-medium ${
                currentStep >= step.id ? "text-white" : "text-slate-500"
              }`}
            >
              {step.name}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`w-24 h-0.5 mx-4 ${
                  currentStep > step.id ? "bg-emerald-500" : "bg-slate-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-white">
            {steps[currentStep - 1].name}
          </h2>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <>
              <Input
                label="Organization Name"
                placeholder="Enter your organization name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Organization Type"
                  options={organizationTypes}
                  value={formData.type}
                  onChange={(e) => updateField("type", e.target.value)}
                />
                <Select
                  label="Legal Structure"
                  options={legalStructures}
                  value={formData.legalStructure}
                  onChange={(e) => updateField("legalStructure", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="EIN (Optional)"
                  placeholder="XX-XXXXXXX"
                  value={formData.ein}
                  onChange={(e) => updateField("ein", e.target.value)}
                />
                <Input
                  label="Website"
                  placeholder="https://yourcompany.com"
                  value={formData.website}
                  onChange={(e) => updateField("website", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  placeholder="San Francisco"
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                />
                <Select
                  label="State"
                  options={states}
                  value={formData.state}
                  onChange={(e) => updateField("state", e.target.value)}
                />
              </div>
            </>
          )}

          {/* Step 2: Mission */}
          {currentStep === 2 && (
            <>
              <Textarea
                label="Mission Statement"
                placeholder="What is your organization's core mission?"
                rows={3}
                value={formData.mission}
                onChange={(e) => updateField("mission", e.target.value)}
              />
              <Textarea
                label="Vision"
                placeholder="Where do you see your organization in 5-10 years?"
                rows={3}
                value={formData.vision}
                onChange={(e) => updateField("vision", e.target.value)}
              />
              <Textarea
                label="Problem Statement"
                placeholder="What problem are you solving? Be specific about the pain points."
                rows={4}
                value={formData.problemStatement}
                onChange={(e) => updateField("problemStatement", e.target.value)}
              />
              <Textarea
                label="Your Solution"
                placeholder="How does your product/service solve this problem?"
                rows={4}
                value={formData.solution}
                onChange={(e) => updateField("solution", e.target.value)}
              />
              <Input
                label="Target Market"
                placeholder="Who are your primary customers/beneficiaries?"
                value={formData.targetMarket}
                onChange={(e) => updateField("targetMarket", e.target.value)}
              />
            </>
          )}

          {/* Step 3: Team */}
          {currentStep === 3 && (
            <>
              <Select
                label="Team Size"
                options={teamSizes}
                value={formData.teamSize}
                onChange={(e) => updateField("teamSize", e.target.value)}
              />
              <Textarea
                label="Founder/Leadership Background"
                placeholder="Describe the experience and qualifications of your leadership team. Include relevant education, work history, and achievements."
                rows={6}
                value={formData.founderBackground}
                onChange={(e) => updateField("founderBackground", e.target.value)}
              />
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">
                  <strong className="text-white">Tip:</strong> Grant reviewers look for teams with relevant expertise.
                  Highlight domain knowledge, technical skills, and any previous successful ventures or projects.
                </p>
              </div>
            </>
          )}

          {/* Step 4: Funding */}
          {currentStep === 4 && (
            <>
              <Select
                label="Annual Revenue"
                options={revenueRanges}
                value={formData.annualRevenue}
                onChange={(e) => updateField("annualRevenue", e.target.value)}
              />
              <Select
                label="Funding Seeking"
                options={fundingRanges}
                value={formData.fundingSeeking}
                onChange={(e) => updateField("fundingSeeking", e.target.value)}
              />
              <Textarea
                label="Previous Funding (Optional)"
                placeholder="List any grants, investments, or funding you've received. Include amounts and sources."
                rows={4}
                value={formData.previousFunding}
                onChange={(e) => updateField("previousFunding", e.target.value)}
              />
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg">
                <p className="text-emerald-400 text-sm">
                  <strong>Almost done!</strong> Once you save your profile, we&apos;ll start matching
                  you with relevant grant opportunities based on your organization details.
                </p>
              </div>
            </>
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

          {currentStep < 4 ? (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
