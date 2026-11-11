"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success";
}

export function Alert({ className, variant = "default", ...props }: AlertProps) {
  const variantClasses = {
    default: "bg-violet-500/10 text-violet-200 border-violet-500/30",
    destructive: "bg-red-500/10 text-red-300 border-red-500/30",
    success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  } as const;

  return (
    <div
      role="alert"
      className={cn("rounded-lg border p-4 text-sm", variantClasses[variant], className)}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <p className={cn("mb-1 font-semibold", className)} {...props} />;
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <div className={cn("text-sm opacity-90", className)} {...props} />;
}