import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "GrantPilot — Win grants and scholarships. Pay 0% upfront.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * GrantPilot Open Graph card.
 *
 * The Score signature object front-and-center: a large marine ring filled
 * to a 94 high-score state, with the brand wordmark + tagline below. One
 * signature across every surface — favicon, OG card, in-app ScoreRing.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #FFFFFF 0%, #F2F7FE 50%, #E8F1FC 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Big ScoreRing — the signature object, 94 (high-score green) */}
        <div
          style={{
            position: "relative",
            width: 220,
            height: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 48,
          }}
        >
          <svg
            width="220"
            height="220"
            viewBox="0 0 220 220"
            fill="none"
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            <circle
              cx="110"
              cy="110"
              r="92"
              fill="none"
              stroke="#0066CC"
              strokeOpacity="0.18"
              strokeWidth="18"
            />
            <path
              d="M 110 18 A 92 92 0 1 1 73.55 196.92"
              fill="none"
              stroke="#15803D"
              strokeWidth="18"
              strokeLinecap="round"
            />
          </svg>
          <span
            style={{
              fontSize: 84,
              fontWeight: 700,
              color: "#15803D",
              letterSpacing: "-2px",
              lineHeight: 1,
            }}
          >
            94
          </span>
        </div>

        {/* Wordmark — ring glyph + GrantPilot */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 24,
          }}
        >
          <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
            <circle
              cx="16"
              cy="16"
              r="13"
              fill="none"
              stroke="#0066CC"
              strokeOpacity="0.2"
              strokeWidth="2.5"
            />
            <path
              d="M 16 3 A 13 13 0 1 1 6.93 25.95"
              fill="none"
              stroke="#0066CC"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="6.93" cy="25.95" r="1.6" fill="#0066CC" />
          </svg>
          <span
            style={{
              fontSize: 44,
              fontWeight: 700,
              color: "#1a1a1a",
              letterSpacing: "-0.5px",
            }}
          >
            GrantPilot
          </span>
        </div>

        {/* Tagline (two lines, matching the landing) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <p
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#1a1a1a",
              margin: 0,
              letterSpacing: "-0.5px",
            }}
          >
            Win grants and scholarships.
          </p>
          <p
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#0066CC",
              margin: 0,
              marginTop: 4,
              letterSpacing: "-0.5px",
            }}
          >
            Pay 0% upfront.
          </p>
        </div>

        {/* Domain */}
        <p
          style={{
            fontSize: 18,
            color: "#6B7280",
            marginTop: 36,
            fontWeight: 500,
          }}
        >
          grantpilot.dev
        </p>
      </div>
    ),
    { ...size }
  );
}
