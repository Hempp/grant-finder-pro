import { ReactNode } from "react";

export function EditorialSection({
  children,
  variant = "default",
  id,
  className = "",
}: {
  children: ReactNode;
  variant?: "default" | "plain";
  id?: string;
  className?: string;
}) {
  const ruleClasses =
    variant === "plain" ? "" : "border-t border-b border-rule";
  return (
    <section
      id={id}
      className={`${ruleClasses} py-20 md:py-32 ${className}`}
    >
      <div className="container mx-auto px-4 sm:px-6">{children}</div>
    </section>
  );
}
