"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Plus, Trash2, Save, User, BookOpen, ClipboardList, Shield, Star } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Select } from "@/components/ui";
import { useToast } from "@/components/ui/toast";

// ─── Static option lists ─────────────────────────────────────────────────────

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

const gpaScaleOptions = [
  { value: "4.0", label: "4.0 scale" },
  { value: "5.0", label: "5.0 scale" },
];

// ─── Level groupings ──────────────────────────────────────────────────────────

const gradLevels = ["masters", "phd", "medical", "dental", "law"];
const undergradLevels = ["hs_senior", "undergrad_fr", "undergrad_so", "undergrad_jr", "undergrad_sr", "post_bacc"];
const businessLevels = ["masters"]; // GMAT typically for MBA

// ─── Repeatable item type ─────────────────────────────────────────────────────

interface ActivityItem {
  name: string;
  role: string;
  description: string;
}

function emptyActivity(): ActivityItem {
  return { name: "", role: "", description: "" };
}

// ─── Completeness calculation ─────────────────────────────────────────────────

interface ProfileData {
  firstName: string;
  lastName: string;
  schoolName: string;
  educationLevel: string;
  expectedGraduation: string;
  stateOfResidence: string;
  major: string;
  minor: string;
  fieldOfStudy: string;
  gpa: string;
  gpaScale: string;
  careerGoal: string;
  intendedDegree: string;
  satScore: string;
  actScore: string;
  greScore: string;
  mcatScore: string;
  lsatScore: string;
  gmatScore: string;
  citizenship: string;
  financialNeed: string;
  firstGeneration: boolean;
  minority: boolean;
  veteran: boolean;
  disability: boolean;
  gender: string;
  ethnicity: string;
  extracurriculars: ActivityItem[];
  workExperience: ActivityItem[];
  communityService: ActivityItem[];
  awards: ActivityItem[];
  researchExperience: ActivityItem[];
}

const IMPORTANT_FIELDS: (keyof ProfileData)[] = [
  "firstName",
  "lastName",
  "schoolName",
  "educationLevel",
  "expectedGraduation",
  "stateOfResidence",
  "major",
  "fieldOfStudy",
  "gpa",
  "careerGoal",
  "citizenship",
];

function calcCompleteness(data: ProfileData): { pct: number; missing: string[] } {
  const fieldLabels: Partial<Record<keyof ProfileData, string>> = {
    firstName: "First name",
    lastName: "Last name",
    schoolName: "School name",
    educationLevel: "Education level",
    expectedGraduation: "Expected graduation",
    stateOfResidence: "State of residence",
    major: "Major",
    fieldOfStudy: "Field of study",
    gpa: "GPA",
    careerGoal: "Career goal",
    citizenship: "Citizenship status",
  };

  let filled = 0;
  const missing: string[] = [];

  for (const field of IMPORTANT_FIELDS) {
    const val = data[field];
    const hasValue =
      typeof val === "boolean"
        ? true
        : typeof val === "string"
        ? val.trim() !== ""
        : Array.isArray(val)
        ? val.length > 0 && (val[0] as ActivityItem).name.trim() !== ""
        : false;

    if (hasValue) {
      filled++;
    } else {
      missing.push(fieldLabels[field] ?? String(field));
    }
  }

  return {
    pct: Math.round((filled / IMPORTANT_FIELDS.length) * 100),
    missing,
  };
}

// ─── Collapsible section wrapper ──────────────────────────────────────────────

interface SectionProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Section({ title, description, icon, defaultOpen = true, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card variant="elevated">
      <CardHeader
        action={
          <button
            onClick={() => setOpen((o) => !o)}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label={open ? "Collapse section" : "Expand section"}
          >
            {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        }
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0">{icon}</div>
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      {open && <CardContent className="p-6 space-y-4">{children}</CardContent>}
    </Card>
  );
}

// ─── Repeatable list editor ───────────────────────────────────────────────────

interface RepeatableListProps {
  label: string;
  items: ActivityItem[];
  onChange: (items: ActivityItem[]) => void;
  max?: number;
}

function RepeatableList({ label, items, onChange, max = 10 }: RepeatableListProps) {
  function add() {
    if (items.length >= max) return;
    onChange([...items, emptyActivity()]);
  }

  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  function update(i: number, field: keyof ActivityItem, value: string) {
    onChange(items.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      {items.map((item, i) => (
        <div
          key={i}
          className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-lg space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Entry {i + 1}</span>
            <button
              onClick={() => remove(i)}
              className="text-slate-500 hover:text-red-400 transition-colors"
              aria-label={`Remove entry ${i + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <Input
            placeholder="Name / Title"
            value={item.name}
            onChange={(e) => update(i, "name", e.target.value)}
          />
          <Input
            placeholder="Role / Position"
            value={item.role}
            onChange={(e) => update(i, "role", e.target.value)}
          />
          <Input
            placeholder="Brief description"
            value={item.description}
            onChange={(e) => update(i, "description", e.target.value)}
          />
        </div>
      ))}
      {items.length < max && (
        <button
          onClick={add}
          className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add {label.toLowerCase()}
        </button>
      )}
      {items.length === 0 && (
        <p className="text-xs text-slate-500">No entries yet. Click above to add one.</p>
      )}
    </div>
  );
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function CheckboxField({ label, checked, onChange }: CheckboxFieldProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950"
      />
      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
        {label}
      </span>
    </label>
  );
}

// ─── Helper: parse JSON activity array from API ───────────────────────────────

function parseActivities(raw: unknown): ActivityItem[] {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item: unknown) => {
      if (typeof item === "object" && item !== null) {
        const obj = item as Record<string, unknown>;
        return {
          name: String(obj.name ?? ""),
          role: String(obj.role ?? ""),
          description: String(obj.description ?? ""),
        };
      }
      return emptyActivity();
    });
  } catch {
    return [];
  }
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StudentProfileEditPage() {
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Section 1 — Personal Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [expectedGraduation, setExpectedGraduation] = useState("");
  const [stateOfResidence, setStateOfResidence] = useState("");

  // Section 2 — Academics
  const [major, setMajor] = useState("");
  const [minor, setMinor] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [gpa, setGpa] = useState("");
  const [gpaScale, setGpaScale] = useState("4.0");
  const [careerGoal, setCareerGoal] = useState("");
  const [intendedDegree, setIntendedDegree] = useState("");

  // Section 3 — Test Scores
  const [satScore, setSatScore] = useState("");
  const [actScore, setActScore] = useState("");
  const [greScore, setGreScore] = useState("");
  const [mcatScore, setMcatScore] = useState("");
  const [lsatScore, setLsatScore] = useState("");
  const [gmatScore, setGmatScore] = useState("");

  // Section 4 — Eligibility
  const [citizenship, setCitizenship] = useState("");
  const [financialNeed, setFinancialNeed] = useState("");
  const [firstGeneration, setFirstGeneration] = useState(false);
  const [minority, setMinority] = useState(false);
  const [veteran, setVeteran] = useState(false);
  const [disability, setDisability] = useState(false);
  const [gender, setGender] = useState("");
  const [ethnicity, setEthnicity] = useState("");

  // Section 5 — Activities
  const [extracurriculars, setExtracurriculars] = useState<ActivityItem[]>([]);
  const [workExperience, setWorkExperience] = useState<ActivityItem[]>([]);
  const [communityService, setCommunityService] = useState<ActivityItem[]>([]);
  const [awards, setAwards] = useState<ActivityItem[]>([]);
  const [researchExperience, setResearchExperience] = useState<ActivityItem[]>([]);

  // ─── Derived display flags ──────────────────────────────────────────────────

  const showIntendedDegree = gradLevels.includes(educationLevel);
  const showSatAct = undergradLevels.includes(educationLevel);
  const showGre = educationLevel === "masters" || educationLevel === "phd";
  const showMcat = educationLevel === "medical";
  const showLsat = educationLevel === "law";
  const showGmat = businessLevels.includes(educationLevel);
  const showAnyTestScore = showSatAct || showGre || showMcat || showLsat || showGmat;

  // ─── Completeness ───────────────────────────────────────────────────────────

  const profileData: ProfileData = {
    firstName, lastName, schoolName, educationLevel, expectedGraduation,
    stateOfResidence, major, minor, fieldOfStudy, gpa, gpaScale, careerGoal,
    intendedDegree, satScore, actScore, greScore, mcatScore, lsatScore, gmatScore,
    citizenship, financialNeed, firstGeneration, minority, veteran, disability,
    gender, ethnicity, extracurriculars, workExperience, communityService,
    awards, researchExperience,
  };

  const { pct, missing } = calcCompleteness(profileData);

  const progressColor =
    pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";

  // ─── Fetch on mount ─────────────────────────────────────────────────────────

  const hydrate = useCallback((p: Record<string, unknown>) => {
    setFirstName(String(p.firstName ?? ""));
    setLastName(String(p.lastName ?? ""));
    setSchoolName(String(p.schoolName ?? ""));
    setEducationLevel(String(p.educationLevel ?? ""));
    setExpectedGraduation(String(p.expectedGraduation ?? ""));
    setStateOfResidence(String(p.stateOfResidence ?? ""));
    setMajor(String(p.major ?? ""));
    setMinor(String(p.minor ?? ""));
    setFieldOfStudy(String(p.fieldOfStudy ?? ""));
    setGpa(p.gpa != null ? String(p.gpa) : "");
    setGpaScale(p.gpaScale != null ? String(p.gpaScale) : "4.0");
    setCareerGoal(String(p.careerGoal ?? ""));
    setIntendedDegree(String(p.intendedDegree ?? ""));
    setSatScore(p.satScore != null ? String(p.satScore) : "");
    setActScore(p.actScore != null ? String(p.actScore) : "");
    setGreScore(p.greScore != null ? String(p.greScore) : "");
    setMcatScore(p.mcatScore != null ? String(p.mcatScore) : "");
    setLsatScore(p.lsatScore != null ? String(p.lsatScore) : "");
    setGmatScore(p.gmatScore != null ? String(p.gmatScore) : "");
    setCitizenship(String(p.citizenship ?? ""));
    setFinancialNeed(String(p.financialNeed ?? ""));
    setFirstGeneration(Boolean(p.firstGeneration));
    setMinority(Boolean(p.minority));
    setVeteran(Boolean(p.veteran));
    setDisability(Boolean(p.disability));
    setGender(String(p.gender ?? ""));
    setEthnicity(String(p.ethnicity ?? ""));
    setExtracurriculars(parseActivities(p.extracurriculars));
    setWorkExperience(parseActivities(p.workExperience));
    setCommunityService(parseActivities(p.communityService));
    setAwards(parseActivities(p.awards));
    setResearchExperience(parseActivities(p.researchExperience));
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/student/profile");
        if (res.status === 404 || res.status === 401) {
          router.replace("/student/onboarding");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        if (!data) {
          router.replace("/student/onboarding");
          return;
        }
        hydrate(data);
      } catch {
        toast.error("Failed to load profile", "Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [router, hydrate, toast]);

  // ─── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        schoolName: schoolName.trim(),
        educationLevel,
        expectedGraduation,
        stateOfResidence,
        major: major.trim(),
        minor: minor.trim(),
        fieldOfStudy,
        gpa: gpa ? parseFloat(gpa) : null,
        gpaScale: gpaScale ? parseFloat(gpaScale) : 4.0,
        careerGoal: careerGoal.trim(),
        intendedDegree: showIntendedDegree ? intendedDegree : null,
        satScore: showSatAct && satScore ? parseInt(satScore) : null,
        actScore: showSatAct && actScore ? parseInt(actScore) : null,
        greScore: showGre && greScore ? parseInt(greScore) : null,
        mcatScore: showMcat && mcatScore ? parseInt(mcatScore) : null,
        lsatScore: showLsat && lsatScore ? parseInt(lsatScore) : null,
        gmatScore: showGmat && gmatScore ? parseInt(gmatScore) : null,
        citizenship,
        financialNeed,
        firstGeneration,
        minority,
        veteran,
        disability,
        gender: gender.trim(),
        ethnicity: ethnicity.trim(),
        extracurriculars: JSON.stringify(extracurriculars.filter((a) => a.name.trim())),
        workExperience: JSON.stringify(workExperience.filter((a) => a.name.trim())),
        communityService: JSON.stringify(communityService.filter((a) => a.name.trim())),
        awards: JSON.stringify(awards.filter((a) => a.name.trim())),
        researchExperience: JSON.stringify(researchExperience.filter((a) => a.name.trim())),
      };

      const res = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Save failed");
      }

      toast.success("Profile saved", "Your scholarship profile has been updated.");
    } catch (err) {
      toast.error("Failed to save", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ─── Loading skeleton ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Keep your profile up-to-date to get the best scholarship matches.
        </p>
      </div>

      {/* Completeness bar */}
      <Card variant="elevated">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Profile Completeness</span>
            <span
              className={`text-sm font-bold ${
                pct >= 80
                  ? "text-emerald-400"
                  : pct >= 50
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
            >
              {pct}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {missing.length > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              To improve your matches, add:{" "}
              <span className="text-slate-400">{missing.slice(0, 4).join(", ")}{missing.length > 4 ? ` +${missing.length - 4} more` : ""}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Section 1 — Personal Info */}
      <Section
        title="Personal Info"
        description="Basic identification and school information"
        icon={<User className="h-4 w-4" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            label="Last Name"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <Input
          label="School Name"
          placeholder="e.g., Stanford University"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
        />
        <Select
          label="Education Level"
          options={educationLevels}
          value={educationLevel}
          onChange={(e) => setEducationLevel((e.target as HTMLSelectElement).value)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Expected Graduation"
            options={graduationYears}
            value={expectedGraduation}
            onChange={(e) => setExpectedGraduation((e.target as HTMLSelectElement).value)}
          />
          <Select
            label="State of Residence"
            options={usStates}
            value={stateOfResidence}
            onChange={(e) => setStateOfResidence((e.target as HTMLSelectElement).value)}
          />
        </div>
      </Section>

      {/* Section 2 — Academics */}
      <Section
        title="Academics"
        description="Major, GPA, and academic goals"
        icon={<BookOpen className="h-4 w-4" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Major"
            placeholder="e.g., Computer Science"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
          />
          <Input
            label="Minor"
            placeholder="e.g., Mathematics"
            value={minor}
            onChange={(e) => setMinor(e.target.value)}
          />
        </div>
        <Select
          label="Field of Study"
          options={fieldsOfStudy}
          value={fieldOfStudy}
          onChange={(e) => setFieldOfStudy((e.target as HTMLSelectElement).value)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <Select
            label="GPA Scale"
            options={gpaScaleOptions}
            value={gpaScale}
            onChange={(e) => setGpaScale((e.target as HTMLSelectElement).value)}
          />
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
            onChange={(e) => setIntendedDegree((e.target as HTMLSelectElement).value)}
          />
        )}
      </Section>

      {/* Section 3 — Test Scores */}
      {showAnyTestScore && (
        <Section
          title="Test Scores"
          description="Standardized test scores for your level"
          icon={<ClipboardList className="h-4 w-4" />}
          defaultOpen={true}
        >
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
            {showGmat && (
              <Input
                label="GMAT Score"
                type="number"
                placeholder="e.g., 700"
                value={gmatScore}
                onChange={(e) => setGmatScore(e.target.value)}
              />
            )}
          </div>
          <p className="text-xs text-slate-500">
            Test scores are optional but help match you with merit-based scholarships.
          </p>
        </Section>
      )}

      {/* Section 4 — Eligibility */}
      <Section
        title="Eligibility"
        description="Citizenship, financial need, and demographic information"
        icon={<Shield className="h-4 w-4" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Citizenship Status"
            options={citizenshipOptions}
            value={citizenship}
            onChange={(e) => setCitizenship((e.target as HTMLSelectElement).value)}
          />
          <Select
            label="Financial Need"
            options={financialNeedOptions}
            value={financialNeed}
            onChange={(e) => setFinancialNeed((e.target as HTMLSelectElement).value)}
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">Background</label>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
            <CheckboxField
              label="First-generation college student"
              checked={firstGeneration}
              onChange={setFirstGeneration}
            />
            <CheckboxField
              label="Underrepresented minority"
              checked={minority}
              onChange={setMinority}
            />
            <CheckboxField
              label="Military veteran or dependent"
              checked={veteran}
              onChange={setVeteran}
            />
            <CheckboxField
              label="Person with disability"
              checked={disability}
              onChange={setDisability}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Gender"
            placeholder="e.g., Female, Male, Non-binary"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          />
          <Input
            label="Ethnicity"
            placeholder="e.g., Hispanic, African American"
            value={ethnicity}
            onChange={(e) => setEthnicity(e.target.value)}
          />
        </div>
        <p className="text-xs text-slate-500">
          Demographic information is optional and only used to surface relevant scholarships.
        </p>
      </Section>

      {/* Section 5 — Activities & Experience */}
      <Section
        title="Activities & Experience"
        description="Extracurriculars, work, service, awards, and research"
        icon={<Star className="h-4 w-4" />}
        defaultOpen={false}
      >
        <RepeatableList
          label="Extracurricular Activities"
          items={extracurriculars}
          onChange={setExtracurriculars}
        />
        <div className="border-t border-slate-800 pt-4">
          <RepeatableList
            label="Work Experience"
            items={workExperience}
            onChange={setWorkExperience}
          />
        </div>
        <div className="border-t border-slate-800 pt-4">
          <RepeatableList
            label="Community Service"
            items={communityService}
            onChange={setCommunityService}
          />
        </div>
        <div className="border-t border-slate-800 pt-4">
          <RepeatableList
            label="Awards & Honors"
            items={awards}
            onChange={setAwards}
          />
        </div>
        <div className="border-t border-slate-800 pt-4">
          <RepeatableList
            label="Research Experience"
            items={researchExperience}
            onChange={setResearchExperience}
          />
        </div>
      </Section>

      {/* Save button */}
      <div className="flex justify-end pb-8">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          isLoading={saving}
          loadingText="Saving..."
        >
          <Save className="h-4 w-4" />
          Save Profile
        </Button>
      </div>
    </div>
  );
}
