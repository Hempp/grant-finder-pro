/**
 * GrantPilot brand mark — pixelated G centered in pilot wings.
 *
 * Mason-Eye-style polished geometry: each pixel area is a single rect
 * with no overlapping fills. G is built as 6 discrete rects (top arc,
 * left bar, right shoulder, crossbar, right bar, bottom arc); wings
 * are 3 stair-stepped feathers per side that stop short of the G's
 * left bar instead of overlapping it. Cleaner SVG, same visual.
 *
 * Color via var(--accent) for theme switching (marine → cyan in dark
 * mode). The static /public/logo.svg uses #0066CC hardcoded for
 * IMG-tag contexts where CSS variables don't resolve.
 */
export function GrantPilotMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center ${className}`} aria-label="GrantPilot">
      <svg
        viewBox="0 0 88 28"
        className="h-7 w-auto shrink-0"
        aria-hidden="true"
      >
        <g fill="var(--accent)" shapeRendering="crispEdges">
          {/* G */}
          <rect x="36" y="0" width="12" height="4" />
          <rect x="32" y="4" width="4" height="20" />
          <rect x="48" y="4" width="4" height="4" />
          <rect x="44" y="12" width="8" height="4" />
          <rect x="48" y="16" width="4" height="8" />
          <rect x="36" y="24" width="12" height="4" />
          {/* Left wing */}
          <rect x="0" y="8" width="32" height="4" />
          <rect x="4" y="12" width="28" height="4" />
          <rect x="8" y="16" width="24" height="4" />
          {/* Right wing */}
          <rect x="56" y="8" width="32" height="4" />
          <rect x="56" y="12" width="28" height="4" />
          <rect x="56" y="16" width="24" height="4" />
        </g>
      </svg>
    </span>
  );
}
