"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Wand2,
  Copy,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, Button, Badge, Textarea } from "@/components/ui";
import { ApplicationSection, ResponseData } from "@/lib/auto-apply/types";

interface SectionEditorProps {
  section: ApplicationSection;
  response: ResponseData;
  applicationId: string;
  onBack: () => void;
  onSave: (sectionId: string, content: string) => Promise<void>;
  onRegenerate: (sectionId: string, instructions?: string) => Promise<void>;
}

export default function SectionEditor({
  section,
  response,
  applicationId,
  onBack,
  onSave,
  onRegenerate,
}: SectionEditorProps) {
  const [content, setContent] = useState(response.content || "");
  const [customInstructions, setCustomInstructions] = useState("");
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes
  useEffect(() => {
    setHasChanges(content !== response.content);
  }, [content, response.content]);

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const characterCount = content.length;

  const isOverLimit = section.wordLimit
    ? wordCount > section.wordLimit
    : section.characterLimit
    ? characterCount > section.characterLimit
    : false;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(section.id, content);
      setHasChanges(false);
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await onRegenerate(section.id, customInstructions || undefined);
      setShowInstructions(false);
      setCustomInstructions("");
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 70) return "text-emerald-400";
    if (score >= 40) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-white">{section.title}</h2>
            <div className="flex items-center gap-3 mt-1 text-sm">
              <span className="text-slate-400 capitalize">{section.type}</span>
              {section.required && (
                <Badge variant="danger">Required</Badge>
              )}
              {response.aiGenerated && !response.userEdited && (
                <Badge variant="info">AI Generated</Badge>
              )}
              {response.userEdited && (
                <Badge variant="success">Edited</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            disabled={!content}
          >
            {copied ? (
              <Check className="h-4 w-4 mr-1" />
            ) : (
              <Copy className="h-4 w-4 mr-1" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Instructions */}
      {section.instructions && (
        <Card className="bg-slate-900/30">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Instructions</h4>
            <p className="text-slate-400 text-sm">{section.instructions}</p>

            {section.evaluationCriteria && section.evaluationCriteria.length > 0 && (
              <div className="mt-3">
                <h5 className="text-xs font-medium text-slate-400 mb-1">Evaluation Criteria:</h5>
                <ul className="list-disc list-inside text-xs text-slate-500 space-y-0.5">
                  {section.evaluationCriteria.map((criterion, idx) => (
                    <li key={idx}>{criterion}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Editor */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <span className={`text-sm ${isOverLimit ? "text-red-400" : "text-slate-400"}`}>
              {section.wordLimit
                ? `${wordCount}/${section.wordLimit} words`
                : section.characterLimit
                ? `${characterCount}/${section.characterLimit} characters`
                : `${wordCount} words`}
            </span>
            <span className={`text-sm ${getConfidenceColor(response.confidenceScore)}`}>
              {response.confidenceScore}% confidence
            </span>
          </div>

          {isOverLimit && (
            <Badge variant="danger">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Over limit
            </Badge>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={Math.max(10, Math.min(20, Math.ceil(wordCount / 15)))}
            className="font-mono text-sm"
            placeholder={`Write your ${section.title.toLowerCase()} here...`}
          />

          {/* Source References */}
          {response.sourceReferences && response.sourceReferences.length > 0 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 text-xs">Content based on:</span>
              {response.sourceReferences.map((ref) => (
                <Badge key={ref} variant="default" className="text-xs">
                  {ref}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Regenerate */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-400" />
            <h3 className="text-white font-medium">AI Regenerate</h3>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <p className="text-slate-400 text-sm">
            Not happy with the content? Have the AI regenerate it with custom instructions.
          </p>

          {showInstructions ? (
            <div className="space-y-3">
              <Textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                rows={3}
                placeholder="Add specific guidance for the AI... (e.g., 'Focus more on our environmental impact' or 'Include our recent partnership with XYZ')"
              />
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                >
                  {regenerating ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-1" />
                  )}
                  Regenerate
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowInstructions(false);
                    setCustomInstructions("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowInstructions(true)}
              >
                <Wand2 className="h-4 w-4 mr-1" />
                Regenerate with Instructions
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleRegenerate()}
                disabled={regenerating}
              >
                {regenerating ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Quick Regenerate
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      {response.needsUserInput && response.userInputPrompt && (
        <Card className="border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-medium mb-1">Input Needed</h4>
                <p className="text-slate-400 text-sm">{response.userInputPrompt}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="fixed bottom-4 right-4 bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <span className="text-white text-sm">You have unsaved changes</span>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
