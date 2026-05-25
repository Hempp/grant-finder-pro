/**
 * Funder logo wall for the TrustBar "Indexing funding from" row.
 *
 * Each logo is a distinct monochrome typographic treatment — emulates
 * the Stripe / Linear / Vercel customer-logo-wall approach. Single
 * marine color, uniform vertical height (24px), unique typographic
 * voice per funder so they read as individual brand marks rather than
 * a flat text list.
 *
 * These are REAL sources GrantPilot indexes (per scraping/cron config).
 * No fabrication — see scrape-grants cron + sources docs.
 */

interface LogoProps {
  className?: string;
}

const LOGO_HEIGHT = 24;

function GrantsGov({ className = "" }: LogoProps) {
  return (
    <span
      className={`inline-flex items-baseline font-semibold tracking-tight ${className}`}
      style={{ fontSize: 16, height: LOGO_HEIGHT, color: "var(--ink)" }}
      aria-label="Grants.gov"
    >
      Grants<span style={{ color: "var(--accent)" }}>.gov</span>
    </span>
  );
}

function SamGov({ className = "" }: LogoProps) {
  return (
    <span
      className={`inline-flex items-baseline font-semibold tracking-tight ${className}`}
      style={{ fontSize: 16, height: LOGO_HEIGHT, color: "var(--ink)" }}
      aria-label="SAM.gov"
    >
      SAM<span style={{ color: "var(--accent)" }}>.gov</span>
    </span>
  );
}

function NIH({ className = "" }: LogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      style={{ height: LOGO_HEIGHT }}
      aria-label="National Institutes of Health"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="8.5" stroke="var(--ink)" strokeWidth="1.5" />
        <path
          d="M10 5 V15 M6.5 10 H13.5"
          stroke="var(--ink)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span
        className="font-bold tracking-tight"
        style={{ fontSize: 15, color: "var(--ink)", letterSpacing: "0.02em" }}
      >
        NIH
      </span>
    </span>
  );
}

function NSF({ className = "" }: LogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      style={{ height: LOGO_HEIGHT }}
      aria-label="National Science Foundation"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="8.5" stroke="var(--ink)" strokeWidth="1.5" />
        <ellipse
          cx="10"
          cy="10"
          rx="4"
          ry="8.5"
          stroke="var(--ink)"
          strokeWidth="1"
          fill="none"
        />
        <line x1="1.5" y1="10" x2="18.5" y2="10" stroke="var(--ink)" strokeWidth="1" />
      </svg>
      <span
        className="font-bold tracking-tight"
        style={{ fontSize: 15, color: "var(--ink)", letterSpacing: "0.02em" }}
      >
        NSF
      </span>
    </span>
  );
}

function USDA({ className = "" }: LogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      style={{ height: LOGO_HEIGHT }}
      aria-label="U.S. Department of Agriculture"
    >
      <svg width="14" height="20" viewBox="0 0 14 20" fill="none" aria-hidden="true">
        <path
          d="M7 2 V18 M3 6 L7 4 L11 6 M3 10 L7 8 L11 10 M3 14 L7 12 L11 14"
          stroke="var(--ink)"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="font-bold tracking-tight"
        style={{ fontSize: 15, color: "var(--ink)", letterSpacing: "0.02em" }}
      >
        USDA
      </span>
    </span>
  );
}

function SBIR({ className = "" }: LogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      style={{ height: LOGO_HEIGHT }}
      aria-label="Small Business Innovation Research"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 17 Q3 12 10 3 Q17 12 10 17 Z"
          stroke="var(--ink)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="10" cy="10" r="1.5" fill="var(--ink)" />
      </svg>
      <span
        className="font-bold tracking-tight"
        style={{ fontSize: 15, color: "var(--ink)", letterSpacing: "0.02em" }}
      >
        SBIR
      </span>
    </span>
  );
}

function DOE({ className = "" }: LogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      style={{ height: LOGO_HEIGHT }}
      aria-label="U.S. Department of Energy"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="2" fill="var(--ink)" />
        <ellipse
          cx="10"
          cy="10"
          rx="8.5"
          ry="3"
          stroke="var(--ink)"
          strokeWidth="1.2"
          fill="none"
        />
        <ellipse
          cx="10"
          cy="10"
          rx="8.5"
          ry="3"
          stroke="var(--ink)"
          strokeWidth="1.2"
          fill="none"
          transform="rotate(60 10 10)"
        />
        <ellipse
          cx="10"
          cy="10"
          rx="8.5"
          ry="3"
          stroke="var(--ink)"
          strokeWidth="1.2"
          fill="none"
          transform="rotate(-60 10 10)"
        />
      </svg>
      <span
        className="font-bold tracking-tight"
        style={{ fontSize: 15, color: "var(--ink)", letterSpacing: "0.02em" }}
      >
        DOE
      </span>
    </span>
  );
}

function FoundationDirectory({ className = "" }: LogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      style={{ height: LOGO_HEIGHT }}
      aria-label="Foundation Directory"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 2 L17 16 L3 16 Z"
          stroke="var(--ink)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="none"
        />
        <line x1="6.5" y1="11" x2="13.5" y2="11" stroke="var(--ink)" strokeWidth="1.2" />
      </svg>
      <span
        className="font-display italic tracking-tight"
        style={{ fontSize: 15, color: "var(--ink)" }}
      >
        Foundation Dir.
      </span>
    </span>
  );
}

export function FunderLogos({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-8 gap-y-5 max-w-4xl mx-auto ${className}`}
    >
      <span className="opacity-80 hover:opacity-100 transition-opacity">
        <GrantsGov />
      </span>
      <span className="opacity-80 hover:opacity-100 transition-opacity">
        <SamGov />
      </span>
      <span className="opacity-80 hover:opacity-100 transition-opacity">
        <NIH />
      </span>
      <span className="opacity-80 hover:opacity-100 transition-opacity">
        <NSF />
      </span>
      <span className="opacity-80 hover:opacity-100 transition-opacity">
        <USDA />
      </span>
      <span className="opacity-80 hover:opacity-100 transition-opacity">
        <SBIR />
      </span>
      <span className="opacity-80 hover:opacity-100 transition-opacity">
        <DOE />
      </span>
      <span className="opacity-80 hover:opacity-100 transition-opacity">
        <FoundationDirectory />
      </span>
    </div>
  );
}
