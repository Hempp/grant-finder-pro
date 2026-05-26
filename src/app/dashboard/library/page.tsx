"use client";

import { useState, useEffect } from "react";
import { BookOpen, Plus, Globe, Loader2 } from "lucide-react";
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

  useEffect(() => {
    fetchLibrary();
  }, []);

  async function fetchLibrary() {
    try {
      const res = await fetch("/api/content-library");
      if (res.ok) {
        const data = await res.json();
        setBlocks(data.blocks);
        setStats(data.stats);
      }
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
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
    } catch {
      /* silently fail */
    } finally {
      setImporting(false);
    }
  }

  const grouped = blocks.reduce<Record<string, ContentBlock[]>>((acc, block) => {
    if (!acc[block.category]) acc[block.category] = [];
    acc[block.category].push(block);
    return acc;
  }, {});

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1
            className="font-semibold tracking-tight flex items-center gap-3"
            style={{ fontSize: "var(--text-display)", color: "var(--ink)", lineHeight: 1.1 }}
          >
            Your story, once and for all
            <BookOpen
              className="h-6 w-6"
              style={{ color: "var(--accent)" }}
              aria-hidden="true"
            />
          </h1>
          <p
            className="mt-2 max-w-2xl"
            style={{ fontSize: "var(--text-body)", color: "var(--ink-2)", lineHeight: 1.6 }}
          >
            Write the truth about your work in here — mission, team, impact, numbers. Smart Fill
            draws from this every time you apply, so each grant gets your real voice instead of a
            fresh template.
          </p>
          {!loading && stats && (
            <p
              className="mt-1 font-mono tabular-nums"
              style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
            >
              {stats.total} {stats.total === 1 ? "block" : "blocks"} · {stats.avgConfidence}% avg confidence
            </p>
          )}
        </div>
        <Button
          onClick={handleImportUrl}
          disabled={importing}
          style={{
            background: "var(--surface)",
            color: "var(--accent)",
            border: "1px solid var(--accent)",
            borderRadius: "var(--radius-control)",
          }}
        >
          {importing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          <span className="ml-1.5">Import from website</span>
        </Button>
      </header>

      {!loading && blocks.length === 0 && (
        <article
          className="p-12 text-center"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--rule)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card-soft)",
          }}
        >
          <BookOpen
            className="h-10 w-10 mx-auto mb-4"
            style={{ color: "var(--ink-2)" }}
            aria-hidden="true"
          />
          <h2
            className="font-semibold mb-2"
            style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
          >
            Nothing here yet — let&apos;s fix that
          </h2>
          <p
            className="mb-6 max-w-md mx-auto"
            style={{ fontSize: "var(--text-body-sm)", color: "var(--ink-2)", lineHeight: 1.6 }}
          >
            Drop in your mission statement, team bios, impact metrics, or just paste your About
            page. Every block you save is one less thing to write the next time you apply.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleImportUrl}
              disabled={importing}
              style={{
                background: "var(--surface)",
                color: "var(--ink)",
                border: "1px solid var(--rule)",
                borderRadius: "var(--radius-control)",
              }}
            >
              <Globe className="h-4 w-4" />
              <span className="ml-1.5">Import from website</span>
            </Button>
            <Button
              onClick={() => handleAddBlock("company_overview")}
              className="!text-white"
              style={{
                background: "var(--accent)",
                borderColor: "var(--accent)",
                borderRadius: "var(--radius-control)",
              }}
            >
              <Plus className="h-4 w-4" />
              <span className="ml-1.5">Add manually</span>
            </Button>
          </div>
        </article>
      )}

      {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
        const categoryBlocks = grouped[category];
        if (!categoryBlocks?.length) return null;
        return (
          <section key={category}>
            <div className="flex items-center justify-between mb-3">
              <h2
                className="font-semibold"
                style={{
                  fontSize: "var(--text-meta)",
                  color: "var(--ink-2)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </h2>
              <Button
                size="xs"
                onClick={() => handleAddBlock(category as ContentCategory)}
                style={{
                  background: "transparent",
                  color: "var(--accent)",
                  borderRadius: "var(--radius-control)",
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="ml-1">Add</span>
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
          </section>
        );
      })}
    </div>
  );
}
