"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
}

export const Input = React.forwardRef<
HTMLInputElement,
InputProps
>(({ className, placeholder, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "data-[state=open]:bg-accent/80"
      )}
      {...props}
      placeholder={placeholder}
    />
  );
});
Input.displayName = "Input";