import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #059669, #10b981, #14b8a6, #06b6d4)",
          borderRadius: "8px",
          position: "relative",
        }}
      >
        <svg width="26" height="26" viewBox="0 0 64 64" fill="none">
          {/* Compass ring */}
          <circle cx="32" cy="32" r="19" stroke="white" strokeWidth="3" strokeOpacity="0.9" fill="none" />
          {/* Top chevron */}
          <path d="M26 28 L32 20 L38 28" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* Middle chevron */}
          <path d="M24 33 L32 25 L40 33" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" fill="none" />
          {/* Spark */}
          <circle cx="32" cy="31" r="3" fill="white" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
