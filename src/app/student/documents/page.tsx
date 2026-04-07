"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Upload,
  FileText,
  File,
  Trash2,
  Loader2,
  AlertCircle,
  GraduationCap,
  ScrollText,
  Award,
  Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { Button, Badge } from "@/components/ui";

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  parsed: boolean;
}

const documentTypes: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  transcript: { label: "Transcript", icon: GraduationCap, color: "text-blue-400" },
  recommendation_letter: { label: "Recommendation Letter", icon: ScrollText, color: "text-purple-400" },
  resume: { label: "Resume / CV", icon: Briefcase, color: "text-emerald-400" },
  financial_aid: { label: "Financial Aid Document", icon: FileText, color: "text-amber-400" },
  essay_draft: { label: "Essay Draft", icon: FileText, color: "text-cyan-400" },
  certificate: { label: "Certificate / Award", icon: Award, color: "text-pink-400" },
  other: { label: "Other", icon: File, color: "text-slate-400" },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ".pdf,.doc,.docx,.png,.jpg,.jpeg";

export default function StudentDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("other");

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res = await fetch("/api/documents");
        if (res.ok) {
          const data = await res.json();
          setDocuments(
            data.map((d: Record<string, unknown>) => ({
              id: d.id,
              name: d.name,
              type: d.type || "other",
              size: d.size || 0,
              uploadedAt: d.createdAt || d.uploadedAt,
              parsed: true,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch documents:", err);
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

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) uploadFiles(files);
    },
    [selectedType]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) uploadFiles(files);
    e.target.value = "";
  };

  async function uploadFiles(files: File[]) {
    setError(null);

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }
    }

    setUploading(true);
    try {
      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) continue;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", selectedType);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setDocuments((prev) => [
            {
              id: data.id || data.document?.id || crypto.randomUUID(),
              name: file.name,
              type: selectedType,
              size: file.size,
              uploadedAt: new Date().toISOString(),
              parsed: false,
            },
            ...prev,
          ]);
        } else {
          const errData = await res.json().catch(() => ({}));
          setError(errData.error || `Failed to upload ${file.name}`);
        }
      }
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      }
    } catch {
      setError("Failed to delete document.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Upload className="h-6 w-6 text-emerald-400" />
          Documents
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Upload transcripts, letters of recommendation, and other documents to strengthen your applications.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300 text-xs">Dismiss</button>
        </div>
      )}

      {/* Document Type Selector */}
      <div className="mb-4">
        <label className="text-xs text-slate-400 font-medium mb-2 block">Upload as:</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(documentTypes).map(([key, { label, icon: Icon, color }]) => (
            <button
              key={key}
              onClick={() => setSelectedType(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedType === key
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-slate-800 text-slate-400 border border-transparent hover:text-white"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${selectedType === key ? "text-emerald-400" : color}`} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Zone */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative p-8 text-center border-2 border-dashed rounded-2xl transition-all duration-200 ${
              isDragging
                ? "border-emerald-400 bg-emerald-500/5"
                : "border-slate-700 hover:border-slate-600"
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-10 w-10 text-emerald-400 animate-spin mb-3" />
                <p className="text-white font-medium">Uploading...</p>
              </div>
            ) : (
              <>
                <Upload className={`h-10 w-10 mx-auto mb-3 ${isDragging ? "text-emerald-400" : "text-slate-600"}`} />
                <p className="text-white font-medium mb-1">
                  {isDragging ? "Drop files here" : "Drag & drop files here"}
                </p>
                <p className="text-slate-500 text-sm mb-4">
                  PDF, DOC, DOCX, PNG, JPG — max 10MB
                </p>
                <label className="cursor-pointer">
                  <Button variant="secondary" size="sm" className="pointer-events-none">
                    Browse Files
                  </Button>
                  <input
                    type="file"
                    className="hidden"
                    accept={ACCEPTED_TYPES}
                    multiple
                    onChange={handleFileSelect}
                  />
                </label>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      {documents.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Documents Yet</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Upload your transcripts, letters of recommendation, and other documents.
            These help verify your scholarship applications.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Your Documents ({documents.length})
            </h2>
          </div>
          {documents.map((doc) => {
            const typeInfo = documentTypes[doc.type] || documentTypes.other;
            const Icon = typeInfo.icon;
            return (
              <Card key={doc.id} variant="interactive" className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-slate-800 ${typeInfo.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="default">{typeInfo.label}</Badge>
                      <span className="text-xs text-slate-500">{formatFileSize(doc.size)}</span>
                      <span className="text-xs text-slate-600">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-slate-500 hover:text-red-400 transition flex-shrink-0"
                    aria-label={`Delete ${doc.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
