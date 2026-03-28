"use client";

import { useMemo } from "react";

interface TimelineGrant {
  id: string;
  title: string;
  deadline: string | null;
}

interface DeadlineTimelineProps {
  grants: TimelineGrant[];
  onDotClick?: (grantId: string) => void;
}

function daysFromNow(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function DeadlineTimeline({ grants, onDotClick }: DeadlineTimelineProps) {
  const timelineGrants = useMemo(() => {
    return grants
      .filter((g) => g.deadline && daysFromNow(g.deadline) >= 0 && daysFromNow(g.deadline) <= 60)
      .map((g) => ({ ...g, days: daysFromNow(g.deadline!) }))
      .sort((a, b) => a.days - b.days);
  }, [grants]);

  if (timelineGrants.length === 0) return null;

  const markers = [
    { label: "Today", day: 0 },
    { label: "7d", day: 7 },
    { label: "14d", day: 14 },
    { label: "30d", day: 30 },
    { label: "60d", day: 60 },
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
      {/* Mobile: simple summary */}
      <div className="sm:hidden">
        <div className="flex items-center gap-4 text-sm">
          {timelineGrants.filter((g) => g.days <= 7).length > 0 && (
            <span className="text-red-400 font-medium">
              {timelineGrants.filter((g) => g.days <= 7).length} due this week
            </span>
          )}
          {timelineGrants.filter((g) => g.days > 7 && g.days <= 30).length > 0 && (
            <span className="text-amber-400 font-medium">
              {timelineGrants.filter((g) => g.days > 7 && g.days <= 30).length} this month
            </span>
          )}
          {timelineGrants.filter((g) => g.days > 30).length > 0 && (
            <span className="text-slate-400">
              {timelineGrants.filter((g) => g.days > 30).length} later
            </span>
          )}
        </div>
      </div>

      {/* Desktop: visual timeline */}
      <div className="hidden sm:block">
        <div className="relative h-12">
          {/* Track */}
          <div className="absolute top-5 left-0 right-0 h-px bg-slate-700" />

          {/* Markers */}
          {markers.map((marker) => (
            <div
              key={marker.day}
              className="absolute top-0 -translate-x-1/2"
              style={{ left: `${(marker.day / 60) * 100}%` }}
            >
              <p className="text-xs text-slate-600 leading-4 mb-1">{marker.label}</p>
              <div className="w-px h-3 bg-slate-700 mx-auto" />
            </div>
          ))}

          {/* Dots */}
          {timelineGrants.map((grant) => {
            const color =
              grant.days <= 7 ? "bg-red-400" : grant.days <= 30 ? "bg-amber-400" : "bg-slate-400";
            const position = Math.min((grant.days / 60) * 100, 100);
            return (
              <button
                key={grant.id}
                onClick={() => onDotClick?.(grant.id)}
                className={`absolute top-4 -translate-x-1/2 w-2.5 h-2.5 rounded-full ${color} hover:scale-150 transition-transform duration-200 cursor-pointer`}
                style={{ left: `${position}%` }}
                title={`${grant.title} — ${grant.days}d left`}
                aria-label={`${grant.title}, ${grant.days} days until deadline`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
