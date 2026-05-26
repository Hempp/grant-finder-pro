import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * GrantPilot favicon — pixel pilot wings + G, scaled to fit 32×32.
 * Mirrors /public/logo.svg geometry (viewBox 88×28). preserveAspectRatio
 * "meet" lets the wider mark sit centered with whitespace top/bottom.
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
        <svg
          width="30"
          height="30"
          viewBox="0 0 88 28"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
        >
          <g fill="#0066CC" shape-rendering="crispEdges">
            <rect x="36" y="0" width="12" height="4" />
            <rect x="32" y="4" width="4" height="20" />
            <rect x="48" y="4" width="4" height="4" />
            <rect x="44" y="12" width="8" height="4" />
            <rect x="48" y="16" width="4" height="8" />
            <rect x="36" y="24" width="12" height="4" />
            <rect x="0" y="8" width="32" height="4" />
            <rect x="4" y="12" width="28" height="4" />
            <rect x="8" y="16" width="24" height="4" />
            <rect x="56" y="8" width="32" height="4" />
            <rect x="56" y="12" width="28" height="4" />
            <rect x="56" y="16" width="24" height="4" />
          </g>
        </svg>
      </div>
    ),
    { ...size }
  );
}
