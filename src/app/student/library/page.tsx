"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Loader2,
  Sparkles,
  FileText,
  Award,
  Heart,
  Target,
  Users,
  GraduationCap,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import { Button, Badge } from "@/components/ui";
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

// Student-relevant categories
const STUDENT_CATEGORIES: ContentCategory[] = [
  "personal_statement",
  "activities",
  "work_experience",
  "community_service",
  "awards_honors",
  "career_goals",
  "challenges_overcome",
  "leadership",
  "research_experience",
  "why_this_field",
  "financial_need_statement",
  "diversity_statement",
];

const CATEGORY_ICONS: Record<string, typeof FileText> = {
  personal_statement: FileText,
  activities: Users,
  work_experience: GraduationCap,
  community_service: Heart,
  awards_honors: Award,
  career_goals: Target,
  challenges_overcome: Sparkles,
  leadership: Users,
  research_experience: Search,
  why_this_field: BookOpen,
  financial_need_statement: FileText,
  diversity_statement: Heart,
};

const QUICK_ADD_ITEMS: { category: ContentCategory; title: string; placeholder: string }[] = [
  { category: "personal_statement", title: "Personal Statement", placeholder: "Write about who you are, your values, and what drives you..." },
  { category: "activities", title: "Activities & Clubs", placeholder: "Describe your most meaningful extracurricular activity..." },
  { category: "career_goals", title: "Career Goals", placeholder: "What do you want to accomplish in your career and why..." },
];

export default function StudentLibraryPage() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

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

  async function handleAddBlock(category: ContentCategory, title?: string) {
    const res = await fetch("/api/content-library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        title: title || "New entry",
        content: "",
        source: "manual",
      }),
    });
    if (res.ok) await fetchLibrary();
  }

  // Filter to student categories only
  const studentBlocks = blocks.filter((b) =>
    STUDENT_CATEGORIES.includes(b.category as ContentCategory)
  );

  const filteredBlocks = filter === "all"
    ? studentBlocks
    : studentBlocks.filter((b) => b.category === filter);

  // Group by category
  const grouped = filteredBlocks.reduce<Record<string, ContentBlock[]>>((acc, block) => {
    if (!acc[block.category]) acc[block.category] = [];
    acc[block.category].push(block);
    return acc;
  }, {});

  const categoriesWithBlocks = Object.keys(grouped);
  const studentStats = {
    total: studentBlocks.length,
    categories: new Set(studentBlocks.map((b) => b.category)).size,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-emerald-400" />
            Content Library
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Reusable content for scholarship essays. Smart Fill pulls from here automatically.
          </p>
        </div>
        {studentStats.total > 0 && (
          <div className="flex items-center gap-3">
            <Badge variant="success">{studentStats.total} blocks</Badge>
            <Badge variant="info">{studentStats.categories} categories</Badge>
          </div>
        )}
      </div>

      {/* Quick Add */}
      {studentBlocks.length < 3 && (
        <Card className="mb-6 border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">Quick Start — add your core content</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {QUICK_ADD_ITEMS.map((item) => (
                <button
                  key={item.category}
                  onClick={() => handleAddBlock(item.category, item.title)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-emerald-500/30 hover:bg-slate-800/60 transition text-left"
                >
                  <Plus className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{item.title}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      {studentBlocks.length > 0 && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              filter === "all" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            All ({studentBlocks.length})
          </button>
          {STUDENT_CATEGORIES.filter((c) => studentBlocks.some((b) => b.category === c)).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                filter === cat ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {CATEGORY_LABELS[cat]} ({studentBlocks.filter((b) => b.category === cat).length})
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {studentBlocks.length === 0 && (
        <Card className="p-8 sm:p-12 text-center">
          <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Build Your Content Library</h2>
          <p className="text-slate-400 max-w-md mx-auto mb-6">
            Add your personal statement, activities, achievements, and career goals. Smart Fill will use these to personalize every scholarship application automatically.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {QUICK_ADD_ITEMS.map((item) => (
              <Button key={item.category} variant="secondary" onClick={() => handleAddBlock(item.category, item.title)}>
                <Plus className="h-4 w-4" /> {item.title}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Content Blocks by Category */}
      {categoriesWithBlocks.map((category) => {
        const Icon = CATEGORY_ICONS[category] || FileText;
        return (
          <div key={category} className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  {CATEGORY_LABELS[category as ContentCategory] || category}
                </h2>
                <Badge variant="default">{grouped[category].length}</Badge>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => handleAddBlock(category as ContentCategory)}
              >
                <Plus className="h-3 w-3" /> Add
              </Button>
            </div>
            <div className="space-y-3">
              {grouped[category].map((block) => (
                <ContentBlockCard
                  key={block.id}
                  id={block.id}
                  title={block.title}
                  content={block.content}
                  source={block.source}
                  confidence={block.confidence}
                  lastVerified={block.lastVerified}
                  onUpdate={(id, data) => handleUpdate(id, data)}
                  onDelete={(id) => handleDelete(id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Add New Category */}
      {studentBlocks.length > 0 && (
        <Card className="p-4">
          <p className="text-sm text-slate-400 mb-3">Add content to a new category:</p>
          <div className="flex flex-wrap gap-2">
            {STUDENT_CATEGORIES.filter((c) => !categoriesWithBlocks.includes(c)).map((cat) => (
              <Button
                key={cat}
                variant="ghost"
                size="xs"
                onClick={() => handleAddBlock(cat)}
              >
                <Plus className="h-3 w-3" /> {CATEGORY_LABELS[cat]}
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
