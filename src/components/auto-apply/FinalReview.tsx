"use client";

import { useState } from "react";
import {
  CheckCircle,
  AlertTriangle,
  Download,
  Copy,
  Check,
  FileText,
  Printer,
  Send,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, Button, Badge } from "@/components/ui";
import { ApplicationSection, ResponseData } from "@/lib/auto-apply/types";

interface FinalReviewProps {
  sections: ApplicationSection[];
  responses: Record<string, ResponseData>;
  completionScore: number;
  overallConfidence: number;
  missingRequirements: string[];
  grantTitle: string;
  grantUrl: string | null;
  onBack: () => void;
  onSubmit: () => void;
}

export default function FinalReview({
  sections,
  responses,
  completionScore,
  overallConfidence,
  missingRequirements,
  grantTitle,
  grantUrl,
  onBack,
  onSubmit,
}: FinalReviewProps) {
  const [copied, setCopied] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  const isReady = completionScore >= 80 && missingRequirements.length === 0;

  const handleCopyAll = () => {
    const fullText = sortedSections
      .map((section) => {
        const response = responses[section.id];
        return `## ${section.title}\n\n${response?.content || "[No content]"}\n`;
      })
      .join("\n---\n\n");

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySection = (sectionId: string) => {
    const response = responses[sectionId];
    if (response?.content) {
      navigator.clipboard.writeText(response.content);
      setCopiedSection(sectionId);
      setTimeout(() => setCopiedSection(null), 2000);
    }
  };

  const handleExportMarkdown = () => {
    const content = sortedSections
      .map((section) => {
        const response = responses[section.id];
        return `## ${section.title}\n\n${response?.content || "[No content]"}\n`;
      })
      .join("\n---\n\n");

    const blob = new Blob([`# ${grantTitle}\n\n${content}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${grantTitle.toLowerCase().replace(/\s+/g, "-")}-application.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportText = () => {
    const content = sortedSections
      .map((section) => {
        const response = responses[section.id];
        return `${section.title.toUpperCase()}\n${"=".repeat(section.title.length)}\n\n${response?.content || "[No content]"}\n`;
      })
      .join("\n" + "-".repeat(50) + "\n\n");

    const blob = new Blob([`${grantTitle}\n${"=".repeat(grantTitle.length)}\n\n${content}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${grantTitle.toLowerCase().replace(/\s+/g, "-")}-application.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const content = sortedSections
      .map((section) => {
        const response = responses[section.id];
        return `
          <div style="margin-bottom: 2rem;">
            <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem;">${section.title}</h2>
            <p style="white-space: pre-wrap; line-height: 1.6;">${response?.content || "[No content]"}</p>
          </div>
        `;
      })
      .join("<hr style='margin: 1.5rem 0; border: 0; border-top: 1px solid #ccc;'>");

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${grantTitle} - Application</title>
            <style>
              body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
              h1 { font-size: 1.5rem; margin-bottom: 2rem; }
            </style>
          </head>
          <body>
            <h1>${grantTitle}</h1>
            ${content}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {isReady ? (
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-emerald-400 flex-shrink-0" />
            <div>
              <h3 className="text-white font-medium">Application Ready for Submission</h3>
              <p className="text-emerald-400/80 text-sm">
                All required sections are complete. Review the content below before submitting.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0" />
            <div>
              <h3 className="text-white font-medium">Application Incomplete</h3>
              <p className="text-amber-400/80 text-sm">
                Missing: {missingRequirements.join(", ")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Row */}
      <div className="flex items-center gap-4 flex-wrap">
        <Badge variant={completionScore >= 80 ? "success" : "warning"}>
          {completionScore}% Complete
        </Badge>
        <Badge variant={overallConfidence >= 70 ? "success" : "warning"}>
          {overallConfidence}% Confidence
        </Badge>
        <span className="text-slate-400 text-sm">{sections.length} sections</span>
      </div>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-white font-medium">Export Options</h3>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleCopyAll}>
              {copied ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? "Copied!" : "Copy All"}
            </Button>
            <Button variant="secondary" onClick={handleExportMarkdown}>
              <Download className="h-4 w-4 mr-2" />
              Export Markdown
            </Button>
            <Button variant="secondary" onClick={handleExportText}>
              <FileText className="h-4 w-4 mr-2" />
              Export Text
            </Button>
            <Button variant="secondary" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Full Application Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Full Application Preview</h3>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-700">
          {sortedSections.map((section) => {
            const response = responses[section.id];
            const hasContent = response?.content && response.content.trim();

            return (
              <div key={section.id} className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h4 className="text-white font-medium">{section.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {section.required && (
                        <span className="text-xs text-red-400">Required</span>
                      )}
                      {response && (
                        <span className="text-xs text-slate-500">
                          {response.wordCount} words
                        </span>
                      )}
                    </div>
                  </div>
                  {hasContent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopySection(section.id)}
                    >
                      {copiedSection === section.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>

                {hasContent ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {response.content}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-sm">No content provided</p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Submit Actions */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-white font-medium">Ready to Submit?</h4>
              <p className="text-slate-400 text-sm mt-1">
                Copy your application content and submit it through the grant portal.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button variant="ghost" onClick={onBack} className="flex-1 sm:flex-none">
                Back to Edit
              </Button>
              {grantUrl && (
                <Button
                  onClick={() => window.open(grantUrl, "_blank")}
                  className="flex-1 sm:flex-none"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Grant Portal
                </Button>
              )}
              <Button onClick={onSubmit} className="flex-1 sm:flex-none">
                <Send className="h-4 w-4 mr-2" />
                Mark as Submitted
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
