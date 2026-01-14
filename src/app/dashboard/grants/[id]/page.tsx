"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Clock,
  DollarSign,
  ExternalLink,
  Star,
  StarOff,
  CheckCircle,
  AlertTriangle,
  FileText,
  Users,
  Target,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";

// Mock grant data - in real app this would be fetched
const mockGrant = {
  id: "1",
  title: "SBIR Phase I - Artificial Intelligence and Machine Learning",
  funder: "National Science Foundation",
  description: "The NSF SBIR Phase I program supports small businesses developing innovative AI/ML technologies with significant commercial potential. This funding opportunity focuses on breakthrough technologies in natural language processing, computer vision, predictive analytics, and machine learning infrastructure.\n\nPhase I awards are designed to establish technical merit, feasibility, and commercial potential of the proposed R&D efforts.",
  amount: "$275,000",
  amountMin: 250000,
  amountMax: 275000,
  deadline: "2024-03-15",
  type: "federal",
  category: "sbir",
  matchScore: 92,
  status: "saved",
  url: "https://www.nsf.gov/sbir",
  eligibility: [
    "Small business with fewer than 500 employees",
    "At least 51% owned by U.S. citizens or permanent residents",
    "Principal investigator must be primarily employed by the small business",
    "Research must be performed in the United States",
  ],
  requirements: [
    "Project summary (1 page)",
    "Technical proposal (15 pages max)",
    "Budget justification",
    "Biographical sketches of key personnel",
    "Current and pending support documentation",
  ],
  timeline: [
    { date: "2024-03-15", event: "Application deadline" },
    { date: "2024-05-01", event: "Review period begins" },
    { date: "2024-07-15", event: "Award notifications" },
    { date: "2024-09-01", event: "Project start date" },
  ],
  fundingHistory: "$45M awarded in 2023 across 180 projects",
  successRate: "23% of applications funded",
  matchReasons: [
    { reason: "Your AI/ML focus aligns with program priorities", score: 95 },
    { reason: "Company size meets eligibility requirements", score: 100 },
    { reason: "California location is eligible", score: 100 },
    { reason: "Revenue stage matches typical awardees", score: 85 },
    { reason: "Team background matches successful applicants", score: 80 },
  ],
};

export default function GrantDetailPage() {
  const params = useParams();
  const [saved, setSaved] = useState(mockGrant.status === "saved");

  const daysUntilDeadline = Math.ceil(
    (new Date(mockGrant.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Back Button */}
      <Link
        href="/dashboard/grants"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Grants
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge
              variant={
                mockGrant.type === "federal"
                  ? "info"
                  : mockGrant.type === "state"
                  ? "success"
                  : "warning"
              }
            >
              {mockGrant.type.charAt(0).toUpperCase() + mockGrant.type.slice(1)}
            </Badge>
            <Badge variant="default">{mockGrant.category.toUpperCase()}</Badge>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{mockGrant.title}</h1>
          <div className="flex items-center gap-2 text-slate-400">
            <Building2 className="h-5 w-5" />
            <span className="text-lg">{mockGrant.funder}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSaved(!saved)}
            className={`p-3 rounded-lg transition ${
              saved
                ? "bg-amber-500/20 text-amber-400"
                : "bg-slate-800 text-slate-500 hover:text-white"
            }`}
          >
            {saved ? (
              <Star className="h-6 w-6 fill-current" />
            ) : (
              <StarOff className="h-6 w-6" />
            )}
          </button>
          <a
            href={mockGrant.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
          >
            <ExternalLink className="h-6 w-6" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{mockGrant.amount}</p>
                <p className="text-slate-400 text-sm">Award Amount</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className={`h-8 w-8 mx-auto mb-2 ${daysUntilDeadline <= 14 ? "text-red-400" : "text-amber-400"}`} />
                <p className="text-2xl font-bold text-white">{daysUntilDeadline} days</p>
                <p className="text-slate-400 text-sm">Until Deadline</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-emerald-400">{mockGrant.matchScore}%</p>
                <p className="text-slate-400 text-sm">Match Score</p>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-white">About This Grant</h2>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 whitespace-pre-line">{mockGrant.description}</p>
              <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500 text-sm">Funding History</p>
                  <p className="text-white">{mockGrant.fundingHistory}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Success Rate</p>
                  <p className="text-white">{mockGrant.successRate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Eligibility */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-400" />
                Eligibility Requirements
              </h2>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {mockGrant.eligibility.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Application Requirements */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                Application Requirements
              </h2>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {mockGrant.requirements.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-sm text-slate-400">
                      {idx + 1}
                    </div>
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-400" />
                Timeline
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockGrant.timeline.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-24 text-slate-500 text-sm">
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-slate-300">{item.event}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply CTA */}
          <Card className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-emerald-500/30">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Ready to Apply?</h3>
              <p className="text-slate-400 text-sm mb-4">
                Our AI will help fill out your application using your profile and documents.
              </p>
              <Link href={`/dashboard/grants/${params.id}/apply`}>
                <Button size="lg" className="w-full">
                  Start Application
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Match Analysis */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-white">Why You Match</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockGrant.matchReasons.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 text-sm">{item.reason}</span>
                    <span className="text-emerald-400 font-medium">{item.score}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Deadline Warning */}
          {daysUntilDeadline <= 14 && (
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium">Deadline Approaching</p>
                  <p className="text-slate-400 text-sm mt-1">
                    Only {daysUntilDeadline} days left to submit. Start your application now.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <a
                href={mockGrant.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition text-slate-300 hover:text-white"
              >
                <ExternalLink className="h-5 w-5" />
                <span>View Official Page</span>
              </a>
              <button
                onClick={() => setSaved(!saved)}
                className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition text-slate-300 hover:text-white w-full"
              >
                {saved ? <Star className="h-5 w-5 text-amber-400 fill-current" /> : <StarOff className="h-5 w-5" />}
                <span>{saved ? "Saved to List" : "Save for Later"}</span>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
