"use client";

import { useState, useCallback } from "react";
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
  parsed: boolean;
  parsedData?: string;
}

// Mock data
const mockDocuments: Document[] = [
  {
    id: "1",
    name: "TechVenture_Pitch_Deck_2024.pdf",
    type: "pitch_deck",
    size: 2450000,
    uploadedAt: "2024-02-15",
    parsed: true,
    parsedData: "Company overview, market analysis, financial projections extracted",
  },
  {
    id: "2",
    name: "Financial_Statements_Q4_2023.xlsx",
    type: "financials",
    size: 156000,
    uploadedAt: "2024-02-10",
    parsed: true,
    parsedData: "Revenue, expenses, balance sheet data extracted",
  },
  {
    id: "3",
    name: "Business_Plan_v2.docx",
    type: "business_plan",
    size: 890000,
    uploadedAt: "2024-02-08",
    parsed: false,
  },
];

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
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const handleFiles = async (files: File[]) => {
    setUploading(true);

    // Simulate upload and parsing
    for (const file of files) {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newDoc: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: detectDocumentType(file.name),
        size: file.size,
        uploadedAt: new Date().toISOString().split("T")[0],
        parsed: false,
      };

      setDocuments((prev) => [...prev, newDoc]);

      // Simulate parsing
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === newDoc.id ? { ...d, parsed: true, parsedData: "Document data extracted" } : d
        )
      );
    }

    setUploading(false);
  };

  const detectDocumentType = (filename: string): string => {
    const lower = filename.toLowerCase();
    if (lower.includes("pitch") || lower.includes("deck")) return "pitch_deck";
    if (lower.includes("financial") || lower.includes("statement")) return "financials";
    if (lower.includes("business") || lower.includes("plan")) return "business_plan";
    return "other";
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

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
