/**
 * GrantPilot brand mark — a marine progress-ring glyph + wordmark.
 *
 * The ring echoes the ScoreRing signature object: a quiet, almost-closed
 * arc that reads as "you're closing in on the grant." Stays subtle, never
 * decorative — restraint over flourish.
 */
export function GrantPilotMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 32 32"
        className="size-7 text-accent shrink-0"
        aria-hidden="true"
      >
        {/* faint track */}
        <circle
          cx="16"
          cy="16"
          r="13"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.20"
          strokeWidth="2.5"
        />
        {/* ~78% progress arc — "almost won" */}
        <path
          d="M 16 3 A 13 13 0 1 1 6.93 25.95"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* small dot at the arc's leading tip — the "score" finishing the climb */}
        <circle cx="6.93" cy="25.95" r="1.6" fill="currentColor" />
      </svg>
      <span className="font-display text-xl tracking-tight text-ink">
        GrantPilot
      </span>
    </span>
  );
}
