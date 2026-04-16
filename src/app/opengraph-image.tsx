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
          position: "relative",
        }}
      >
        {/* Glow effects */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(16, 185, 129, 0.15)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-100px",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "rgba(6, 182, 212, 0.1)",
            filter: "blur(80px)",
          }}
        />

        {/* Logo + wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #059669, #10b981, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
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
              <path
                d="M24 20V8"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M20 12L24 5L28 12"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <span
            style={{
              fontSize: "52px",
              fontWeight: 800,
              color: "white",
              letterSpacing: "-1px",
            }}
          >
            Grant
            <span style={{ color: "#10b981" }}>Pilot</span>
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: "32px",
            fontWeight: 700,
            color: "white",
            marginBottom: "12px",
            textAlign: "center",
          }}
        >
          Find Grants. Win Funding. Grow Your Mission.
        </p>
        <p
          style={{
            fontSize: "20px",
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: "700px",
            lineHeight: 1.5,
          }}
        >
          AI-powered grant matching and application writing.
          Drop your website, we fill the application.
        </p>

        {/* Domain */}
        <div
          style={{
            display: "flex",
            marginTop: "36px",
            padding: "12px 28px",
            borderRadius: "12px",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            background: "rgba(16, 185, 129, 0.08)",
          }}
        >
          <span style={{ fontSize: "18px", fontWeight: 600, color: "#10b981" }}>
            grantpilot.dev
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
