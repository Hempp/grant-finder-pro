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
          background: "linear-gradient(135deg, #10b981, #14b8a6, #06b6d4)",
          borderRadius: "8px",
        }}
      >
        {/* Upward arrow mark — simplified for 32px */}
        <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
          <path d="M20 4L32 20L26 20L26 36L14 36L14 20L8 20Z" fill="white" fillOpacity="0.95" />
          <circle cx="20" cy="18" r="3" fill="white" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
