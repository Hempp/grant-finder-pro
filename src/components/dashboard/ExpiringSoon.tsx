"use client";

import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui";

interface ExpiringGrant {
  id: string;
  title: string;
  funder: string;
  deadline: string;
  matchScore: number | null;
}

interface ExpiringSoonProps {
  grants: ExpiringGrant[];
}

function daysUntil(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function ExpiringSoon({ grants }: ExpiringSoonProps) {
  const expiring = grants
    .filter((g) => g.deadline && daysUntil(g.deadline) >= 0 && daysUntil(g.deadline) <= 14)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  if (expiring.length === 0) return null;

  return (
    <Card className="border-amber-500/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500/20 p-2 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Expiring Soon</h2>
        </div>
        <Link
          href="/dashboard/grants?sort=deadline"
          className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1 group"
        >
          View all <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {expiring.map((grant) => {
          const days = daysUntil(grant.deadline);
          const urgencyColor = days <= 3 ? "text-red-400" : days <= 7 ? "text-amber-400" : "text-slate-400";
          return (
            <Link
              key={grant.id}
              href={`/dashboard/grants/${grant.id}/apply`}
              className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-800/80 transition-colors duration-200 border border-transparent hover:border-slate-700 group"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-sm text-white font-medium leading-5 truncate group-hover:text-emerald-400 transition-colors duration-200">
                  {grant.title}
                </h3>
                <p className="text-xs text-slate-500 leading-4 truncate">{grant.funder}</p>
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ml-4 flex-shrink-0 ${urgencyColor}`}>
                <Clock className="h-3.5 w-3.5" />
                {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d left`}
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
