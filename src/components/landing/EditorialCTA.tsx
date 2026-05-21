import Link from "next/link";
import { ReactNode } from "react";

export function EditorialCTA({
  href,
  variant = "primary",
  children,
  className = "",
}: {
  href: string;
  variant?: "primary" | "secondary";
  children: ReactNode;
  className?: string;
}) {
  if (variant === "secondary") {
    return (
      <Link
        href={href}
        className={`text-ink hover:text-accent transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 bg-accent text-surface rounded-lg px-7 py-3.5 font-medium tracking-tight hover:bg-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
    >
      {children}
    </Link>
  );
}
