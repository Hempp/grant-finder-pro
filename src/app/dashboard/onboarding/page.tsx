"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, CheckCircle, Upload, Sparkles } from "lucide-react";
import { Button, Card, CardContent, Input, Textarea, Select } from "@/components/ui";

const grantTypes = [
  { value: "federal", label: "Federal grants (SBIR, NIH, NSF)" },
  { value: "state", label: "State & local grants" },
  { value: "foundation", label: "Foundation / corporate grants" },
  { value: "all", label: "All of the above" },
];

const orgTypes = [
  { value: "", label: "Select type..." },
  { value: "startup", label: "Startup" },
  { value: "small_business", label: "Small Business" },
  { value: "nonprofit", label: "Nonprofit" },
  { value: "research", label: "Research Institution" },
  { value: "university", label: "University" },
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
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [profile, setProfile] = useState({
    name: "",
    type: "",
    state: "",
    mission: "",
  });

  function toggleType(value: string) {
    if (value === "all") {
      setSelectedTypes(["federal", "state", "foundation"]);
      return;
    }
    setSelectedTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  async function completeOnboarding() {
    setSaving(true);
    try {
      await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          grantPreferences: selectedTypes,
        }),
      });

      await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });

      router.push("/dashboard?onboarded=true");
    } catch {
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all duration-200 ${
              s === step ? "w-8 bg-emerald-500" : s < step ? "w-2 bg-emerald-500/50" : "w-2 bg-slate-700"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardContent className="p-8 flex flex-col gap-6">
            <div className="text-center">
              <Sparkles className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Welcome to GrantPilot</h1>
              <p className="text-slate-400">What kind of grants are you looking for?</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {grantTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => toggleType(type.value)}
                  className={`flex items-center gap-3 p-4 rounded-lg border text-left transition-colors duration-200 ${
                    selectedTypes.includes(type.value) || (type.value === "all" && selectedTypes.length >= 3)
                      ? "border-emerald-500/50 bg-emerald-500/10 text-white"
                      : "border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedTypes.includes(type.value) || (type.value === "all" && selectedTypes.length >= 3)
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-slate-600"
                    }`}
                  >
                    {(selectedTypes.includes(type.value) || (type.value === "all" && selectedTypes.length >= 3)) && (
                      <CheckCircle className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium leading-5">{type.label}</span>
                </button>
              ))}
            </div>
            <Button
              variant="primary"
              onClick={() => setStep(2)}
              disabled={selectedTypes.length === 0}
              className="w-full"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardContent className="p-8 flex flex-col gap-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-2">Quick Profile</h1>
              <p className="text-slate-400">Help us find grants that match your organization</p>
            </div>
            <div className="flex flex-col gap-4">
              <Input
                label="Organization Name"
                placeholder="e.g., Acme Research Labs"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              />
              <Select
                label="Organization Type"
                options={orgTypes}
                value={profile.type}
                onChange={(e) => setProfile((p) => ({ ...p, type: (e.target as HTMLSelectElement).value }))}
              />
              <Select
                label="State"
                options={states}
                value={profile.state}
                onChange={(e) => setProfile((p) => ({ ...p, state: (e.target as HTMLSelectElement).value }))}
              />
              <Textarea
                label="One-sentence mission"
                placeholder="What does your organization do?"
                maxLength={200}
                value={profile.mission}
                onChange={(e) => setProfile((p) => ({ ...p, mission: e.target.value }))}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep(3)}
                disabled={!profile.name}
                className="flex-1"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardContent className="p-8 flex flex-col gap-6">
            <div className="text-center">
              <Upload className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Upload a Document</h1>
              <p className="text-slate-400">
                Upload a pitch deck or business plan to supercharge your matches
              </p>
            </div>
            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center hover:border-slate-600 transition-colors duration-200">
              <p className="text-slate-400 text-sm">Drag and drop a PDF, or click to browse</p>
              <p className="text-slate-600 text-xs mt-2">You can always add documents later</p>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                variant="primary"
                onClick={completeOnboarding}
                isLoading={saving}
                loadingText="Setting up..."
                className="flex-1"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <button
              onClick={completeOnboarding}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors duration-200 text-center"
            >
              Skip for now
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
