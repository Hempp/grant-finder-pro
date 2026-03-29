import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "GrantPilot — AI-Powered Grant Intelligence Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #10b981, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
            }}
          >
            ✦
          </div>
          <span style={{ fontSize: "48px", fontWeight: 800, color: "white", letterSpacing: "-1px" }}>
            Grant<span style={{ color: "#10b981" }}>Pilot</span>
          </span>
        </div>
        <p style={{ fontSize: "28px", fontWeight: 700, color: "white", marginBottom: "8px" }}>
          Find Grants You'll Win.
        </p>
        <p style={{ fontSize: "18px", color: "#94a3b8", textAlign: "center", maxWidth: "600px" }}>
          AI fills applications to 100/100. We only earn when you win.
        </p>
      </div>
    ),
    { ...size }
  );
}
