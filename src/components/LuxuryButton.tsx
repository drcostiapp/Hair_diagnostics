"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "outline" | "danger";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

export const LuxuryButton = forwardRef<HTMLButtonElement, Props>(function LuxuryButton(
  { className, variant = "primary", size = "md", children, ...rest },
  ref,
) {
  const base =
    "inline-flex items-center justify-center rounded-luxe font-medium tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-champagne/40 focus:ring-offset-ivory";
  const sizes = {
    sm: "px-4 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-sm",
  };
  const variants: Record<Variant, string> = {
    primary:
      "bg-anchor text-ivory hover:bg-anchor-soft shadow-quiet hover:shadow-hover border border-anchor",
    ghost: "bg-transparent text-anchor hover:bg-linen/40",
    outline:
      "bg-transparent text-anchor border border-anchor/25 hover:border-anchor/60 hover:bg-ivory-warm",
    danger:
      "bg-[#3E1F1F] text-ivory hover:bg-[#5a2c2c] border border-[#3E1F1F] shadow-quiet",
  };

  return (
    <button
      ref={ref}
      className={cn(base, sizes[size], variants[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
});
