"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Clock, Sparkles, FileText, AlertCircle } from "lucide-react";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
}

const typeIcons: Record<string, { icon: typeof Bell; color: string }> = {
  deadline_approaching: { icon: Clock, color: "text-red-400" },
  new_match: { icon: Sparkles, color: "text-emerald-400" },
  status_change: { icon: FileText, color: "text-blue-400" },
  trial_expiring: { icon: AlertCircle, color: "text-amber-400" },
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications/unread");
      if (res.ok) {
        const data = await res.json();
        setCount(data.count);
        setItems(data.items);
      }
    } catch {
      // silently fail
    }
  }

  async function markAllRead() {
    await fetch("/api/notifications/unread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_all_read" }),
    });
    setCount(0);
    setItems([]);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 min-w-11 min-h-11 flex items-center justify-center text-slate-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-slate-800/50"
        aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full animate-glow-pulse" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl shadow-black/30 z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Notifications</h3>
            {count > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
              >
                Mark all read
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-8 w-8 text-slate-700 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No new notifications</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {items.map((item) => {
                const typeInfo = typeIcons[item.type] || typeIcons.new_match;
                const Icon = typeInfo.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-4 hover:bg-slate-800/50 transition-colors duration-200 border-b border-slate-800/50 last:border-0"
                  >
                    <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${typeInfo.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium leading-5">{item.title}</p>
                      <p className="text-xs text-slate-400 leading-4 mt-1 truncate">{item.message}</p>
                      <p className="text-xs text-slate-600 leading-4 mt-1">{timeAgo(item.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="p-3 border-t border-slate-800">
            <Link
              href="/dashboard/settings"
              className="block text-center text-xs text-slate-500 hover:text-slate-300 transition-colors duration-200"
              onClick={() => setOpen(false)}
            >
              Notification settings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
