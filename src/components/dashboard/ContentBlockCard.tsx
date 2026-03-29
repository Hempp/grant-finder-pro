"use client";

import { useState } from "react";
import { Edit3, Trash2, Check, X, Globe, FileText, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";

interface ContentBlockCardProps {
  id: string;
  title: string;
  content: string;
  source: string;
  confidence: number;
  lastVerified: string | null;
  onUpdate: (id: string, data: { title: string; content: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const sourceIcons: Record<string, typeof Globe> = {
  website: Globe,
  document: FileText,
  profile: User,
  application: Sparkles,
  manual: Edit3,
};

const sourceBadgeColors: Record<string, "default" | "success" | "warning" | "info"> = {
  manual: "success",
  profile: "success",
  application: "info",
  document: "warning",
  website: "default",
};

export function ContentBlockCard({
  id, title, content, source, confidence, lastVerified, onUpdate, onDelete,
}: ContentBlockCardProps) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editContent, setEditContent] = useState(content);
  const [saving, setSaving] = useState(false);

  const SourceIcon = sourceIcons[source] || Edit3;

  async function handleSave() {
    setSaving(true);
    await onUpdate(id, { title: editTitle, content: editContent });
    setEditing(false);
    setSaving(false);
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors duration-200">
      {editing ? (
        <div className="flex flex-col gap-3">
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={() => { setEditTitle(title); setEditContent(content); setEditing(false); }}>
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={handleSave} disabled={saving}>
              <Check className="h-4 w-4" /> Save
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white leading-5">{title}</h4>
              <p className="text-xs text-slate-400 leading-4 mt-1 line-clamp-3">{content}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button size="xs" variant="ghost" onClick={() => setEditing(true)}>
                <Edit3 className="h-3.5 w-3.5" />
              </Button>
              <Button size="xs" variant="ghost" onClick={() => onDelete(id)} className="text-red-400 hover:text-red-300">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant={sourceBadgeColors[source] || "default"}>
              <SourceIcon className="h-3 w-3" /> {source}
            </Badge>
            <span className="text-xs text-slate-600">{confidence}%</span>
          </div>
        </>
      )}
    </div>
  );
}
