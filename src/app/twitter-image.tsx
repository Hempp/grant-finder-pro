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
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #059669, #10b981, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="38" height="38" viewBox="0 0 48 48" fill="none">
              <path
                d="M24 6C14.06 6 6 14.06 6 24s8.06 18 18 18c4.97 0 9.5-2.01 12.73-5.27"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M38.73 36.73L38.73 24H26"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path d="M24 20V8" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d="M20 12L24 5L28 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <span style={{ fontSize: "52px", fontWeight: 800, color: "white", letterSpacing: "-1px" }}>
            Grant<span style={{ color: "#10b981" }}>Pilot</span>
          </span>
        </div>
        <p style={{ fontSize: "30px", fontWeight: 700, color: "white", marginBottom: "10px" }}>
          Find Grants. Win Funding. Grow Your Mission.
        </p>
        <p style={{ fontSize: "19px", color: "#94a3b8", textAlign: "center", maxWidth: "650px" }}>
          Drop your website — AI fills the application. We only earn when you win.
        </p>
        <div
          style={{
            display: "flex",
            marginTop: "32px",
            padding: "10px 24px",
            borderRadius: "10px",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            background: "rgba(16, 185, 129, 0.08)",
          }}
        >
          <span style={{ fontSize: "17px", fontWeight: 600, color: "#10b981" }}>
            grantpilot.dev
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
