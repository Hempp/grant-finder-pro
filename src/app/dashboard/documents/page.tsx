"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Upload,
  FileText,
  File,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";

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
  pitch_deck: { label: "Pitch Deck", color: "text-purple-400" },
  financials: { label: "Financials", color: "text-emerald-400" },
  business_plan: { label: "Business Plan", color: "text-blue-400" },
  other: { label: "Other", color: "text-slate-400" },
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

  // Fetch documents on mount
  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res = await fetch("/api/documents");
        if (res.ok) {
          const data = await res.json();
          // Map API response to our Document interface
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
        // Read file content
        const content = await readFileContent(file);
        const docType = detectDocumentType(file.name);

        // Upload to API
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
          setDocuments((prev) => [...prev, {
            id: newDoc.id,
            name: newDoc.name,
            type: newDoc.type || docType,
            size: newDoc.size || file.size,
            uploadedAt: newDoc.createdAt || new Date().toISOString(),
            parsed: true,
            parsedData: "Document uploaded successfully",
          }]);
        }
      } catch (error) {
        console.error("Failed to upload file:", error);
      }
    }

    setUploading(false);
  };

  const readFileContent = (file: globalThis.File): Promise<string> => {
    return new Promise((resolve) => {
      // For text-based files, read content; otherwise just use filename as placeholder
      if (file.type.includes("text") || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string || "");
        reader.readAsText(file);
      } else {
        // For binary files, we'd need a file upload service
        // For now, store metadata about the file
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
      const res = await fetch(`/api/documents?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Documents</h1>
        <p className="text-slate-400 mt-1">
          Upload your pitch deck, financials, and other documents. We&apos;ll extract key information for grant applications.
        </p>
      </div>

      {/* Upload Area */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition ${
              isDragging
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-slate-600 hover:border-slate-500"
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 text-emerald-400 animate-spin mb-4" />
                <p className="text-white font-medium">Processing document...</p>
                <p className="text-slate-400 text-sm mt-1">Extracting information with AI</p>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <p className="text-white font-medium mb-2">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-slate-400 text-sm mb-4">
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
                <label htmlFor="file-upload" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer transition">
                  Select Files
                </label>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Types Guide */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">Pitch Deck</h3>
              <p className="text-slate-400 text-sm">Company overview, market, financials</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-emerald-500/20 p-3 rounded-lg">
              <File className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">Financial Statements</h3>
              <p className="text-slate-400 text-sm">Revenue, P&L, balance sheet</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">Business Plan</h3>
              <p className="text-slate-400 text-sm">Strategy, projections, team</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Uploaded Documents</h2>
          <span className="text-slate-400 text-sm">{documents.length} documents</span>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No documents uploaded yet</p>
              <p className="text-slate-500 text-sm">Upload your first document to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-800 p-3 rounded-lg">
                      <FileText className={`h-6 w-6 ${documentTypes[doc.type]?.color || "text-slate-400"}`} />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{doc.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="default">
                          {documentTypes[doc.type]?.label || "Document"}
                        </Badge>
                        <span className="text-slate-500 text-sm">
                          {formatFileSize(doc.size)}
                        </span>
                        <span className="text-slate-500 text-sm">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {doc.parsed ? (
                      <Badge variant="success">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Parsed
                      </Badge>
                    ) : (
                      <Badge variant="warning">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Processing
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDocument(doc.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
