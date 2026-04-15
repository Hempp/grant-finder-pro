"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Sparkles, GraduationCap, Award, PenLine, Plus, Trash2, DollarSign, Clock, Target } from "lucide-react";
import { Button, Card, CardContent, Input, Textarea, Select } from "@/components/ui";

const educationLevels = [
  { value: "", label: "Select level..." },
  { value: "hs_senior", label: "High School Senior" },
  { value: "undergrad_fr", label: "Undergraduate Freshman" },
  { value: "undergrad_so", label: "Undergraduate Sophomore" },
  { value: "undergrad_jr", label: "Undergraduate Junior" },
  { value: "undergrad_sr", label: "Undergraduate Senior" },
  { value: "post_bacc", label: "Post-Baccalaureate" },
  { value: "masters", label: "Master's Student" },
  { value: "phd", label: "PhD Candidate" },
  { value: "medical", label: "Medical Student" },
  { value: "dental", label: "Dental Student" },
  { value: "law", label: "Law Student" },
];

const graduationYears = [
  { value: "", label: "Select year..." },
  ...Array.from({ length: 8 }, (_, i) => ({
    value: String(2025 + i),
    label: String(2025 + i),
  })),
];

const usStates = [
  { value: "", label: "Select state..." },
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "DC", label: "District of Columbia" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

const fieldsOfStudy = [
  { value: "", label: "Select field..." },
  { value: "stem", label: "STEM" },
  { value: "humanities", label: "Humanities" },
  { value: "business", label: "Business" },
  { value: "health_sciences", label: "Health Sciences" },
  { value: "arts", label: "Arts" },
  { value: "education", label: "Education" },
  { value: "social_sciences", label: "Social Sciences" },
  { value: "law", label: "Law" },
  { value: "other", label: "Other" },
];

const intendedDegrees = [
  { value: "", label: "Select degree..." },
  { value: "md", label: "MD" },
  { value: "jd", label: "JD" },
  { value: "phd", label: "PhD" },
  { value: "mba", label: "MBA" },
  { value: "ms", label: "MS" },
  { value: "ma", label: "MA" },
  { value: "med", label: "MEd" },
  { value: "mph", label: "MPH" },
  { value: "other", label: "Other" },
];

const citizenshipOptions = [
  { value: "", label: "Select status..." },
  { value: "us_citizen", label: "U.S. Citizen" },
  { value: "permanent_resident", label: "Permanent Resident" },
  { value: "daca", label: "DACA Recipient" },
  { value: "international", label: "International Student" },
];

const financialNeedOptions = [
  { value: "", label: "Select level..." },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "not_disclosed", label: "Prefer not to say" },
];

const gradLevels = ["masters", "phd", "medical", "dental", "law"];
const undergradLevels = ["hs_senior", "undergrad_fr", "undergrad_so", "undergrad_jr", "undergrad_sr"];

interface Activity {
  name: string;
  role: string;
  description: string;
}

// Sample scholarships shown before profile (the "aha moment")
const PREVIEW_SCHOLARSHIPS = [
  { title: "Gates Scholarship", amount: "$77,000", provider: "Gates Foundation", match: "High", deadline: "Sep 2026" },
  { title: "Jack Kent Cooke Undergraduate", amount: "$55,000", provider: "JKCF", match: "High", deadline: "Nov 2026" },
  { title: "Coca-Cola Scholars Program", amount: "$20,000", provider: "Coca-Cola Foundation", match: "Medium", deadline: "Oct 2026" },
  { title: "Amazon Future Engineer", amount: "$40,000", provider: "Amazon", match: "Medium", deadline: "Dec 2026" },
  { title: "Dell Scholars Program", amount: "$20,000", provider: "Michael & Susan Dell Foundation", match: "High", deadline: "Jan 2027" },
];

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // Start at 0 — the preview step
  const [saving, setSaving] = useState(false);

  // Step 1 — Who You Are
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [expectedGraduation, setExpectedGraduation] = useState("");
  const [stateOfResidence, setStateOfResidence] = useState("");

  // Step 2 — Academics
  const [major, setMajor] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [gpa, setGpa] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [intendedDegree, setIntendedDegree] = useState("");

  // Step 3 — Eligibility Boosters
  const [citizenship, setCitizenship] = useState("");
  const [financialNeed, setFinancialNeed] = useState("");
  const [firstGeneration, setFirstGeneration] = useState(false);
  const [minority, setMinority] = useState(false);
  const [veteran, setVeteran] = useState(false);
  const [satScore, setSatScore] = useState("");
  const [actScore, setActScore] = useState("");
  const [greScore, setGreScore] = useState("");
  const [mcatScore, setMcatScore] = useState("");
  const [lsatScore, setLsatScore] = useState("");

  // Step 4 — Your Story
  const [personalStatement, setPersonalStatement] = useState("");
  const [activities, setActivities] = useState<Activity[]>([
    { name: "", role: "", description: "" },
  ]);

  const showIntendedDegree = gradLevels.includes(educationLevel);
  const showSatAct = undergradLevels.includes(educationLevel);
  const showGre = educationLevel === "masters" || educationLevel === "phd";
  const showMcat = educationLevel === "medical";
  const showLsat = educationLevel === "law";

  const step1Valid =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    schoolName.trim() !== "" &&
    educationLevel !== "" &&
    expectedGraduation !== "" &&
    stateOfResidence !== "";

  function addActivity() {
    if (activities.length >= 10) return;
    setActivities((prev) => [...prev, { name: "", role: "", description: "" }]);
  }

  function removeActivity(index: number) {
    setActivities((prev) => prev.filter((_, i) => i !== index));
  }

  function updateActivity(index: number, field: keyof Activity, value: string) {
    setActivities((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  }

  async function completeOnboarding() {
    setSaving(true);
    try {
      // Build the profile payload
      const profileData = {
        firstName,
        lastName,
        schoolName,
        educationLevel,
        expectedGraduation,
        stateOfResidence,
        major,
        fieldOfStudy,
        gpa: gpa ? parseFloat(gpa) : null,
        careerGoal,
        intendedDegree: showIntendedDegree ? intendedDegree : null,
        citizenship,
        financialNeed,
        firstGeneration,
        minority,
        veteran,
        satScore: showSatAct && satScore ? parseInt(satScore) : null,
        actScore: showSatAct && actScore ? parseInt(actScore) : null,
        greScore: showGre && greScore ? parseInt(greScore) : null,
        mcatScore: showMcat && mcatScore ? parseInt(mcatScore) : null,
        lsatScore: showLsat && lsatScore ? parseInt(lsatScore) : null,
        personalStatement,
        activities: activities.filter((a) => a.name.trim() !== ""),
      };

      // 1. Save profile
      await fetch("/api/student/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      // 2. Mark onboarding complete
      await fetch("/api/student/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });

      // 3. Save personal statement to content library if provided
      if (personalStatement.trim()) {
        await fetch("/api/content-library", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Personal Statement",
            content: personalStatement,
            category: "personal_statement",
          }),
        });
      }

      router.push("/student");
    } catch {
      router.push("/student");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all duration-200 ${
              s === step
                ? "w-8 bg-emerald-500"
                : s < step
                ? "w-2 bg-emerald-500/50"
                : "w-2 bg-slate-700"
            }`}
          />
        ))}
      </div>

      {/* Step 0 — Aha Moment: Show what's waiting for them */}
      {step === 0 && (
        <Card>
          <CardContent className="p-6 sm:p-8 flex flex-col gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                This is the kind of money you&apos;re missing
              </h1>
              <p className="text-slate-400">
                Examples below total over $212,000 in awards. Build your profile and we&apos;ll tell you which ones you actually qualify for — and draft the essays for you.
              </p>
            </div>

            {/* Preview scholarship cards — example opportunities GrantPilot
                tracks. We deliberately do NOT show a "match" badge here
                because we haven't scored this user yet; showing "High
                match" on a pre-profile screen would be dishonest. */}
            <div className="space-y-3">
              {PREVIEW_SCHOLARSHIPS.map((s) => (
                <div key={s.title} className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                  <div className="text-right min-w-[70px]">
                    <div className="text-lg font-bold text-emerald-400">{s.amount}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{s.title}</p>
                    <p className="text-slate-400 text-xs">{s.provider}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" /> {s.deadline}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center">
              <p className="text-emerald-400 text-sm font-medium flex items-center justify-center gap-2">
                <Target className="h-4 w-4" />
                141+ more scholarships — complete your profile to see your personalized matches
              </p>
            </div>

            <Button onClick={() => setStep(1)} className="w-full" size="lg">
              See my scholarship matches <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <p className="text-xs text-slate-500 text-center">
              Takes ~2 minutes. No credit card. You only pay a small success fee if you win.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 1 — Who You Are */}
      {step === 1 && (
        <Card>
          <CardContent className="p-6 sm:p-8 flex flex-col gap-6">
            <div className="text-center">
              <Sparkles className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">
                Let&apos;s find your scholarships
              </h1>
              <p className="text-slate-400">
                Tell us about yourself to get personalized matches
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  label="Last Name"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <Input
                label="School Name"
                placeholder="e.g., Stanford University"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
              />
              <Select
                label="Education Level"
                options={educationLevels}
                value={educationLevel}
                onChange={(e) =>
                  setEducationLevel((e.target as HTMLSelectElement).value)
                }
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Expected Graduation"
                  options={graduationYears}
                  value={expectedGraduation}
                  onChange={(e) =>
                    setExpectedGraduation(
                      (e.target as HTMLSelectElement).value
                    )
                  }
                />
                <Select
                  label="State of Residence"
                  options={usStates}
                  value={stateOfResidence}
                  onChange={(e) =>
                    setStateOfResidence(
                      (e.target as HTMLSelectElement).value
                    )
                  }
                />
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => setStep(2)}
              disabled={!step1Valid}
              className="w-full"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2 — Academics */}
      {step === 2 && (
        <Card>
          <CardContent className="p-6 sm:p-8 flex flex-col gap-6">
            <div className="text-center">
              <GraduationCap className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Academics</h1>
              <p className="text-slate-400">
                Help us match you with the right scholarships
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Input
                label="Major"
                placeholder="e.g., Computer Science"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
              />
              <Select
                label="Field of Study"
                options={fieldsOfStudy}
                value={fieldOfStudy}
                onChange={(e) =>
                  setFieldOfStudy((e.target as HTMLSelectElement).value)
                }
              />
              <div className="space-y-1">
                <Input
                  label="GPA"
                  type="number"
                  step="0.01"
                  min="0"
                  max="5"
                  placeholder="e.g., 3.7"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                />
                <p className="text-xs text-slate-500">
                  Adding your GPA improves matching accuracy by 40%
                </p>
              </div>
              <Input
                label="Career Goal"
                placeholder="e.g., Become a pediatric surgeon"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
              />
              {showIntendedDegree && (
                <Select
                  label="Intended Degree"
                  options={intendedDegrees}
                  value={intendedDegree}
                  onChange={(e) =>
                    setIntendedDegree((e.target as HTMLSelectElement).value)
                  }
                />
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep(3)}
                className="flex-1"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 — Eligibility Boosters */}
      {step === 3 && (
        <Card>
          <CardContent className="p-6 sm:p-8 flex flex-col gap-6">
            <div className="text-center">
              <Award className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">
                Eligibility Boosters
              </h1>
              <p className="text-slate-400">
                All fields are optional but improve your matches
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Select
                label="Citizenship Status"
                options={citizenshipOptions}
                value={citizenship}
                onChange={(e) =>
                  setCitizenship((e.target as HTMLSelectElement).value)
                }
              />
              <Select
                label="Financial Need"
                options={financialNeedOptions}
                value={financialNeed}
                onChange={(e) =>
                  setFinancialNeed((e.target as HTMLSelectElement).value)
                }
              />

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300">
                  Background
                </label>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={firstGeneration}
                      onChange={(e) => setFirstGeneration(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950"
                    />
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                      First-generation college student
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={minority}
                      onChange={(e) => setMinority(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950"
                    />
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                      Underrepresented minority
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={veteran}
                      onChange={(e) => setVeteran(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950"
                    />
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                      Military veteran or dependent
                    </span>
                  </label>
                </div>
              </div>

              {/* Conditional test scores */}
              {(showSatAct || showGre || showMcat || showLsat) && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-300">
                    Test Scores
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {showSatAct && (
                      <>
                        <Input
                          label="SAT Score"
                          type="number"
                          placeholder="e.g., 1450"
                          value={satScore}
                          onChange={(e) => setSatScore(e.target.value)}
                        />
                        <Input
                          label="ACT Score"
                          type="number"
                          placeholder="e.g., 32"
                          value={actScore}
                          onChange={(e) => setActScore(e.target.value)}
                        />
                      </>
                    )}
                    {showGre && (
                      <Input
                        label="GRE Score"
                        type="number"
                        placeholder="e.g., 320"
                        value={greScore}
                        onChange={(e) => setGreScore(e.target.value)}
                      />
                    )}
                    {showMcat && (
                      <Input
                        label="MCAT Score"
                        type="number"
                        placeholder="e.g., 515"
                        value={mcatScore}
                        onChange={(e) => setMcatScore(e.target.value)}
                      />
                    )}
                    {showLsat && (
                      <Input
                        label="LSAT Score"
                        type="number"
                        placeholder="e.g., 170"
                        value={lsatScore}
                        onChange={(e) => setLsatScore(e.target.value)}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep(4)}
                className="flex-1"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4 — Your Story */}
      {step === 4 && (
        <Card>
          <CardContent className="p-6 sm:p-8 flex flex-col gap-6">
            <div className="text-center">
              <PenLine className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Your Story</h1>
              <p className="text-slate-400">
                Optional but encouraged — this powers your scholarship essays
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="space-y-1">
                <Textarea
                  label="Personal Statement"
                  rows={6}
                  placeholder="Tell us about yourself, your goals, and what drives you. This becomes the foundation for all your scholarship essays..."
                  value={personalStatement}
                  onChange={(e) => setPersonalStatement(e.target.value)}
                />
                <p className="text-xs text-slate-500">
                  Paste an existing personal statement or write a brief version.
                  You can expand it later.
                </p>
              </div>

              {/* Activities */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300">
                  Activities & Involvement
                </label>
                {activities.map((activity, index) => (
                  <div
                    key={index}
                    className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">
                        Activity {index + 1}
                      </span>
                      {activities.length > 1 && (
                        <button
                          onClick={() => removeActivity(index)}
                          className="text-slate-500 hover:text-red-400 transition-colors duration-200"
                          aria-label={`Remove activity ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <Input
                      placeholder="Activity name"
                      value={activity.name}
                      onChange={(e) =>
                        updateActivity(index, "name", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Your role"
                      value={activity.role}
                      onChange={(e) =>
                        updateActivity(index, "role", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Brief description"
                      value={activity.description}
                      onChange={(e) =>
                        updateActivity(index, "description", e.target.value)
                      }
                    />
                  </div>
                ))}
                {activities.length < 10 && (
                  <button
                    onClick={addActivity}
                    className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4" />
                    Add another activity
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(3)}>
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
                Complete Setup
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <button
              onClick={completeOnboarding}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors duration-200 text-center"
            >
              I&apos;ll add more later
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
