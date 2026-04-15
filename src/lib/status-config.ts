import {
  FileText,
  AlertCircle,
  CheckCircle,
  Award,
  XCircle,
  Clock,
  type LucideIcon,
} from "lucide-react";

/**
 * Canonical status metadata for applications and outcomes.
 *
 * Previously each page re-declared its own `statusConfig` map, and the
 * copies diverged — different labels, different colors, some missed
 * statuses entirely. One source of truth here prevents that drift and
 * makes design-system-level changes (new badge variants, renamed
 * statuses) a single-file edit.
 */

export type ApplicationStatus =
  | "draft"
  | "in_progress"
  | "ready_for_review"
  | "submitted"
  | "pending"
  | "awarded"
  | "rejected"
  | "no_response";

export type StatusBadgeVariant = "default" | "info" | "warning" | "success" | "danger";

interface StatusEntry {
  label: string;
  badge: StatusBadgeVariant;
  icon: LucideIcon;
}

export const APPLICATION_STATUS: Record<ApplicationStatus, StatusEntry> = {
  draft: { label: "Draft", badge: "default", icon: FileText },
  in_progress: { label: "In Progress", badge: "warning", icon: AlertCircle },
  ready_for_review: { label: "Ready for Review", badge: "info", icon: CheckCircle },
  submitted: { label: "Submitted", badge: "success", icon: CheckCircle },
  pending: { label: "Pending", badge: "info", icon: Clock },
  awarded: { label: "Awarded", badge: "success", icon: Award },
  rejected: { label: "Rejected", badge: "danger", icon: XCircle },
  no_response: { label: "No Response", badge: "default", icon: Clock },
};

export function getApplicationStatus(status: string): StatusEntry {
  return (
    APPLICATION_STATUS[status as ApplicationStatus] ?? {
      label: status || "Unknown",
      badge: "default",
      icon: FileText,
    }
  );
}
