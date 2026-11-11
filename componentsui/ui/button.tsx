"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  hasLoader?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", hasLoader = false, ...props }, ref ) => {
    const [mount, setMount] = React.useState(false);

    React.useEffect(() => {
      setMount(true);
    }, []);

    return (
      <Slot rootRef={ref} wrapperRef={ref} mount={mount} className={className}>
        <button
          className=`relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${cn(
            "inline-flex items-center justify-center rounded-md border border-transparent bg-primary-foreground text-primary-600 hover:bg-primary-600/90 ",
            variant === "default"
              ? "hover:bg-primary-600/90"
              : variant === "secondary"
                ? "border border-input bg-background hover:bg-accent/80"
                : variant === "destructive"
                  ? "hover:bg-red-600/90"
                  : variant === "outline"
                    ? "border border-input bg-transparent hover:bg-accent/80"
                    : variant === "ghost"
                      ? "hover:bg-accent/80"
                      : ""
          )} ${cn(
            "disabled:opacity-50 disabled:pointer-events-none",
            `h-${size === "icon" ? 10 : size === "sm" ? 8 : size === "lg" ? 12 : 10} w-${size === "icon" ? 10 : size === "sm" ? 8 : size === "lg" ? 12 : 10} ${size === "icon" ? "flex items-center justify-center" : ""}`
          )}`
          type={props.type}
          disabled={props.disabled}
          {...props}
        >
          {hasLoader ? (
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-current border-t-0 mr-2"></span>
          ) : null}
          {children}
        </button>
      </Slot>
    );
  }
);

Button.displayName = "Button";