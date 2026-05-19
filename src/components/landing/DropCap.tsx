import { ReactNode } from "react";

/**
 * Single-use drop cap. ::first-letter pseudo so screen readers
 * read the paragraph unchanged. 4 lines desktop, 3 lines at <640px.
 */
export function DropCap({ children }: { children: ReactNode }) {
  return (
    <p className="editorial-dropcap">
      {children}
      <style>{`
        .editorial-dropcap::first-letter {
          font-family: var(--font-fraunces), Georgia, serif;
          font-weight: 600;
          color: var(--accent);
          float: left;
          line-height: 1;
          padding: 0.08em 0.12em 0 0;
          font-size: 4.4em;
        }
        @media (max-width: 640px) {
          .editorial-dropcap::first-letter { font-size: 3.4em; }
        }
      `}</style>
    </p>
  );
}
