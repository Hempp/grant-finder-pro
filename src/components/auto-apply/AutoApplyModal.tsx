"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Loader2,
  CheckCircle,
  AlertTriangle,
  FileText,
  Building2,
  Clock,
  Zap,
  Lock,
} from "lucide-react";
import { Modal, ModalContent, ModalFooter, Button, Badge } from "@/components/ui";

interface Grant {
  id: string;
  title: string;
  funder: string;
  amount: string | null;
  deadline: Date | null;
}

interface SubscriptionInfo {
  canUseAutoApply: boolean;
  autoApplyRemaining: number | "unlimited";
  plan: string;
}

interface AutoApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  grant: Grant;
  hasProfile: boolean;
  hasDocuments: boolean;
  applicationId?: string;
  onGenerate: (applicationId: string) => void;
  subscription?: SubscriptionInfo;
}

type Step = "ready" | "generating" | "complete" | "error";

export default function AutoApplyModal({
  isOpen,
  onClose,
  grant,
  hasProfile,
  hasDocuments,
  applicationId,
  onGenerate,
  subscription,
}: AutoApplyModalProps) {
  const [step, setStep] = useState<Step>("ready");

  // Check if user can use Auto-Apply
  const canUseAutoApply = subscription?.canUseAutoApply ?? false;
  const autoApplyRemaining = subscription?.autoApplyRemaining ?? 0;
  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [newApplicationId, setNewApplicationId] = useState<string | null>(null);

  const handleGenerate = async () => {
    setStep("generating");
    setProgress(0);
    setError(null);

    try {
      let appId = applicationId;

      // Step 1: Create application if needed
      if (!appId) {
        setCurrentAction("Creating application...");
        setProgress(10);

        const createRes = await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grantId: grant.id }),
        });

        if (!createRes.ok) {
          throw new Error("Failed to create application");
        }

        const created = await createRes.json();
        appId = created.id as string;
        setNewApplicationId(appId);
      }

      // Step 2: Generate the application
      setCurrentAction("Analyzing grant requirements...");
      setProgress(25);

      await new Promise((resolve) => setTimeout(resolve, 500));
      setCurrentAction("Gathering your profile data...");
      setProgress(40);

      await new Promise((resolve) => setTimeout(resolve, 500));
      setCurrentAction("AI is writing your application...");
      setProgress(60);

      const generateRes = await fetch(`/api/applications/${appId}/auto-apply`, {
        method: "POST",
      });

      if (!generateRes.ok) {
        const errData = await generateRes.json();
        // Handle subscription-specific errors
        if (errData.code === "UPGRADE_REQUIRED" || errData.code === "LIMIT_REACHED") {
          setError(errData.error);
          setStep("error");
          return;
        }
        throw new Error(errData.error || "Failed to generate application");
      }

      setCurrentAction("Finalizing draft...");
      setProgress(90);

      await new Promise((resolve) => setTimeout(resolve, 500));
      setProgress(100);
      setStep("complete");

      if (appId) {
        setNewApplicationId(appId);
      }
    } catch (err) {
      console.error("Auto-apply error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setStep("error");
    }
  };

  const handleViewDraft = () => {
    const appId = newApplicationId || applicationId;
    if (appId) {
      onGenerate(appId);
    }
    onClose();
  };

  const handleRetry = () => {
    setStep("ready");
    setError(null);
    setProgress(0);
  };

  const renderContent = () => {
    switch (step) {
      case "ready":
        // Show upgrade prompt if user can't use Auto-Apply
        if (!canUseAutoApply) {
          return (
            <>
              <ModalContent>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Upgrade to Unlock Auto-Apply
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Auto-Apply uses AI to generate complete grant applications in seconds.
                    Upgrade to Pro or Teams to access this powerful feature.
                  </p>
                </div>

                {/* Feature Highlights */}
                <div className="bg-slate-900/50 rounded-lg p-4 mb-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span className="text-slate-300">AI-generated narratives tailored to each grant</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span className="text-slate-300">Auto-fills based on your profile & documents</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span className="text-slate-300">Save hours of writing time per application</span>
                  </div>
                </div>

                {/* Plan Comparison */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                    <p className="text-emerald-400 font-semibold">Pro</p>
                    <p className="text-slate-400 text-xs">5 drafts/month</p>
                    <p className="text-white font-medium mt-1">$49/mo</p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center">
                    <p className="text-cyan-400 font-semibold">Teams</p>
                    <p className="text-slate-400 text-xs">Unlimited drafts</p>
                    <p className="text-white font-medium mt-1">$149/mo</p>
                  </div>
                </div>
              </ModalContent>

              <ModalFooter>
                <Button variant="ghost" onClick={onClose}>
                  Maybe Later
                </Button>
                <Link href="/pricing">
                  <Button>
                    <Zap className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </Button>
                </Link>
              </ModalFooter>
            </>
          );
        }

        return (
          <>
            <ModalContent>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Auto-Apply with AI
                </h3>
                <p className="text-slate-400 text-sm">
                  Our AI will analyze the grant requirements and generate a complete
                  application draft based on your profile and documents.
                </p>
                {autoApplyRemaining !== "unlimited" && (
                  <p className="text-emerald-400 text-xs mt-2">
                    {autoApplyRemaining} draft{autoApplyRemaining !== 1 ? "s" : ""} remaining this month
                  </p>
                )}
              </div>

              {/* Grant Info */}
              <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
                <h4 className="text-white font-medium mb-2">{grant.title}</h4>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="text-slate-400">{grant.funder}</span>
                  {grant.amount && (
                    <span className="text-emerald-400 font-medium">{grant.amount}</span>
                  )}
                  {grant.deadline && (
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(grant.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Readiness Checklist */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-300">Pre-flight Check</h4>

                <div className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg">
                  {hasProfile ? (
                    <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">Organization Profile</p>
                    <p className="text-slate-500 text-xs truncate">
                      {hasProfile
                        ? "Profile complete - ready to use"
                        : "Complete your profile for better results"}
                    </p>
                  </div>
                  <Building2 className="h-4 w-4 text-slate-500 flex-shrink-0" />
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg">
                  {hasDocuments ? (
                    <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">Supporting Documents</p>
                    <p className="text-slate-500 text-xs truncate">
                      {hasDocuments
                        ? "Documents available for context"
                        : "Upload documents for richer content"}
                    </p>
                  </div>
                  <FileText className="h-4 w-4 text-slate-500 flex-shrink-0" />
                </div>
              </div>

              {!hasProfile && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-amber-400 text-sm">
                    <strong>Tip:</strong> Complete your organization profile first for
                    much better AI-generated content.
                  </p>
                </div>
              )}
            </ModalContent>

            <ModalFooter>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleGenerate}>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Application
              </Button>
            </ModalFooter>
          </>
        );

      case "generating":
        return (
          <ModalContent className="text-center py-12">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Generating Your Application
            </h3>
            <p className="text-slate-400 mb-6">{currentAction}</p>

            {/* Progress Bar */}
            <div className="max-w-xs mx-auto">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-slate-500 text-sm mt-2">{progress}% complete</p>
            </div>

            <p className="text-slate-500 text-sm mt-8">
              This may take a minute. Please don&apos;t close this window.
            </p>
          </ModalContent>
        );

      case "complete":
        return (
          <>
            <ModalContent className="text-center">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Application Draft Ready!
              </h3>
              <p className="text-slate-400 mb-6">
                Your AI-generated application is ready for review. You can edit any
                section and regenerate content as needed.
              </p>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center justify-center gap-4 text-sm">
                  <Badge variant="success">Draft Created</Badge>
                  <span className="text-slate-400">Ready for review</span>
                </div>
              </div>
            </ModalContent>

            <ModalFooter>
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleViewDraft}>
                <FileText className="h-4 w-4 mr-2" />
                View & Edit Draft
              </Button>
            </ModalFooter>
          </>
        );

      case "error":
        return (
          <>
            <ModalContent className="text-center">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-10 w-10 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Generation Failed
              </h3>
              <p className="text-slate-400 mb-4">
                {error || "Something went wrong while generating your application."}
              </p>
              <p className="text-slate-500 text-sm">
                Please try again or contact support if the issue persists.
              </p>
            </ModalContent>

            <ModalFooter>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={handleRetry}>
                Try Again
              </Button>
            </ModalFooter>
          </>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={step === "generating" ? () => {} : onClose}
      title={step === "ready" ? "Auto-Apply" : undefined}
      size="md"
    >
      {renderContent()}
    </Modal>
  );
}
