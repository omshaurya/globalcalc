"use client";
import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef, useState } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  tooltip?: string;
  prefix?: string;
  suffix?: string;
  error?: string;
  showSlider?: boolean;
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, tooltip, prefix, suffix, error, showSlider, sliderMin = 0, sliderMax = 100, sliderStep = 1, onChange, value, ...props }, ref) => {
    const [showTip, setShowTip] = useState(false);
    const [focused, setFocused] = useState(false);

    const numVal = typeof value === "string" ? parseFloat(value) : (value as number) || 0;
    const sliderPct = Math.min(100, Math.max(0, ((numVal - sliderMin) / (sliderMax - sliderMin)) * 100));

    return (
      <div className="space-y-1.5">
        {label && (
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{label}</label>
            {tooltip && (
              <div className="relative">
                <button
                  type="button"
                  className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
                  onMouseEnter={() => setShowTip(true)}
                  onMouseLeave={() => setShowTip(false)}
                  aria-label="Help"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </button>
                {showTip && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-52 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-xs p-3 shadow-xl leading-relaxed">
                    {tooltip}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--foreground)]" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className={cn(
          "flex items-center rounded-xl border-2 bg-[var(--card)] transition-all duration-200",
          focused
            ? "border-[var(--primary)] shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
            : "border-[var(--border)] hover:border-[var(--muted-foreground)]",
          error && "border-red-500 focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
        )}>
          {prefix && (
            <span className={cn(
              "pl-3 pr-1.5 text-sm font-medium select-none transition-colors",
              focused ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
            )}>{prefix}</span>
          )}
          <input
            ref={ref}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={cn(
              "flex-1 bg-transparent py-2.5 text-sm font-semibold text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] placeholder:font-normal focus:outline-none",
              prefix ? "pl-0 pr-3" : "px-3",
              suffix && "pr-0",
              className,
            )}
            {...props}
          />
          {suffix && (
            <span className={cn(
              "pr-3 pl-1.5 text-sm font-medium select-none transition-colors",
              focused ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
            )}>{suffix}</span>
          )}
        </div>

        {showSlider && (
          <div className="pt-1">
            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              step={sliderStep}
              value={numVal}
              onChange={onChange}
              style={{ "--value": `${sliderPct}%` } as React.CSSProperties}
              className="w-full"
            />
          </div>
        )}
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";
export default Input;
