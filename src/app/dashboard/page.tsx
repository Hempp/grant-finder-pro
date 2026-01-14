"use client";

import Link from "next/link";
import {
  Search,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";

// Mock data for demo
const stats = [
  { label: "Grants Found", value: "24", icon: Search, change: "+5 this week" },
  { label: "Applications", value: "8", icon: FileText, change: "3 in progress" },
  { label: "Total Requested", value: "$2.4M", icon: DollarSign, change: "Across 8 apps" },
  { label: "Match Score Avg", value: "78%", icon: TrendingUp, change: "Above average" },
];

const recentGrants = [
  {
    id: "1",
    title: "SBIR Phase I - AI/ML Innovation",
    funder: "National Science Foundation",
    amount: "$275,000",
    deadline: "2024-03-15",
    matchScore: 92,
    status: "saved",
  },
  {
    id: "2",
    title: "Small Business Innovation Research",
    funder: "Department of Energy",
    amount: "$200,000",
    deadline: "2024-04-01",
    matchScore: 85,
    status: "interested",
  },
  {
    id: "3",
    title: "Technology Commercialization Fund",
    funder: "State of California",
    amount: "$150,000",
    deadline: "2024-03-28",
    matchScore: 78,
    status: "discovered",
  },
];

const recentApplications = [
  {
    id: "1",
    grantTitle: "SBIR Phase I - AI/ML Innovation",
    status: "in_progress",
    progress: 65,
    deadline: "2024-03-15",
  },
  {
    id: "2",
    grantTitle: "Tech Startup Grant Program",
    status: "ready_for_review",
    progress: 100,
    deadline: "2024-03-20",
  },
  {
    id: "3",
    grantTitle: "Innovation Fund 2024",
    status: "submitted",
    progress: 100,
    deadline: "2024-02-28",
  },
];

const statusColors: Record<string, "default" | "success" | "warning" | "info"> = {
  draft: "default",
  in_progress: "warning",
  ready_for_review: "info",
  submitted: "success",
  awarded: "success",
  rejected: "default",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  in_progress: "In Progress",
  ready_for_review: "Ready for Review",
  submitted: "Submitted",
  awarded: "Awarded",
  rejected: "Rejected",
};

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back! Here&apos;s your grant overview.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/grants">
            <Button variant="secondary">
              <Search className="h-4 w-4 mr-2" />
              Find Grants
            </Button>
          </Link>
          <Link href="/dashboard/documents">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                  <p className="text-emerald-400 text-sm mt-1">{stat.change}</p>
                </div>
                <div className="bg-emerald-500/20 p-3 rounded-xl">
                  <stat.icon className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Recent Grants */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Top Matching Grants</h2>
            <Link href="/dashboard/grants" className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentGrants.map((grant) => (
              <div
                key={grant.id}
                className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition"
              >
                <div className="flex-1">
                  <h3 className="text-white font-medium">{grant.title}</h3>
                  <p className="text-slate-400 text-sm">{grant.funder}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-emerald-400 font-semibold">{grant.amount}</span>
                    <span className="text-slate-500 text-sm flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(grant.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">{grant.matchScore}%</div>
                  <div className="text-slate-500 text-xs">Match</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Recent Applications</h2>
            <Link href="/dashboard/applications" className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentApplications.map((app) => (
              <div
                key={app.id}
                className="p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">{app.grantTitle}</h3>
                  <Badge variant={statusColors[app.status] || "default"}>
                    {statusLabels[app.status]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${app.progress}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-slate-400 text-sm">{app.progress}%</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-slate-500 text-sm flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Due {new Date(app.deadline).toLocaleDateString()}
                  </span>
                  {app.status === "ready_for_review" && (
                    <Button size="sm" variant="ghost" className="text-emerald-400">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  )}
                  {app.status === "in_progress" && (
                    <Button size="sm" variant="ghost" className="text-amber-400">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Continue
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-4">
            <Link
              href="/dashboard/organization"
              className="flex flex-col items-center p-6 bg-slate-900/50 rounded-xl hover:bg-slate-900 transition text-center"
            >
              <div className="bg-emerald-500/20 p-3 rounded-xl mb-3">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
              <span className="text-white font-medium">Complete Profile</span>
              <span className="text-slate-500 text-sm mt-1">Improve match accuracy</span>
            </Link>
            <Link
              href="/dashboard/documents"
              className="flex flex-col items-center p-6 bg-slate-900/50 rounded-xl hover:bg-slate-900 transition text-center"
            >
              <div className="bg-blue-500/20 p-3 rounded-xl mb-3">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <span className="text-white font-medium">Upload Pitch Deck</span>
              <span className="text-slate-500 text-sm mt-1">Auto-extract info</span>
            </Link>
            <Link
              href="/dashboard/grants"
              className="flex flex-col items-center p-6 bg-slate-900/50 rounded-xl hover:bg-slate-900 transition text-center"
            >
              <div className="bg-purple-500/20 p-3 rounded-xl mb-3">
                <Search className="h-6 w-6 text-purple-400" />
              </div>
              <span className="text-white font-medium">Discover Grants</span>
              <span className="text-slate-500 text-sm mt-1">Find new opportunities</span>
            </Link>
            <Link
              href="/dashboard/applications"
              className="flex flex-col items-center p-6 bg-slate-900/50 rounded-xl hover:bg-slate-900 transition text-center"
            >
              <div className="bg-amber-500/20 p-3 rounded-xl mb-3">
                <Clock className="h-6 w-6 text-amber-400" />
              </div>
              <span className="text-white font-medium">Track Deadlines</span>
              <span className="text-slate-500 text-sm mt-1">Never miss a date</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
