import { HTMLAttributes, forwardRef } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circle" | "card" | "table-row" | "avatar" | "button";
  width?: string | number;
  height?: string | number;
  lines?: number;
  animated?: boolean;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className = "",
      variant = "text",
      width,
      height,
      lines = 1,
      animated = true,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      bg-slate-700/50 rounded
      ${animated ? "animate-shimmer bg-gradient-to-r from-slate-700/50 via-slate-600/50 to-slate-700/50 bg-[length:200%_100%]" : ""}
    `;

    const variantStyles = {
      text: "h-4 rounded",
      circle: "rounded-full aspect-square",
      card: "rounded-xl",
      "table-row": "h-12 rounded-lg",
      avatar: "rounded-full",
      button: "h-10 rounded-lg",
    };

    const getSize = () => {
      if (width || height) {
        return {
          width: typeof width === "number" ? `${width}px` : width,
          height: typeof height === "number" ? `${height}px` : height,
        };
      }

      switch (variant) {
        case "circle":
          return { width: "40px", height: "40px" };
        case "avatar":
          return { width: "48px", height: "48px" };
        case "card":
          return { width: "100%", height: "200px" };
        case "table-row":
          return { width: "100%", height: "48px" };
        case "button":
          return { width: "100px", height: "40px" };
        default:
          return { width: "100%", height: undefined };
      }
    };

    const size = getSize();

    if (variant === "text" && lines > 1) {
      return (
        <div ref={ref} className={`space-y-2 ${className}`} {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={`${baseStyles} ${variantStyles.text}`}
              style={{
                width: index === lines - 1 ? "75%" : "100%",
                height: size.height,
              }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        style={size}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

// Pre-built skeleton compositions
export const SkeletonCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4 ${className}`}
        {...props}
      >
        <div className="flex items-center gap-4">
          <Skeleton variant="avatar" />
          <div className="flex-1 space-y-2">
            <Skeleton width="40%" />
            <Skeleton width="60%" />
          </div>
        </div>
        <Skeleton lines={3} />
        <div className="flex gap-2">
          <Skeleton variant="button" width="80px" />
          <Skeleton variant="button" width="80px" />
        </div>
      </div>
    );
  }
);

SkeletonCard.displayName = "SkeletonCard";

export const SkeletonTableRow = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-center gap-4 p-4 border-b border-slate-700/50 ${className}`}
        {...props}
      >
        <Skeleton variant="circle" width={32} height={32} />
        <Skeleton width="25%" />
        <Skeleton width="20%" />
        <Skeleton width="15%" />
        <Skeleton width="10%" />
      </div>
    );
  }
);

SkeletonTableRow.displayName = "SkeletonTableRow";

export const SkeletonList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { count?: number }>(
  ({ className = "", count = 5, ...props }, ref) => {
    return (
      <div ref={ref} className={`space-y-3 ${className}`} {...props}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton variant="circle" width={40} height={40} />
            <div className="flex-1 space-y-2">
              <Skeleton width="60%" />
              <Skeleton width="40%" />
            </div>
          </div>
        ))}
      </div>
    );
  }
);

SkeletonList.displayName = "SkeletonList";

// Grant card skeleton
export const SkeletonGrantCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4 ${className}`}
        {...props}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1 space-y-2">
            <Skeleton width="70%" height={24} />
            <Skeleton width="40%" />
          </div>
          <Skeleton variant="button" width="60px" height={28} />
        </div>
        <Skeleton lines={2} />
        <div className="flex items-center gap-4">
          <Skeleton width="100px" />
          <Skeleton width="80px" />
          <Skeleton width="120px" />
        </div>
        <div className="flex gap-2">
          <Skeleton variant="button" width="100px" />
          <Skeleton variant="button" width="80px" />
        </div>
      </div>
    );
  }
);

SkeletonGrantCard.displayName = "SkeletonGrantCard";
