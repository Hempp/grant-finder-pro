/**
 * GrantPilot brand mark — Eye of Providence (triangle + all-seeing eye).
 *
 * Clean geometric SVG, marine monochrome via var(--accent) so it
 * switches between marine (light mode) and cyan (dark mode). Renders
 * sharp at any size from 16px favicon up to hero-scale display. Pairs
 * with the favicon at /src/app/icon.tsx which uses the same geometry.
 */
export function GrantPilotMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center ${className}`} aria-label="GrantPilot">
      <svg
        viewBox="0 0 32 32"
        className="h-8 w-8 shrink-0"
        fill="none"
        aria-hidden="true"
      >
        {/* Outer triangle */}
        <path
          d="M16 3 L29 27 L3 27 Z"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />
        {/* Eye — almond outline */}
        <path
          d="M8 18 C 11 14.5 21 14.5 24 18 C 21 21.5 11 21.5 8 18 Z"
          stroke="var(--accent)"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Iris — solid marine */}
        <circle cx="16" cy="18" r="2.5" fill="var(--accent)" />
      </svg>
    </span>
  );
}
