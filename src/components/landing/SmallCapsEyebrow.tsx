import { ReactNode } from "react";

export function SmallCapsEyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[13px] font-medium tracking-[0.16em] uppercase text-ink-2 ${className}`}
    >
      {children}
    </p>
  );
}
