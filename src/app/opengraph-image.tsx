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
        {/* Decorative circles */}
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

        {/* Logo area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
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
          <span
            style={{
              fontSize: "48px",
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
          Find Grants You&apos;ll Win.
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
          AI fills your application to 100/100, optimized for each
          funder&apos;s scoring criteria. We only earn when you win.
        </p>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            gap: "48px",
            marginTop: "40px",
            padding: "20px 40px",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "28px", fontWeight: 800, color: "#10b981" }}>100/100</span>
            <span style={{ fontSize: "14px", color: "#64748b" }}>AI Score</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "28px", fontWeight: 800, color: "white" }}>8</span>
            <span style={{ fontSize: "14px", color: "#64748b" }}>Grant Sources</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "28px", fontWeight: 800, color: "white" }}>3%</span>
            <span style={{ fontSize: "14px", color: "#64748b" }}>Success Fee</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
