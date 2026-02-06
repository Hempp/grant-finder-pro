import { HTMLAttributes, forwardRef, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outline" | "ghost" | "gradient" | "interactive";
  hover?: boolean;
  glow?: boolean;
  glowColor?: "emerald" | "purple" | "blue" | "amber";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className = "",
      variant = "default",
      hover = false,
      glow = false,
      glowColor = "emerald",
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = "rounded-xl transition-all duration-300";

    const variants = {
      default: "bg-slate-800/50 border border-slate-700",
      elevated: "bg-slate-800 border border-slate-700 shadow-xl shadow-black/20",
      outline: "bg-transparent border-2 border-slate-600",
      ghost: "bg-slate-800/30 border border-transparent",
      gradient: "bg-gradient-to-br from-slate-800 via-slate-800/90 to-slate-900 border border-slate-700",
      interactive: "bg-slate-800/50 border border-slate-700 cursor-pointer hover:bg-slate-800/80 hover:border-slate-600",
    };

    const hoverStyles = hover
      ? "hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-black/30"
      : "";

    const glowColors = {
      emerald: "hover:shadow-emerald-500/20",
      purple: "hover:shadow-purple-500/20",
      blue: "hover:shadow-blue-500/20",
      amber: "hover:shadow-amber-500/20",
    };

    const glowStyles = glow ? `${glowColors[glowColor]} hover:shadow-xl` : "";

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${glowStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  action?: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = "", action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`p-6 border-b border-slate-700/50 flex items-start justify-between gap-4 ${className}`}
        {...props}
      >
        <div className="flex-1 min-w-0">{children}</div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className = "", as: Component = "h3", children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={`text-lg font-semibold text-white ${className}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

CardTitle.displayName = "CardTitle";

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={`text-sm text-slate-400 mt-1 ${className}`}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardDescription.displayName = "CardDescription";

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = "", noPadding = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${noPadding ? "" : "p-6"} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = "CardContent";

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  justify?: "start" | "end" | "between" | "center";
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = "", justify = "end", children, ...props }, ref) => {
    const justifyStyles = {
      start: "justify-start",
      end: "justify-end",
      between: "justify-between",
      center: "justify-center",
    };

    return (
      <div
        ref={ref}
        className={`p-6 border-t border-slate-700/50 flex items-center gap-3 ${justifyStyles[justify]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = "CardFooter";

// Stats card for dashboard
interface StatsCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  icon?: ReactNode;
}

export const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(
  ({ className = "", title, value, description, trend, icon, ...props }, ref) => {
    return (
      <Card ref={ref} className={`p-6 ${className}`} hover glow {...props}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {description && (
              <p className="text-sm text-slate-500">{description}</p>
            )}
            {trend && (
              <div className={`flex items-center gap-1 text-sm ${trend.isPositive ? "text-emerald-400" : "text-red-400"}`}>
                <span>{trend.isPositive ? "↑" : "↓"}</span>
                <span>{Math.abs(trend.value)}%</span>
                {trend.label && <span className="text-slate-500">{trend.label}</span>}
              </div>
            )}
          </div>
          {icon && (
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
              {icon}
            </div>
          )}
        </div>
      </Card>
    );
  }
);

StatsCard.displayName = "StatsCard";
