import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * GrantPilot favicon — Eye of Providence in marine.
 *
 * Same geometry as the brand mark (/public/logo.svg and the inline
 * GrantPilotMark component) so the brand is recognizable at every
 * scale from this 32×32 favicon up to the hero.
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
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          {/* Outer triangle */}
          <path
            d="M16 3 L29 27 L3 27 Z"
            stroke="#0066CC"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          />
          {/* Eye — almond outline */}
          <path
            d="M8 18 C 11 14.5 21 14.5 24 18 C 21 21.5 11 21.5 8 18 Z"
            stroke="#0066CC"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Iris */}
          <circle cx="16" cy="18" r="2.5" fill="#0066CC" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
