"use client";

import { ReactNode } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

/**
 * Accessible dialog wrapper over Radix UI's DialogPrimitive.
 *
 * Why exist: six hand-rolled modals lived across the app, each
 * reimplementing backdrop + ESC-to-close + click-outside + ARIA wiring
 * with varying WCAG compliance. Radix does the hard part (focus trap,
 * focus restoration, ARIA live announcements, portal rendering). This
 * component is the thin brand-skin on top.
 *
 * Usage:
 *   <Dialog open={foo} onOpenChange={setFoo} title="Confirm">
 *     ...body JSX...
 *   </Dialog>
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "md",
  closeButton = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeButton?: boolean;
}) {
  const sizeClasses: Record<NonNullable<typeof size>, string> = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-3xl",
  };

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <RadixDialog.Content
          className={`fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl ${sizeClasses[size]} max-h-[95vh] overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0`}
        >
          <div className="flex items-start justify-between mb-4 gap-3">
            <div className="min-w-0">
              <RadixDialog.Title className="text-lg font-bold text-white">
                {title}
              </RadixDialog.Title>
              {description && (
                <RadixDialog.Description className="text-sm text-slate-400 mt-1">
                  {description}
                </RadixDialog.Description>
              )}
            </div>
            {closeButton && (
              <RadixDialog.Close asChild>
                <button
                  className="text-slate-500 hover:text-white rounded-lg p-1 transition-colors focus-ring"
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </RadixDialog.Close>
            )}
          </div>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
