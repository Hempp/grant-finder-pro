import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
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
          background: "linear-gradient(135deg, #10b981, #06b6d4)",
          borderRadius: "36px",
        }}
      >
        <span style={{ fontSize: "100px", color: "white" }}>✦</span>
      </div>
    ),
    { ...size }
  );
}
