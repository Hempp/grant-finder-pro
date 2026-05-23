/**
 * GrantPilot brand mark — a paper-airplane glyph (the "pilot") in marine,
 * paired with the wordmark. Replaces the earlier ring-based mark; the
 * paper-airplane reads as direction + lift + the brand name (Pilot)
 * without any decorative flourish.
 */
export function GrantPilotMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 32 32"
        className="size-7 shrink-0"
        aria-hidden="true"
      >
        {/* Upper wing — full marine */}
        <path d="M3 17 L28 5 L18 26 Z" fill="#0066CC" />
        {/* Lower fold — slightly darker to suggest paper depth */}
        <path d="M3 17 L18 26 L13 20 Z" fill="#0052A3" />
      </svg>
      <span className="font-display text-xl tracking-tight text-ink">
        GrantPilot
      </span>
    </span>
  );
}
