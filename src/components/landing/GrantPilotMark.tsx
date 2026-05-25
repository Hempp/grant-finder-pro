/**
 * GrantPilot brand mark — a capital G centered in classic pilot wings.
 *
 * The wings read instantly as aviation/flight crew identity (every
 * passenger has seen them on a uniform); the central G locks the brand
 * name in. Marine monochrome — no gradient, no glow. The wings have
 * tapered swept feathers, three per side, mirrored.
 *
 * The mark is intrinsically wider than tall (48:32 = 3:2). Renders at
 * h=28 with width auto so the aspect ratio is preserved everywhere it
 * appears (marketing nav, dashboard sidebar, auth chrome).
 */
export function GrantPilotMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 48 32"
        className="h-7 w-auto shrink-0"
        fill="none"
        aria-hidden="true"
      >
        {/* LEFT WING — 3 tapered feathers, swept slightly down */}
        <g fill="#0066CC">
          <path d="M16 11 L1 13.2 L1 13.9 L16 13 Z" />
          <path d="M16 14.5 L4 16.5 L4 17.2 L16 16.5 Z" />
          <path d="M16 18 L8 19.7 L8 20.4 L16 20 Z" />
        </g>

        {/* RIGHT WING — mirror */}
        <g fill="#0066CC">
          <path d="M32 11 L47 13.2 L47 13.9 L32 13 Z" />
          <path d="M32 14.5 L44 16.5 L44 17.2 L32 16.5 Z" />
          <path d="M32 18 L40 19.7 L40 20.4 L32 20 Z" />
        </g>

        {/* CENTRAL G — open on the right, crossbar inward */}
        <path
          d="M 30 11.5 A 7.5 7.5 0 1 1 30 20.5 L 30 16 L 25 16"
          stroke="#0066CC"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span className="font-display text-xl tracking-tight text-ink">
        GrantPilot
      </span>
    </span>
  );
}
