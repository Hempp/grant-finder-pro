/**
 * Funder logo wall for the TrustBar "Indexing funding from" row.
 *
 * Twelve monochrome marks matching the 12 indexed sources behind the
 * scrape-grants cron. Each glyph approximates the agency's actual
 * visual identity (NSF globe, USDA wheat, NASA worm, EPA leaf, etc.)
 * rendered in a single brand color at uniform 28px height.
 *
 * Federal agency seals are public domain under 17 USC §105 — these
 * stylized monochrome approximations are appropriate for indexing/
 * aggregation context. Full-color seal versions would be visually
 * chaotic on a logo wall; the Stripe / Linear / Vercel pattern is
 * monochrome unification.
 */

const HEIGHT = 28;

function GrantsGov() {
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{ height: HEIGHT }}
      aria-label="Grants.gov"
    >
      {/* Iconic leaf-dot (the real Grants.gov mark uses a green leaf) */}
      <svg width="14" height="18" viewBox="0 0 14 18" fill="none" aria-hidden="true">
        <path
          d="M7 17 Q7 9 12 4 Q9 12 7 17 Z M7 17 Q7 9 2 4 Q5 12 7 17 Z"
          fill="var(--accent)"
        />
        <line x1="7" y1="17" x2="7" y2="7" stroke="var(--accent)" strokeWidth="0.8" />
      </svg>
      <span
        className="font-semibold tracking-tight"
        style={{ fontSize: 16, color: "var(--ink)" }}
      >
        Grants<span style={{ color: "var(--accent)" }}>.gov</span>
      </span>
    </span>
  );
}

function SamGov() {
  return (
    <span
      className="inline-flex items-baseline"
      style={{ height: HEIGHT }}
      aria-label="SAM.gov"
    >
      <span
        className="font-bold tracking-tight"
        style={{ fontSize: 17, color: "var(--ink)", letterSpacing: "-0.01em" }}
      >
        SAM<span style={{ color: "var(--accent)" }}>.gov</span>
      </span>
    </span>
  );
}

function NIH() {
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{ height: HEIGHT }}
      aria-label="National Institutes of Health"
    >
      {/* Three pillars — NIH's signature three-bar logo */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="2" y="4" width="3" height="13" fill="var(--ink)" />
        <rect x="8.5" y="4" width="3" height="13" fill="var(--ink)" />
        <rect x="15" y="4" width="3" height="13" fill="var(--ink)" />
        <rect x="2" y="9.5" width="16" height="2" fill="var(--ink)" />
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

function NSF() {
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{ height: HEIGHT }}
      aria-label="National Science Foundation"
    >
      {/* Globe with stars — NSF's signature seal */}
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="9" stroke="var(--ink)" strokeWidth="1.5" />
        <ellipse cx="11" cy="11" rx="4" ry="9" stroke="var(--ink)" strokeWidth="0.9" />
        <line x1="2" y1="11" x2="20" y2="11" stroke="var(--ink)" strokeWidth="0.9" />
        <circle cx="11" cy="3.5" r="0.8" fill="var(--ink)" />
        <circle cx="11" cy="18.5" r="0.8" fill="var(--ink)" />
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

function USDA() {
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{ height: HEIGHT }}
      aria-label="U.S. Department of Agriculture"
    >
      {/* Wheat sheaf — USDA's signature seal element */}
      <svg width="16" height="22" viewBox="0 0 16 22" fill="none" aria-hidden="true">
        <line x1="8" y1="3" x2="8" y2="20" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" />
        <path
          d="M8 6 Q5 7 4 9 M8 6 Q11 7 12 9
             M8 10 Q4.5 11 3.5 13.5 M8 10 Q11.5 11 12.5 13.5
             M8 14 Q4 15 3 18 M8 14 Q12 15 13 18"
          stroke="var(--ink)"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <ellipse cx="8" cy="3" rx="1.5" ry="2" fill="var(--ink)" />
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

function SBIR() {
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{ height: HEIGHT }}
      aria-label="Small Business Innovation Research"
    >
      {/* Sprouting seedling — America's Seed Fund mark */}
      <svg width="20" height="22" viewBox="0 0 20 22" fill="none" aria-hidden="true">
        <path
          d="M10 21 V11"
          stroke="var(--ink)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M10 11 Q5 9 4 4 Q8 6 10 11 Z"
          fill="var(--ink)"
        />
        <path
          d="M10 14 Q15 12 16 7 Q12 9 10 14 Z"
          fill="var(--ink)"
        />
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

function DOE() {
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{ height: HEIGHT }}
      aria-label="U.S. Department of Energy"
    >
      {/* Atom with three orbital paths — DOE's iconic mark */}
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="2" fill="var(--ink)" />
        <ellipse cx="11" cy="11" rx="9.5" ry="3.5" stroke="var(--ink)" strokeWidth="1.2" />
        <ellipse
          cx="11"
          cy="11"
          rx="9.5"
          ry="3.5"
          stroke="var(--ink)"
          strokeWidth="1.2"
          transform="rotate(60 11 11)"
        />
        <ellipse
          cx="11"
          cy="11"
          rx="9.5"
          ry="3.5"
          stroke="var(--ink)"
          strokeWidth="1.2"
          transform="rotate(-60 11 11)"
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

function EDGov() {
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{ height: HEIGHT }}
      aria-label="U.S. Department of Education"
    >
      {/* Stylized tree (the Dept of Ed's logo motif) */}
      <svg width="18" height="22" viewBox="0 0 18 22" fill="none" aria-hidden="true">
        <line x1="9" y1="21" x2="9" y2="11" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" />
        <path
          d="M9 13 Q3 11 2 5 Q8 7 9 13 Z M9 13 Q15 11 16 5 Q10 7 9 13 Z"
          fill="var(--ink)"
        />
        <path
          d="M9 8 Q5 6 4.5 1 Q8 3 9 8 Z M9 8 Q13 6 13.5 1 Q10 3 9 8 Z"
          fill="var(--ink)"
        />
      </svg>
      <span
        className="font-semibold tracking-tight"
        style={{ fontSize: 15, color: "var(--ink)" }}
      >
        ED<span style={{ color: "var(--accent)" }}>.gov</span>
      </span>
    </span>
  );
}

function NASA() {
  return (
    <span
      className="inline-flex items-center"
      style={{ height: HEIGHT }}
      aria-label="National Aeronautics and Space Administration"
    >
      {/* Worm-style wordmark — NASA's modern alt mark */}
      <span
        className="font-black tracking-wider"
        style={{
          fontSize: 17,
          color: "var(--ink)",
          letterSpacing: "0.06em",
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        NASA
      </span>
    </span>
  );
}

function EPA() {
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{ height: HEIGHT }}
      aria-label="Environmental Protection Agency"
    >
      {/* Stylized leaf — EPA's signature mark */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 18 Q3 14 4 6 Q12 6 16 12 Q14 17 10 18 Z"
          fill="var(--ink)"
        />
        <line x1="6" y1="14" x2="14" y2="8" stroke="var(--bg)" strokeWidth="0.8" />
      </svg>
      <span
        className="font-bold tracking-tight"
        style={{ fontSize: 15, color: "var(--ink)", letterSpacing: "0.02em" }}
      >
        EPA
      </span>
    </span>
  );
}

function California() {
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{ height: HEIGHT }}
      aria-label="California state grant portals"
    >
      {/* California bear silhouette + star (state flag iconography) */}
      <svg width="26" height="20" viewBox="0 0 26 20" fill="none" aria-hidden="true">
        <path
          d="M3 16 Q3 13 5 12 Q5 10 7 9 Q7 7 9 6.5 Q11 5 13 6 Q15 5 17 6.5 Q19 7 19 9 Q21 10 21 12 Q23 13 23 16 Z"
          fill="var(--ink)"
        />
        <polygon
          points="6,4 6.5,5.5 8,5.5 6.8,6.4 7.3,8 6,7 4.7,8 5.2,6.4 4,5.5 5.5,5.5"
          fill="var(--ink)"
        />
      </svg>
      <span
        className="font-semibold tracking-tight"
        style={{ fontSize: 15, color: "var(--ink)" }}
      >
        California
      </span>
    </span>
  );
}

function FoundationDirectory() {
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{ height: HEIGHT }}
      aria-label="Foundation Directory (Candid)"
    >
      {/* Bold plus mark — Candid / Foundation Directory's signature */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="8" y="2" width="4" height="16" fill="var(--accent)" />
        <rect x="2" y="8" width="16" height="4" fill="var(--accent)" />
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
  // Order matters: most-recognized first (federal portals), domain-specific
  // agencies second (NIH/NSF/USDA/SBIR/DOE/ED), then NASA/EPA, then state
  // + foundations. Mirrors the scrape-grants source priority order.
  const logos = [
    <GrantsGov key="grants" />,
    <SamGov key="sam" />,
    <NIH key="nih" />,
    <NSF key="nsf" />,
    <USDA key="usda" />,
    <SBIR key="sbir" />,
    <DOE key="doe" />,
    <EDGov key="ed" />,
    <NASA key="nasa" />,
    <EPA key="epa" />,
    <California key="ca" />,
    <FoundationDirectory key="fd" />,
  ];

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-7 gap-y-6 max-w-4xl mx-auto ${className}`}
    >
      {logos.map((logo, i) => (
        <span
          key={i}
          className="opacity-75 hover:opacity-100 transition-opacity"
        >
          {logo}
        </span>
      ))}
    </div>
  );
}
