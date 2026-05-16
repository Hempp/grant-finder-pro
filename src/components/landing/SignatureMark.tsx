/**
 * Inline compass-G with a 60s linear rotation on the needle <g>.
 * prefers-reduced-motion freezes the needle pointing northeast — a
 * deliberate "found something" position.
 */
export function SignatureMark({
  size = 480,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`text-accent ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 480 480"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        width="100%"
        height="100%"
      >
        <circle cx={240} cy={240} r={220} />
        <line x1={240} y1={20} x2={240} y2={44} />
        <line x1={240} y1={436} x2={240} y2={460} />
        <line x1={20} y1={240} x2={44} y2={240} />
        <line x1={436} y1={240} x2={460} y2={240} />
        <circle cx={240} cy={240} r={160} />
        {/* G letterform — brand compass-G path from commit 1515c73, scaled 10x */}
        <path d="M240 60C140.6 60 60 140.6 60 240s80.6 180 180 180c49.7 0 95-20.1 127.3-52.7" />
        <path d="M387.3 367.3L387.3 240H260" />
        <g
          id="needle"
          style={{
            transformOrigin: "240px 240px",
            animation: "spin-needle 60s linear infinite",
          }}
        >
          <polygon
            points="240,80 252,240 240,260 228,240"
            fill="currentColor"
            stroke="none"
          />
          <polygon
            points="240,400 228,240 240,260 252,240"
            fill="none"
            stroke="currentColor"
          />
        </g>
        <style>{`
          @keyframes spin-needle {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @media (prefers-reduced-motion: reduce) {
            #needle {
              animation: none;
              transform: rotate(45deg);
            }
          }
        `}</style>
      </svg>
    </div>
  );
}
