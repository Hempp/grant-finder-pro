"use client";

import { useState, useEffect } from "react";
import { BookOpen, Plus, Globe, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { ContentBlockCard } from "@/components/dashboard/ContentBlockCard";
import { CATEGORY_LABELS, ContentCategory } from "@/lib/content-library/types";

interface ContentBlock {
  id: string;
  category: string;
  title: string;
  content: string;
  source: string;
  confidence: number;
  lastVerified: string | null;
}

interface LibraryStats {
  total: number;
  byCategory: Record<string, number>;
  avgConfidence: number;
}

export default function LibraryPage() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  useEffect(() => { fetchLibrary(); }, []);

  async function fetchLibrary() {
    try {
      const res = await fetch("/api/content-library");
      if (res.ok) {
        const data = await res.json();
        setBlocks(data.blocks);
        setStats(data.stats);
      }
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }

  async function handleUpdate(id: string, data: { title: string; content: string }) {
    const res = await fetch(`/api/content-library/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) await fetchLibrary();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/content-library/${id}`, { method: "DELETE" });
    if (res.ok) setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  async function handleAddBlock(category: ContentCategory) {
    const res = await fetch("/api/content-library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, title: "New entry", content: "", source: "manual" }),
    });
    if (res.ok) await fetchLibrary();
  }

  async function handleImportUrl() {
    setImporting(true);
    try {
      const res = await fetch("/api/organizations/import-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) await fetchLibrary();
    } catch { /* silently fail */ }
    finally { setImporting(false); }
  }

  const grouped = blocks.reduce<Record<string, ContentBlock[]>>((acc, block) => {
    if (!acc[block.category]) acc[block.category] = [];
    acc[block.category].push(block);
    return acc;
  }, {});

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            Content Library
            <BookOpen className="h-6 w-6 text-emerald-400" />
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            {loading ? "Loading..." : stats ? `${stats.total} blocks | ${stats.avgConfidence}% avg confidence` : "Your company knowledge base"}
          </p>
        </div>
        <Button variant="outline" onClick={handleImportUrl} disabled={importing}>
          {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
          Import from Website
        </Button>
      </div>

      {!loading && blocks.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">Your Content Library is empty</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
              Add your company information here. The AI uses it to fill grant applications automatically.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleImportUrl} disabled={importing}>
                <Globe className="h-4 w-4" /> Import from Website
              </Button>
              <Button variant="primary" onClick={() => handleAddBlock("company_overview")}>
                <Plus className="h-4 w-4" /> Add Manually
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
        const categoryBlocks = grouped[category];
        if (!categoryBlocks?.length) return null;
        return (
          <div key={category}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">{label}</h2>
              <Button size="xs" variant="ghost" onClick={() => handleAddBlock(category as ContentCategory)}>
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {categoryBlocks.map((block) => (
                <ContentBlockCard
                  key={block.id}
                  id={block.id}
                  title={block.title}
                  content={block.content}
                  source={block.source}
                  confidence={block.confidence}
                  lastVerified={block.lastVerified}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
