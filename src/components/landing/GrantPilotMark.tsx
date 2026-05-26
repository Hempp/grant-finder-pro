/**
 * GrantPilot brand mark — chunky 8-bit pixel G centered in pilot wings.
 *
 * 22-column × 7-row pixel grid, each pixel rendered as a 4×4 SVG square
 * with shape-rendering="crispEdges" so it stays sharp at any size. Wings
 * sweep down-and-out in 3 staircased feathers per side; G is a 5-column
 * pixel letterform with the opening on the right and an inside crossbar.
 *
 * Color uses var(--accent) so the mark inherits the marine in light
 * mode and cyan in dark mode automatically. The static /public/logo.svg
 * is the same mark but with #0066CC hardcoded for IMG-tag contexts where
 * CSS variables don't resolve.
 */
export function GrantPilotMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 88 28"
        className="h-7 w-auto shrink-0"
        aria-hidden="true"
      >
        <g fill="var(--accent)" shapeRendering="crispEdges">
          {/* Row 0: G top arc */}
          <rect x="36" y="0" width="12" height="4" />
          {/* Row 1: G shoulders */}
          <rect x="32" y="4" width="4" height="4" />
          <rect x="48" y="4" width="4" height="4" />
          {/* Row 2: top feathers (longest) + G left bar */}
          <rect x="0" y="8" width="36" height="4" />
          <rect x="56" y="8" width="32" height="4" />
          {/* Row 3: mid feathers + G left bar + crossbar */}
          <rect x="4" y="12" width="32" height="4" />
          <rect x="44" y="12" width="8" height="4" />
          <rect x="56" y="12" width="28" height="4" />
          {/* Row 4: bottom feathers + G left bar + right bar */}
          <rect x="8" y="16" width="28" height="4" />
          <rect x="48" y="16" width="4" height="4" />
          <rect x="56" y="16" width="24" height="4" />
          {/* Row 5: G shoulders curving back */}
          <rect x="32" y="20" width="4" height="4" />
          <rect x="48" y="20" width="4" height="4" />
          {/* Row 6: G bottom arc */}
          <rect x="36" y="24" width="12" height="4" />
        </g>
      </svg>
      <span className="font-display text-xl tracking-tight text-ink">
        GrantPilot
      </span>
    </span>
  );
}
