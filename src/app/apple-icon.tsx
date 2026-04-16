import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * GrantPilot Apple touch icon — 180x180.
 *
 * Same compass-G as the favicon, scaled up with more room to breathe.
 * iOS will round the corners automatically so we use borderRadius: 36
 * as a guide for the gradient fill only.
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
          background: "linear-gradient(135deg, #059669, #10b981, #06b6d4)",
          borderRadius: "36px",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 48 48" fill="none">
          {/* Compass circle forming the G */}
          <path
            d="M24 6C14.06 6 6 14.06 6 24s8.06 18 18 18c4.97 0 9.5-2.01 12.73-5.27"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          {/* Horizontal bar of the G + compass needle */}
          <path
            d="M38.73 36.73L38.73 24H26"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Upward needle (the Pilot) */}
          <path
            d="M24 20V8"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Needle tip */}
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
    ),
    { ...size }
  );
}
