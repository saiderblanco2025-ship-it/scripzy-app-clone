"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
}

export interface AlertTitleProps extends React.HTMLAttributes<HTMLTitleElement> {
  className?: string;
}

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg p-4",
          variant === "destructive"
            ? "bg-red-500/10 text-red-400"
            : "bg-primary/5 text-primary-400",
          className
        )}
        {...props}
      />
    );
  }
);
Alert.displayName = "Alert";

/** AlertTitle - the alert title */
export const AlertTitle = React.forwardRef<HTMLTitleElement, AlertTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <title ref={ref} className={cn("font-medium text-lg", className)} {...props}>
        {children}
      </title>
    );
  }
);
AlertTitle.displayName = "AlertTitle";

/** AlertDescription - the alert description */
export const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p ref={ref} className={cn("mt-1 text-sm", className)} {...props}>
        {children}
      </p>
    );
  }
);
AlertDescription.displayName = "AlertDescription";