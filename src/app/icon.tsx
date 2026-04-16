import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * GrantPilot favicon — 32x32.
 *
 * Design: bold "G" with an upward-pointing compass needle integrated
 * into the letterform, on the brand emerald-to-cyan gradient. Reads
 * as both a "G for Grant" and a compass for "Pilot" at tab-icon size.
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
          borderRadius: "7px",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
          {/* Compass circle forming the G */}
          <path
            d="M24 6C14.06 6 6 14.06 6 24s8.06 18 18 18c4.97 0 9.5-2.01 12.73-5.27"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Horizontal bar of the G + compass needle */}
          <path
            d="M38.73 36.73L38.73 24H26"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Upward needle (the Pilot) */}
          <path
            d="M24 20V8"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          {/* Needle tip */}
          <path
            d="M20 12L24 5L28 12"
            stroke="white"
            strokeWidth="3"
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
