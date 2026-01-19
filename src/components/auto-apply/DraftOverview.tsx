"use client";

import { useState } from "react";
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Edit3,
  RefreshCw,
  ChevronRight,
  Sparkles,
  FileText,
  Target,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, Button, Badge } from "@/components/ui";
import { ApplicationSection, ResponseData, Suggestion } from "@/lib/auto-apply/types";

interface DraftOverviewProps {
  sections: ApplicationSection[];
  responses: Record<string, ResponseData>;
  completionScore: number;
  overallConfidence: number;
  missingRequirements: string[];
  suggestions: Suggestion[];
  funderType: string;
  onEditSection: (sectionId: string) => void;
  onRegenerateSection: (sectionId: string) => void;
}

export default function DraftOverview({
  sections,
  responses,
  completionScore,
  overallConfidence,
  missingRequirements,
  suggestions,
  funderType,
  onEditSection,
  onRegenerateSection,
}: DraftOverviewProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const getStatusIcon = (sectionId: string) => {
    const response = responses[sectionId];
    if (!response || !response.content) {
      return <AlertCircle className="h-5 w-5 text-slate-500" />;
    }
    if (response.needsUserInput) {
      return <AlertTriangle className="h-5 w-5 text-amber-400" />;
    }
    if (response.confidenceScore >= 70) {
      return <CheckCircle className="h-5 w-5 text-emerald-400" />;
    }
    return <AlertTriangle className="h-5 w-5 text-amber-400" />;
  };

  const getStatusBadge = (sectionId: string) => {
    const response = responses[sectionId];
    if (!response || !response.content) {
      return <Badge variant="default">Empty</Badge>;
    }
    if (response.needsUserInput) {
      return <Badge variant="warning">Needs Input</Badge>;
    }
    if (response.userEdited) {
      return <Badge variant="info">Edited</Badge>;
    }
    if (response.confidenceScore >= 70) {
      return <Badge variant="success">Ready</Badge>;
    }
    return <Badge variant="warning">Review</Badge>;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 70) return "text-emerald-400";
    if (score >= 40) return "text-amber-400";
    return "text-red-400";
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 p-2 rounded-lg">
                <Target className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{completionScore}%</p>
                <p className="text-slate-400 text-sm">Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Sparkles className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${getConfidenceColor(overallConfidence)}`}>
                  {overallConfidence}%
                </p>
                <p className="text-slate-400 text-sm">Confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{sections.length}</p>
                <p className="text-slate-400 text-sm">Sections</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${missingRequirements.length > 0 ? "bg-amber-500/20" : "bg-emerald-500/20"}`}>
                <AlertCircle className={`h-5 w-5 ${missingRequirements.length > 0 ? "text-amber-400" : "text-emerald-400"}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{missingRequirements.length}</p>
                <p className="text-slate-400 text-sm">Missing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funder Type Badge */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400">Writing style:</span>
        <Badge variant="info" className="capitalize">{funderType} tone</Badge>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Card className="border-amber-500/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-400" />
              <h3 className="text-white font-medium">Suggestions</h3>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {suggestions.slice(0, 5).map((suggestion, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm"
                >
                  <span
                    className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      suggestion.priority === "high"
                        ? "bg-red-400"
                        : suggestion.priority === "medium"
                        ? "bg-amber-400"
                        : "bg-slate-400"
                    }`}
                  />
                  <span className="text-slate-300">{suggestion.message}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Sections List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">Application Sections</h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-700">
            {sortedSections.map((section) => {
              const response = responses[section.id];
              const isExpanded = expandedSection === section.id;

              return (
                <div key={section.id} className="p-4 hover:bg-slate-800/50 transition">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                  >
                    {getStatusIcon(section.id)}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-white font-medium">{section.title}</h4>
                        {section.required && (
                          <span className="text-xs text-red-400">Required</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm">
                        <span className="text-slate-500 capitalize">{section.type}</span>
                        {section.wordLimit && (
                          <span className="text-slate-500">
                            {response?.wordCount || 0}/{section.wordLimit} words
                          </span>
                        )}
                        {response && (
                          <span className={`${getConfidenceColor(response.confidenceScore)}`}>
                            {response.confidenceScore}% confident
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(section.id)}
                      <ChevronRight
                        className={`h-5 w-5 text-slate-400 transition ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-4 pl-8 space-y-4">
                      {/* Instructions */}
                      {section.instructions && (
                        <div className="p-3 bg-slate-900/50 rounded-lg">
                          <p className="text-slate-400 text-sm">
                            <strong className="text-slate-300">Instructions:</strong>{" "}
                            {section.instructions}
                          </p>
                        </div>
                      )}

                      {/* Preview */}
                      {response?.content && (
                        <div className="p-3 bg-slate-900/50 rounded-lg">
                          <p className="text-slate-300 text-sm line-clamp-4">
                            {response.content}
                          </p>
                        </div>
                      )}

                      {/* User Input Prompt */}
                      {response?.needsUserInput && response.userInputPrompt && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                          <p className="text-amber-400 text-sm">
                            <strong>Input needed:</strong> {response.userInputPrompt}
                          </p>
                        </div>
                      )}

                      {/* Source References */}
                      {response?.sourceReferences && response.sourceReferences.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-slate-500 text-xs">Sources:</span>
                          {response.sourceReferences.map((ref) => (
                            <Badge key={ref} variant="default" className="text-xs">
                              {ref}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditSection(section.id);
                          }}
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRegenerateSection(section.id);
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
