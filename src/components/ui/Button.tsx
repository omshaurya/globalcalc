"use client";
import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef, useRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  ripple?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ripple = true, onClick, ...props }, ref) => {
    const innerRef = useRef<HTMLButtonElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLButtonElement>) ?? innerRef;

    function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
      if (ripple && !disabled && !loading) {
        const btn = (resolvedRef as React.RefObject<HTMLButtonElement>).current;
        if (btn) {
          const rect = btn.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height) * 2;
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;
          const rippleEl = document.createElement("span");
          rippleEl.className = "ripple-wave";
          rippleEl.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
          btn.appendChild(rippleEl);
          rippleEl.addEventListener("animationend", () => rippleEl.remove());
        }
      }
      onClick?.(e);
    }

    return (
      <button
        ref={resolvedRef}
        disabled={disabled || loading}
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]",
          "ripple-container",
          {
            "bg-[var(--primary)] text-white hover:opacity-90 shadow-sm hover:shadow-md hover:-translate-y-px": variant === "primary",
            "bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--accent)]": variant === "secondary",
            "border border-[var(--border)] bg-transparent hover:bg-[var(--accent)] text-[var(--foreground)]": variant === "outline",
            "bg-transparent hover:bg-[var(--accent)] text-[var(--foreground)]": variant === "ghost",
            "bg-red-500 text-white hover:bg-red-600": variant === "danger",
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2 text-sm": size === "md",
            "px-6 py-3 text-base": size === "lg",
          },
          className,
        )}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
export default Button;
