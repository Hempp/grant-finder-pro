import { ReactNode } from "react";

export function PullQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="my-10 pl-6 border-l border-accent">
      <p className="font-display italic text-[22px] leading-[1.45] text-ink">
        {children}
      </p>
    </blockquote>
  );
}
