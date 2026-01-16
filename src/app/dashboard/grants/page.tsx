"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Clock,
  DollarSign,
  Building2,
  Star,
  StarOff,
  ExternalLink,
  ChevronDown,
  Sparkles,
  RefreshCw,
  MapPin,
  Download,
  FileSpreadsheet,
  FileText,
  Mail,
  Phone,
  TrendingUp,
  Globe,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Select } from "@/components/ui";
import { exportGrantsToPDF, exportSingleGrantToPDF } from "@/lib/pdf-export";

interface MatchBreakdown {
  location: number;
  orgType: number;
  category: number;
  amount: number;
  keywords: number;
}

interface Grant {
  id: string;
  title: string;
  funder: string;
  description: string | null;
  amount: string | null;
  amountMin: number | null;
  amountMax: number | null;
  deadline: string | null;
  type: string | null;
  category: string | null;
  eligibility: string | null;
  requirements: string | null;
  matchScore: number | null;
  matchReasons: string[] | null;
  matchBreakdown: MatchBreakdown | null;
  status: string;
  url: string | null;
  state: string | null;
  region: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  agencyName: string | null;
  tags: string | null;
}

const US_STATES = [
  { value: "", label: "All States" },
  { value: "ALL", label: "National (All States)" },
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
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

const grantTypes = [
  { value: "", label: "All Types" },
  { value: "federal", label: "Federal" },
  { value: "state", label: "State" },
  { value: "foundation", label: "Foundation" },
  { value: "corporate", label: "Corporate" },
];

const grantCategories = [
  { value: "", label: "All Categories" },
  { value: "sbir", label: "SBIR" },
  { value: "sttr", label: "STTR" },
  { value: "small_business", label: "Small Business" },
  { value: "venture", label: "Venture/Innovation" },
  { value: "workforce", label: "Workforce Training" },
  { value: "energy", label: "Clean Energy" },
  { value: "technology", label: "Technology" },
  { value: "health", label: "Health" },
  { value: "research", label: "Research" },
  { value: "economic_development", label: "Economic Development" },
  { value: "environment", label: "Environment" },
  { value: "entrepreneurship", label: "Entrepreneurship" },
  { value: "accelerator", label: "Accelerator" },
];

const amountRanges = [
  { value: "", label: "Any Amount" },
  { value: "0-50000", label: "Up to $50K" },
  { value: "50000-100000", label: "$50K - $100K" },
  { value: "100000-250000", label: "$100K - $250K" },
  { value: "250000-500000", label: "$250K - $500K" },
  { value: "500000-1000000", label: "$500K - $1M" },
  { value: "1000000+", label: "$1M+" },
];

const sortOptions = [
  { value: "match", label: "Best Match" },
  { value: "deadline", label: "Deadline (Soonest)" },
  { value: "amount", label: "Amount (Highest)" },
  { value: "newest", label: "Recently Added" },
];

export default function GrantsPage() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [amountFilter, setAmountFilter] = useState("");
  const [sortBy, setSortBy] = useState("match");
  const [showFilters, setShowFilters] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    fetchGrants();
  }, []);

  const fetchGrants = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/grants");
      const data = await res.json();
      if (data.grants) {
        setGrants(data.grants);
      }
      setHasProfile(data.hasProfile || false);
    } catch (error) {
      console.error("Failed to fetch grants:", error);
    } finally {
      setLoading(false);
    }
  };

  const recalculateMatches = async () => {
    setRecalculating(true);
    try {
      const res = await fetch("/api/grants/match", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await fetchGrants(); // Refresh grants with new scores
      }
    } catch (error) {
      console.error("Failed to recalculate matches:", error);
    } finally {
      setRecalculating(false);
    }
  };

  const toggleSave = async (grantId: string, currentStatus: string) => {
    const newStatus = currentStatus === "saved" ? "discovered" : "saved";
    try {
      await fetch(`/api/grants/${grantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setGrants((prev) =>
        prev.map((g) =>
          g.id === grantId ? { ...g, status: newStatus } : g
        )
      );
    } catch (error) {
      console.error("Failed to update grant:", error);
    }
  };

  const filteredGrants = grants
    .filter((g) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          g.title.toLowerCase().includes(query) ||
          g.funder.toLowerCase().includes(query) ||
          (g.description && g.description.toLowerCase().includes(query)) ||
          (g.tags && g.tags.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      // State filter - show both state-specific AND national grants
      if (stateFilter) {
        if (stateFilter === "ALL") {
          if (g.state !== "ALL") return false;
        } else {
          if (g.state !== stateFilter && g.state !== "ALL") return false;
        }
      }
      // Type filter
      if (typeFilter && g.type !== typeFilter) return false;
      // Category filter
      if (categoryFilter && g.category !== categoryFilter) return false;
      // Amount filter
      if (amountFilter) {
        const [min, max] = amountFilter.split("-").map((v) =>
          v.endsWith("+") ? Infinity : parseInt(v)
        );
        if (g.amountMax && (g.amountMax < min || (max !== Infinity && g.amountMin && g.amountMin > max))) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "match") return (b.matchScore || 0) - (a.matchScore || 0);
      if (sortBy === "deadline") {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === "amount") return (b.amountMax || 0) - (a.amountMax || 0);
      return 0;
    });

  const handleScan = async () => {
    setScanning(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await fetchGrants();
    setScanning(false);
  };

  const getDaysUntilDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const exportToCSV = () => {
    const headers = ["Title", "Funder", "Type", "State", "Amount", "Deadline", "Match Score", "URL"];
    const rows = filteredGrants.map((g) => [
      g.title,
      g.funder,
      g.type || "",
      g.state || "",
      g.amount || "",
      g.deadline ? new Date(g.deadline).toLocaleDateString() : "",
      g.matchScore?.toString() || "",
      g.url || "",
    ]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grants-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const getStateName = (code: string | null) => {
    if (!code) return "Unknown";
    if (code === "ALL") return "National";
    const state = US_STATES.find((s) => s.value === code);
    return state?.label || code;
  };

  const savedCount = grants.filter((g) => g.status === "saved").length;
  const highMatchCount = grants.filter((g) => (g.matchScore || 0) >= 80).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Grant Discovery</h1>
          <p className="text-slate-400 mt-1">
            {loading ? "Loading..." : `${grants.length} grants across all 50 states`}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Button variant="secondary" disabled={filteredGrants.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
            <div className="absolute right-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button
                onClick={exportToCSV}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded-t-lg transition"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export as CSV
              </button>
              <button
                onClick={() => exportGrantsToPDF(filteredGrants)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded-b-lg transition"
              >
                <FileText className="h-4 w-4" />
                Export as PDF
              </button>
            </div>
          </div>
          <Button onClick={handleScan} disabled={scanning}>
            {scanning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Scan for New Grants
              </>
            )}
          </Button>
        </div>
      </div>

      {/* AI Matching Banner */}
      {!hasProfile ? (
        <Card className="mb-6 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Unlock AI-Powered Grant Matching</h3>
                  <p className="text-slate-400 text-sm">
                    Complete your organization profile to get personalized match scores based on your mission, industry, and location.
                  </p>
                </div>
              </div>
              <Link href="/dashboard/organization">
                <Button>
                  Complete Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-emerald-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500/20 p-3 rounded-lg">
                  <Sparkles className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">AI Matching Active</h3>
                  <p className="text-slate-400 text-sm">
                    Grants are personalized based on your organization profile. {highMatchCount} high-match opportunities found.
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={recalculateMatches}
                disabled={recalculating}
              >
                {recalculating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Recalculate Matches
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-400 text-sm font-medium">Total Grants</p>
                <p className="text-2xl font-bold text-white">{grants.length}</p>
              </div>
              <Globe className="h-8 w-8 text-emerald-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">Matching Results</p>
                <p className="text-2xl font-bold text-white">{filteredGrants.length}</p>
              </div>
              <Search className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-400 text-sm font-medium">Saved Grants</p>
                <p className="text-2xl font-bold text-white">{savedCount}</p>
              </div>
              <Star className="h-8 w-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm font-medium">High Match (80%+)</p>
                <p className="text-2xl font-bold text-white">{highMatchCount}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search grants by title, funder, keyword, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              <ChevronDown className={`h-4 w-4 ml-2 transition ${showFilters ? "rotate-180" : ""}`} />
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-5 gap-4 mt-4 pt-4 border-t border-slate-700">
              <Select
                label="State"
                options={US_STATES}
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
              />
              <Select
                label="Grant Type"
                options={grantTypes}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              />
              <Select
                label="Category"
                options={grantCategories}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              />
              <Select
                label="Amount Range"
                options={amountRanges}
                value={amountFilter}
                onChange={(e) => setAmountFilter(e.target.value)}
              />
              <Select
                label="Sort By"
                options={sortOptions}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              />
            </div>
          )}

          {/* Active Filters */}
          {(stateFilter || typeFilter || categoryFilter || amountFilter) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700">
              <span className="text-slate-400 text-sm">Active filters:</span>
              {stateFilter && (
                <Badge variant="info" className="flex items-center gap-1">
                  {getStateName(stateFilter)}
                  <button onClick={() => setStateFilter("")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {typeFilter && (
                <Badge variant="success" className="flex items-center gap-1">
                  {typeFilter}
                  <button onClick={() => setTypeFilter("")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {categoryFilter && (
                <Badge variant="warning" className="flex items-center gap-1">
                  {categoryFilter}
                  <button onClick={() => setCategoryFilter("")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {amountFilter && (
                <Badge variant="default" className="flex items-center gap-1">
                  {amountRanges.find((a) => a.value === amountFilter)?.label}
                  <button onClick={() => setAmountFilter("")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <button
                onClick={() => {
                  setStateFilter("");
                  setTypeFilter("");
                  setCategoryFilter("");
                  setAmountFilter("");
                }}
                className="text-slate-400 hover:text-white text-sm ml-2"
              >
                Clear all
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin" />
          <span className="ml-3 text-slate-400">Loading grants...</span>
        </div>
      )}

      {/* Grants List */}
      {!loading && (
        <div className="space-y-4">
          {filteredGrants.map((grant) => {
            const daysUntil = getDaysUntilDeadline(grant.deadline);
            const isUrgent = daysUntil !== null && daysUntil <= 14 && daysUntil > 0;
            const isPast = daysUntil !== null && daysUntil <= 0;

            return (
              <Card key={grant.id} className="hover:border-slate-600 transition">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Match Score */}
                    <div className="flex-shrink-0 text-center">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${
                          (grant.matchScore || 0) >= 80
                            ? "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/50"
                            : (grant.matchScore || 0) >= 60
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-slate-700 text-slate-400"
                        }`}
                      >
                        {grant.matchScore || 0}%
                      </div>
                      <p className="text-slate-500 text-xs mt-1">Match</p>
                    </div>

                    {/* Grant Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3
                            className="text-xl font-semibold text-white hover:text-emerald-400 transition cursor-pointer"
                            onClick={() => setSelectedGrant(grant)}
                          >
                            {grant.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Building2 className="h-4 w-4 text-slate-500" />
                            <span className="text-slate-400">{grant.funder}</span>
                            <Badge
                              variant={
                                grant.type === "federal"
                                  ? "info"
                                  : grant.type === "state"
                                  ? "success"
                                  : grant.type === "foundation"
                                  ? "warning"
                                  : "default"
                              }
                            >
                              {grant.type ? grant.type.charAt(0).toUpperCase() + grant.type.slice(1) : "Unknown"}
                            </Badge>
                            {grant.state && (
                              <Badge variant="default" className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {getStateName(grant.state)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSave(grant.id, grant.status)}
                          className={`p-2 rounded-lg transition ${
                            grant.status === "saved"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-slate-800 text-slate-500 hover:text-white"
                          }`}
                        >
                          {grant.status === "saved" ? (
                            <Star className="h-5 w-5 fill-current" />
                          ) : (
                            <StarOff className="h-5 w-5" />
                          )}
                        </button>
                      </div>

                      <p className="text-slate-400 mt-3 line-clamp-2">{grant.description}</p>

                      <div className="flex items-center gap-6 mt-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-emerald-400" />
                          <span className="text-white font-semibold">{grant.amount || "Varies"}</span>
                        </div>
                        {grant.deadline && (
                          <div className="flex items-center gap-2">
                            <Clock className={`h-4 w-4 ${isPast ? "text-slate-500" : isUrgent ? "text-red-400" : "text-slate-500"}`} />
                            <span className={isPast ? "text-slate-500" : isUrgent ? "text-red-400 font-medium" : "text-slate-400"}>
                              {isPast
                                ? "Deadline passed"
                                : daysUntil === 0
                                ? "Due today!"
                                : `${daysUntil} days left`}
                            </span>
                          </div>
                        )}
                        {!grant.deadline && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-emerald-400" />
                            <span className="text-emerald-400">Rolling deadline</span>
                          </div>
                        )}
                        {grant.eligibility && (
                          <span className="text-slate-500 text-sm">{grant.eligibility.substring(0, 60)}...</span>
                        )}
                      </div>

                      {/* Match Reasons */}
                      {grant.matchReasons && grant.matchReasons.length > 0 && (
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <Sparkles className="h-4 w-4 text-emerald-400" />
                          {grant.matchReasons.slice(0, 3).map((reason, idx) => (
                            <Badge key={idx} variant="success" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                          {grant.matchReasons.length > 3 && (
                            <span className="text-slate-500 text-xs">
                              +{grant.matchReasons.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-4">
                        <Button size="sm" onClick={() => setSelectedGrant(grant)}>
                          View Details
                        </Button>
                        <Link href={`/dashboard/grants/${grant.id}/apply`}>
                          <Button size="sm" variant="secondary">
                            Start Application
                          </Button>
                        </Link>
                        {grant.url && (
                          <a
                            href={grant.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Official Site
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && filteredGrants.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-white font-medium mb-2">No grants found</p>
            <p className="text-slate-400">Try adjusting your filters or search query</p>
          </CardContent>
        </Card>
      )}

      {/* Grant Detail Modal */}
      {selectedGrant && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-start justify-between p-6 border-b border-slate-700">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedGrant.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant={
                      selectedGrant.type === "federal"
                        ? "info"
                        : selectedGrant.type === "state"
                        ? "success"
                        : selectedGrant.type === "foundation"
                        ? "warning"
                        : "default"
                    }
                  >
                    {selectedGrant.type ? selectedGrant.type.charAt(0).toUpperCase() + selectedGrant.type.slice(1) : "Unknown"}
                  </Badge>
                  {selectedGrant.state && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {getStateName(selectedGrant.state)}
                    </Badge>
                  )}
                  {selectedGrant.category && (
                    <Badge variant="default">{selectedGrant.category}</Badge>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedGrant(null)}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Match Score & Amount */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <div className={`text-3xl font-bold ${
                    (selectedGrant.matchScore || 0) >= 80 ? "text-emerald-400" :
                    (selectedGrant.matchScore || 0) >= 60 ? "text-amber-400" : "text-slate-400"
                  }`}>
                    {selectedGrant.matchScore || 0}%
                  </div>
                  <p className="text-slate-400 text-sm mt-1">Match Score</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-emerald-400">
                    {selectedGrant.amount || "Varies"}
                  </div>
                  <p className="text-slate-400 text-sm mt-1">Funding Amount</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <div className={`text-3xl font-bold ${
                    getDaysUntilDeadline(selectedGrant.deadline) !== null &&
                    getDaysUntilDeadline(selectedGrant.deadline)! <= 14
                      ? "text-red-400"
                      : "text-blue-400"
                  }`}>
                    {selectedGrant.deadline
                      ? getDaysUntilDeadline(selectedGrant.deadline) !== null && getDaysUntilDeadline(selectedGrant.deadline)! > 0
                        ? `${getDaysUntilDeadline(selectedGrant.deadline)} days`
                        : "Passed"
                      : "Rolling"}
                  </div>
                  <p className="text-slate-400 text-sm mt-1">Until Deadline</p>
                </div>
              </div>

              {/* AI Match Analysis */}
              {selectedGrant.matchBreakdown && (
                <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-purple-500/20 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-purple-400 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Match Analysis
                  </h3>
                  <div className="space-y-3">
                    {/* Location Match */}
                    <div className="flex items-center gap-3">
                      <div className="w-24 text-slate-400 text-sm">Location</div>
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                          style={{ width: `${selectedGrant.matchBreakdown.location}%` }}
                        />
                      </div>
                      <div className="w-12 text-right text-sm font-medium text-slate-300">
                        {selectedGrant.matchBreakdown.location}%
                      </div>
                    </div>
                    {/* Organization Type Match */}
                    <div className="flex items-center gap-3">
                      <div className="w-24 text-slate-400 text-sm">Org Type</div>
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                          style={{ width: `${selectedGrant.matchBreakdown.orgType}%` }}
                        />
                      </div>
                      <div className="w-12 text-right text-sm font-medium text-slate-300">
                        {selectedGrant.matchBreakdown.orgType}%
                      </div>
                    </div>
                    {/* Category Match */}
                    <div className="flex items-center gap-3">
                      <div className="w-24 text-slate-400 text-sm">Category</div>
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
                          style={{ width: `${selectedGrant.matchBreakdown.category}%` }}
                        />
                      </div>
                      <div className="w-12 text-right text-sm font-medium text-slate-300">
                        {selectedGrant.matchBreakdown.category}%
                      </div>
                    </div>
                    {/* Funding Amount Match */}
                    <div className="flex items-center gap-3">
                      <div className="w-24 text-slate-400 text-sm">Amount</div>
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                          style={{ width: `${selectedGrant.matchBreakdown.amount}%` }}
                        />
                      </div>
                      <div className="w-12 text-right text-sm font-medium text-slate-300">
                        {selectedGrant.matchBreakdown.amount}%
                      </div>
                    </div>
                    {/* Keywords Match */}
                    <div className="flex items-center gap-3">
                      <div className="w-24 text-slate-400 text-sm">Keywords</div>
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-red-500 rounded-full transition-all"
                          style={{ width: `${selectedGrant.matchBreakdown.keywords}%` }}
                        />
                      </div>
                      <div className="w-12 text-right text-sm font-medium text-slate-300">
                        {selectedGrant.matchBreakdown.keywords}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Match Reasons */}
              {selectedGrant.matchReasons && selectedGrant.matchReasons.length > 0 && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Why This Grant Matches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedGrant.matchReasons.map((reason, idx) => (
                      <Badge key={idx} variant="success">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Funder */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Funder</h3>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-400" />
                  <span className="text-white font-medium">{selectedGrant.funder}</span>
                </div>
                {selectedGrant.agencyName && selectedGrant.agencyName !== selectedGrant.funder && (
                  <p className="text-slate-400 text-sm mt-1">{selectedGrant.agencyName}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Description</h3>
                <p className="text-slate-300">{selectedGrant.description}</p>
              </div>

              {/* Eligibility */}
              {selectedGrant.eligibility && (
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Eligibility</h3>
                  <p className="text-slate-300">{selectedGrant.eligibility}</p>
                </div>
              )}

              {/* Requirements */}
              {selectedGrant.requirements && (
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Requirements</h3>
                  <p className="text-slate-300">{selectedGrant.requirements}</p>
                </div>
              )}

              {/* Contact Information */}
              {(selectedGrant.contactName || selectedGrant.contactEmail || selectedGrant.contactPhone) && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    {selectedGrant.contactName && (
                      <p className="text-white font-medium">{selectedGrant.contactName}</p>
                    )}
                    {selectedGrant.contactEmail && (
                      <a
                        href={`mailto:${selectedGrant.contactEmail}`}
                        className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition"
                      >
                        <Mail className="h-4 w-4" />
                        {selectedGrant.contactEmail}
                      </a>
                    )}
                    {selectedGrant.contactPhone && (
                      <a
                        href={`tel:${selectedGrant.contactPhone}`}
                        className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition"
                      >
                        <Phone className="h-4 w-4" />
                        {selectedGrant.contactPhone}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Golden Question Tip */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <h3 className="text-sm font-medium text-amber-400 mb-2">Pro Tip: The Golden Question</h3>
                <p className="text-slate-300 text-sm">
                  When reaching out to the program office, if they say "We can't help you," always ask:
                  <span className="text-amber-400 font-medium"> "Can you suggest any other sources that may be able to help?"</span>
                  This unlocks hidden resources and expands your opportunities.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
                <Link href={`/dashboard/grants/${selectedGrant.id}/apply`} className="flex-1">
                  <Button className="w-full">
                    Start Application
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  onClick={() => toggleSave(selectedGrant.id, selectedGrant.status)}
                >
                  {selectedGrant.status === "saved" ? (
                    <>
                      <Star className="h-4 w-4 mr-2 fill-current" />
                      Saved
                    </>
                  ) : (
                    <>
                      <StarOff className="h-4 w-4 mr-2" />
                      Save Grant
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => exportSingleGrantToPDF(selectedGrant)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                {selectedGrant.url && (
                  <a href={selectedGrant.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Official Site
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
