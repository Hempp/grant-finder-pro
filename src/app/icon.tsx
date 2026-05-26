import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * GrantPilot favicon — 32x32.
 *
 * The Score signature in miniature: a marine progress ring with a small
 * dot at the tip. Same shape as the in-app ScoreRing and the brand mark
 * — one signature, every scale.
 */
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
          background: "#FFFFFF",
          borderRadius: "7px",
        }}
      >
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
          <circle
            cx="16"
            cy="16"
            r="13"
            fill="none"
            stroke="#0066CC"
            strokeOpacity="0.2"
            strokeWidth="3"
          />
          <path
            d="M 16 3 A 13 13 0 1 1 6.93 25.95"
            fill="none"
            stroke="#0066CC"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="6.93" cy="25.95" r="2" fill="#0066CC" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
