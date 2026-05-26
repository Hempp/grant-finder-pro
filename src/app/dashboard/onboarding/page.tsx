"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, CheckCircle, Upload, Sparkles } from "lucide-react";
import { Button, Input, Textarea, Select } from "@/components/ui";

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

  const cardStyle: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--rule)",
    borderRadius: "var(--radius-card)",
    boxShadow: "var(--shadow-card-soft)",
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--bg)",
    border: "1px solid var(--rule)",
    color: "var(--ink)",
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto flex flex-col gap-8">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className="h-2 rounded-full transition-all duration-200"
            style={{
              width: s === step ? 32 : 8,
              background:
                s === step
                  ? "var(--accent)"
                  : s < step
                  ? "var(--accent-soft)"
                  : "var(--rule)",
            }}
          />
        ))}
      </div>

      {step === 1 && (
        <article className="p-8 flex flex-col gap-6" style={cardStyle}>
          <div className="text-center">
            <Sparkles
              className="h-10 w-10 mx-auto mb-4"
              style={{ color: "var(--accent)" }}
              aria-hidden="true"
            />
            <h1
              className="font-semibold tracking-tight mb-2"
              style={{ fontSize: "var(--text-title)", color: "var(--ink)" }}
            >
              Welcome to GrantPilot
            </h1>
            <p style={{ fontSize: "var(--text-body)", color: "var(--ink-2)" }}>
              What kind of grants are you looking for?
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {grantTypes.map((type) => {
              const selected =
                selectedTypes.includes(type.value) ||
                (type.value === "all" && selectedTypes.length >= 3);
              return (
                <button
                  key={type.value}
                  onClick={() => toggleType(type.value)}
                  className="flex items-center gap-3 p-4 text-left transition-colors"
                  style={
                    selected
                      ? {
                          background: "var(--accent-soft)",
                          border: "1.5px solid var(--accent)",
                          color: "var(--ink)",
                          borderRadius: "var(--radius-control)",
                        }
                      : {
                          background: "var(--bg)",
                          border: "1px solid var(--rule)",
                          color: "var(--ink)",
                          borderRadius: "var(--radius-control)",
                        }
                  }
                  aria-pressed={selected}
                >
                  <div
                    className="h-5 w-5 flex items-center justify-center flex-shrink-0"
                    style={{
                      background: selected ? "var(--accent)" : "transparent",
                      border: `2px solid ${selected ? "var(--accent)" : "var(--rule)"}`,
                      borderRadius: 4,
                    }}
                  >
                    {selected && (
                      <CheckCircle className="h-3 w-3" style={{ color: "white" }} aria-hidden="true" />
                    )}
                  </div>
                  <span
                    className="font-medium"
                    style={{ fontSize: "var(--text-body-sm)" }}
                  >
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
          <Button
            onClick={() => setStep(2)}
            disabled={selectedTypes.length === 0}
            className="w-full !text-white"
            style={{
              background: "var(--accent)",
              borderColor: "var(--accent)",
              borderRadius: "var(--radius-control)",
            }}
          >
            Continue
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </article>
      )}

      {step === 2 && (
        <article className="p-8 flex flex-col gap-6" style={cardStyle}>
          <div className="text-center">
            <h1
              className="font-semibold tracking-tight mb-2"
              style={{ fontSize: "var(--text-title)", color: "var(--ink)" }}
            >
              Quick profile
            </h1>
            <p style={{ fontSize: "var(--text-body)", color: "var(--ink-2)" }}>
              Help us find grants that match your organization
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <Input
              label="Organization name"
              placeholder="e.g., Acme Research Labs"
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              style={inputStyle}
            />
            <Select
              label="Organization type"
              options={orgTypes}
              value={profile.type}
              onChange={(e) =>
                setProfile((p) => ({ ...p, type: (e.target as HTMLSelectElement).value }))
              }
              style={inputStyle}
            />
            <Select
              label="State"
              options={states}
              value={profile.state}
              onChange={(e) =>
                setProfile((p) => ({ ...p, state: (e.target as HTMLSelectElement).value }))
              }
              style={inputStyle}
            />
            <Textarea
              label="One-sentence mission"
              placeholder="What does your organization do?"
              maxLength={200}
              value={profile.mission}
              onChange={(e) => setProfile((p) => ({ ...p, mission: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setStep(1)}
              style={{
                background: "transparent",
                color: "var(--ink-2)",
                border: "1px solid var(--rule)",
                borderRadius: "var(--radius-control)",
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!profile.name}
              className="flex-1 !text-white"
              style={{
                background: "var(--accent)",
                borderColor: "var(--accent)",
                borderRadius: "var(--radius-control)",
              }}
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </article>
      )}

      {step === 3 && (
        <article className="p-8 flex flex-col gap-6" style={cardStyle}>
          <div className="text-center">
            <Upload
              className="h-10 w-10 mx-auto mb-4"
              style={{ color: "var(--accent)" }}
              aria-hidden="true"
            />
            <h1
              className="font-semibold tracking-tight mb-2"
              style={{ fontSize: "var(--text-title)", color: "var(--ink)" }}
            >
              Upload a document
            </h1>
            <p
              className="max-w-md mx-auto"
              style={{ fontSize: "var(--text-body)", color: "var(--ink-2)", lineHeight: 1.55 }}
            >
              Upload a pitch deck or business plan to supercharge your matches and feed your voice profile.
            </p>
          </div>
          <div
            className="p-8 text-center transition-colors"
            style={{
              background: "var(--bg-soft)",
              border: "2px dashed var(--rule)",
              borderRadius: "var(--radius-card)",
            }}
          >
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--ink-2)" }}>
              Drag and drop a PDF, or click to browse
            </p>
            <p
              className="mt-2"
              style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)", opacity: 0.7 }}
            >
              You can always add documents later
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setStep(2)}
              style={{
                background: "transparent",
                color: "var(--ink-2)",
                border: "1px solid var(--rule)",
                borderRadius: "var(--radius-control)",
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button
              onClick={completeOnboarding}
              isLoading={saving}
              loadingText="Setting up..."
              className="flex-1 !text-white"
              style={{
                background: "var(--accent)",
                borderColor: "var(--accent)",
                borderRadius: "var(--radius-control)",
              }}
            >
              Get started
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
          <button
            onClick={completeOnboarding}
            className="transition-colors text-center hover:underline"
            style={{ fontSize: "var(--text-body-sm)", color: "var(--ink-2)" }}
          >
            Skip for now
          </button>
        </article>
      )}
    </div>
  );
}
