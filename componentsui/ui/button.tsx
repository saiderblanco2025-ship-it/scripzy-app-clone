"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default:
    "bg-violet-600 text-white hover:bg-violet-700 shadow-sm",
  secondary:
    "bg-amber-500 text-violet-950 hover:bg-amber-600 shadow-sm",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  outline:
    "border border-slate-600 bg-transparent text-slate-100 hover:bg-slate-800",
  ghost: "text-slate-100 hover:bg-slate-800",
};

const sizes = {
  default: "h-10 px-4 py-2",
  sm: "h-8 px-3 text-xs",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";