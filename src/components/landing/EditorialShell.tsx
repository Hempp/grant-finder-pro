import { ReactNode } from "react";

/**
 * Wraps the landing page in data-theme="editorial" so editorial
 * tokens activate. Dashboards are NOT wrapped — they keep the
 * original :root tokens.
 */
export function EditorialShell({ children }: { children: ReactNode }) {
  return (
    <div
      data-theme="editorial"
      className="min-h-screen bg-bg text-ink font-sans antialiased"
    >
      {children}
    </div>
  );
}
