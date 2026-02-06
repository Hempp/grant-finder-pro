"use client";

import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "outline" | "gradient";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  loadingText?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const Spinner = ({ className = "" }: { className?: string }) => (
  <svg
    className={`animate-spin h-4 w-4 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      loadingText,
      iconLeft,
      iconRight,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2 font-medium
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      active:scale-[0.98]
    `;

    const variants = {
      primary: `
        bg-emerald-500 hover:bg-emerald-400 text-white
        focus:ring-emerald-500
        shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40
      `,
      secondary: `
        bg-slate-700 hover:bg-slate-600 text-white
        border border-slate-600 hover:border-slate-500
        focus:ring-slate-500
      `,
      ghost: `
        hover:bg-slate-800 text-slate-300 hover:text-white
        focus:ring-slate-500
      `,
      danger: `
        bg-red-500 hover:bg-red-400 text-white
        focus:ring-red-500
        shadow-lg shadow-red-500/25 hover:shadow-red-500/40
      `,
      success: `
        bg-green-500 hover:bg-green-400 text-white
        focus:ring-green-500
        shadow-lg shadow-green-500/25 hover:shadow-green-500/40
      `,
      outline: `
        bg-transparent border-2 border-emerald-500 text-emerald-400
        hover:bg-emerald-500/10 hover:text-emerald-300
        focus:ring-emerald-500
      `,
      gradient: `
        bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500
        hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400
        text-white focus:ring-emerald-500
        shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40
        animate-gradient bg-[length:200%_100%]
      `,
    };

    const sizes = {
      xs: "px-2 py-1 text-xs rounded-md",
      sm: "px-3 py-1.5 text-sm rounded-lg",
      md: "px-4 py-2 text-sm rounded-lg",
      lg: "px-6 py-3 text-base rounded-xl",
      xl: "px-8 py-4 text-lg rounded-xl",
    };

    const spinnerSizes = {
      xs: "h-3 w-3",
      sm: "h-3.5 w-3.5",
      md: "h-4 w-4",
      lg: "h-5 w-5",
      xl: "h-6 w-6",
    };

    return (
      <button
        ref={ref}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner className={spinnerSizes[size]} />
            <span>{loadingText || "Loading..."}</span>
          </>
        ) : (
          <>
            {iconLeft && <span className="shrink-0">{iconLeft}</span>}
            {children}
            {iconRight && <span className="shrink-0">{iconRight}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

// Icon-only button variant
interface IconButtonProps extends Omit<ButtonProps, "iconLeft" | "iconRight" | "loadingText"> {
  icon: ReactNode;
  "aria-label": string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className = "", variant = "ghost", size = "md", icon, isLoading = false, ...props }, ref) => {
    const iconSizes = {
      xs: "p-1",
      sm: "p-1.5",
      md: "p-2",
      lg: "p-3",
      xl: "p-4",
    };

    const spinnerSizes = {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
      xl: "h-7 w-7",
    };

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={`${iconSizes[size]} aspect-square ${className}`}
        isLoading={false}
        {...props}
      >
        {isLoading ? <Spinner className={spinnerSizes[size]} /> : icon}
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";
