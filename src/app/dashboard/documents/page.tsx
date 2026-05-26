"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Upload,
  FileText,
  File,
  Trash2,
  CheckCircle,
  Loader2,
  Download,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui";

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  createdAt?: string;
  parsed: boolean;
  parsedData?: string;
  content?: string;
}

const documentTypes: Record<string, { label: string; color: string }> = {
  pitch_deck: { label: "Pitch Deck", color: "var(--accent)" },
  financials: { label: "Financials", color: "var(--success)" },
  business_plan: { label: "Business Plan", color: "var(--accent)" },
  other: { label: "Other", color: "var(--ink-2)" },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res = await fetch("/api/documents");
        if (res.ok) {
          const data = await res.json();
          const docs = data.map((d: Record<string, unknown>) => ({
            id: d.id,
            name: d.name,
            type: d.type || "other",
            size: d.size || 0,
            uploadedAt: d.createdAt || d.uploadedAt,
            parsed: true,
            parsedData: d.content,
          }));
          setDocuments(docs);
        }
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDocuments();
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: globalThis.File[]) => {
    setUploading(true);
    for (const file of files) {
      try {
        const content = await readFileContent(file);
        const docType = detectDocumentType(file.name);
        const res = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            type: docType,
            size: file.size,
            content: content,
          }),
        });
        if (res.ok) {
          const newDoc = await res.json();
          setDocuments((prev) => [
            ...prev,
            {
              id: newDoc.id,
              name: newDoc.name,
              type: newDoc.type || docType,
              size: newDoc.size || file.size,
              uploadedAt: newDoc.createdAt || new Date().toISOString(),
              parsed: true,
              parsedData: "Document uploaded successfully",
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to upload file:", error);
      }
    }
    setUploading(false);
  };

  const readFileContent = (file: globalThis.File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.includes("text") || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || "");
        reader.readAsText(file);
      } else {
        resolve(`[Binary file: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}]`);
      }
    });
  };

  const detectDocumentType = (filename: string): string => {
    const lower = filename.toLowerCase();
    if (lower.includes("pitch") || lower.includes("deck")) return "pitch_deck";
    if (lower.includes("financial") || lower.includes("statement")) return "financials";
    if (lower.includes("business") || lower.includes("plan")) return "business_plan";
    return "other";
  };

  const deleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--rule)",
    borderRadius: "var(--radius-card)",
    boxShadow: "var(--shadow-card-soft)",
  };

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6">
      <header>
        <h1
          className="font-semibold tracking-tight"
          style={{ fontSize: "var(--text-display)", color: "var(--ink)", lineHeight: 1.1 }}
        >
          Documents
        </h1>
        <p
          className="mt-2 max-w-2xl"
          style={{ fontSize: "var(--text-body)", color: "var(--ink-2)", lineHeight: 1.55 }}
        >
          Upload your pitch deck, financials, and other documents. We extract key information for grant applications and use them to learn your voice for Smart Fill.
        </p>
      </header>

      {/* Upload Area */}
      <article className="p-6" style={cardStyle}>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="p-10 text-center transition"
          style={{
            background: isDragging ? "var(--accent-soft)" : "var(--bg-soft)",
            border: `2px dashed ${isDragging ? "var(--accent)" : "var(--rule)"}`,
            borderRadius: "var(--radius-card)",
          }}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2
                className="h-10 w-10 animate-spin mb-4"
                style={{ color: "var(--accent)" }}
                aria-hidden="true"
              />
              <p
                className="font-semibold"
                style={{ fontSize: "var(--text-body)", color: "var(--ink)" }}
              >
                Processing document…
              </p>
              <p
                className="mt-1"
                style={{ fontSize: "var(--text-body-sm)", color: "var(--ink-2)" }}
              >
                Extracting information with AI
              </p>
            </div>
          ) : (
            <>
              <Upload
                className="h-10 w-10 mx-auto mb-4"
                style={{ color: "var(--ink-2)" }}
                aria-hidden="true"
              />
              <p
                className="font-semibold mb-1"
                style={{ fontSize: "var(--text-body)", color: "var(--ink)" }}
              >
                Drag and drop files here, or click to browse
              </p>
              <p
                className="mb-5"
                style={{ fontSize: "var(--text-body-sm)", color: "var(--ink-2)" }}
              >
                Supports PDF, DOCX, XLSX, PPTX up to 50MB
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.xlsx,.pptx,.doc,.xls,.ppt"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 px-4 py-2 font-medium cursor-pointer transition !text-white"
                style={{
                  background: "var(--accent)",
                  fontSize: "var(--text-body-sm)",
                  borderRadius: "var(--radius-control)",
                }}
              >
                Select files
              </label>
            </>
          )}
        </div>
      </article>

      {/* Document Type Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: FileText, label: "Pitch Deck", body: "Company overview, market, financials" },
          { icon: File, label: "Financial Statements", body: "Revenue, P&L, balance sheet" },
          { icon: FileText, label: "Business Plan", body: "Strategy, projections, team" },
        ].map((t) => (
          <article key={t.label} className="p-4 flex items-center gap-3" style={cardStyle}>
            <div
              className="p-2.5 inline-flex flex-shrink-0"
              style={{
                background: "var(--accent-soft)",
                color: "var(--accent)",
                borderRadius: "var(--radius-control)",
              }}
            >
              <t.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3
                className="font-medium"
                style={{ fontSize: "var(--text-body-sm)", color: "var(--ink)" }}
              >
                {t.label}
              </h3>
              <p
                className="truncate"
                style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
              >
                {t.body}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* Documents List */}
      <article style={cardStyle}>
        <header
          className="flex items-center justify-between p-5"
          style={{ borderBottom: "1px solid var(--rule)" }}
        >
          <h2
            className="font-semibold"
            style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
          >
            Uploaded documents
          </h2>
          <span style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}>
            {documents.length} {documents.length === 1 ? "document" : "documents"}
          </span>
        </header>
        <div className="p-5">
          {documents.length === 0 ? (
            <div className="text-center py-10">
              <FileText
                className="h-10 w-10 mx-auto mb-4"
                style={{ color: "var(--ink-2)" }}
                aria-hidden="true"
              />
              <p
                className="mb-1"
                style={{ fontSize: "var(--text-body)", color: "var(--ink-2)" }}
              >
                Upload your first document to get started
              </p>
              <p
                className="max-w-md mx-auto"
                style={{ fontSize: "var(--text-body-sm)", color: "var(--ink-2)", opacity: 0.8 }}
              >
                We extract your mission, team, and impact so Smart Fill draws from real content, not templates.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 transition gap-3"
                  style={{
                    background: "var(--bg-soft)",
                    borderRadius: "var(--radius-control)",
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="p-2.5 flex-shrink-0"
                      style={{
                        background: "var(--surface)",
                        color: documentTypes[doc.type]?.color || "var(--ink-2)",
                        borderRadius: "var(--radius-control)",
                      }}
                    >
                      <FileText className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className="font-medium truncate"
                        style={{ fontSize: "var(--text-body-sm)", color: "var(--ink)" }}
                      >
                        {doc.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span
                          className="px-2 py-0.5 font-medium"
                          style={{
                            background: "var(--accent-soft)",
                            color: "var(--accent)",
                            fontSize: "var(--text-micro)",
                            borderRadius: 999,
                          }}
                        >
                          {documentTypes[doc.type]?.label || "Document"}
                        </span>
                        <span style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}>
                          {formatFileSize(doc.size)}
                        </span>
                        <span
                          className="hidden xs:inline"
                          style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
                        >
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    {doc.parsed ? (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 font-medium"
                        style={{
                          background: "var(--success-soft)",
                          color: "var(--success)",
                          fontSize: "var(--text-micro)",
                          borderRadius: 999,
                        }}
                      >
                        <CheckCircle className="h-3 w-3" aria-hidden="true" />
                        <span className="hidden xs:inline">Parsed</span>
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 font-medium"
                        style={{
                          background: "var(--warn-soft)",
                          color: "var(--warn)",
                          fontSize: "var(--text-micro)",
                          borderRadius: 999,
                        }}
                      >
                        <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                        <span className="hidden xs:inline">Processing</span>
                      </span>
                    )}
                    <Button
                      size="sm"
                      style={{
                        background: "transparent",
                        color: "var(--ink-2)",
                        borderRadius: "var(--radius-control)",
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      style={{
                        background: "transparent",
                        color: "var(--ink-2)",
                        borderRadius: "var(--radius-control)",
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => deleteDocument(doc.id)}
                      style={{
                        background: "transparent",
                        color: "var(--warn)",
                        borderRadius: "var(--radius-control)",
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
