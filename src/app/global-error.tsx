"use client";

import { useEffect } from "react";

/**
 * Last-resort root error boundary. Renders its own <html>/<body> because
 * the layout itself may have failed. Keep dependencies minimal.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    import("@/lib/telemetry").then(({ logError }) => {
      logError(error, { boundary: "root", digest: error.digest });
    });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          backgroundColor: "#020617",
          color: "#e2e8f0",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
            We&apos;re sorry — GrantPilot hit an unexpected error. Please try again, or
            email <a href="mailto:support@grantpilot.dev" style={{ color: "#34d399" }}>support@grantpilot.dev</a>.
          </p>
          {error.digest && (
            <p style={{ color: "#475569", fontSize: "0.75rem", marginBottom: "1rem" }}>
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.625rem 1.25rem",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
