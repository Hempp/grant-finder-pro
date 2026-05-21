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
      className={`text-caption font-medium tracking-[0.16em] uppercase text-ink-2 ${className}`}
    >
      {children}
    </p>
  );
}
