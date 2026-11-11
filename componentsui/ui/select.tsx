"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface SelectValueProps {
  value: string;
  children: React.ReactNode;
}

export interface SelectProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full rounded-md border border-input bg-background py-1.5 pl-8 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "data-[state=open]:bg-accent/80"
        )}
        {...props}
      >
        <Slot
          asChild
          placement="bottom-start"
          className={cn("absolute left-0 top-full w-64 rounded-md border bg-popover p-1 shadow-md")}
        >
          {children}
        </Slot>
      </div>
    );
  }
);

Select.displayName = "Select";

/** Select Trigger - renders the current selected value */
export const SelectTrigger = React.forwardRef<
HTMLDivElement,
React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex h-10 w-full items-center rounded-md border border-input bg-transparent py-1 pl-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", "data-[state=open]:bg-accent/80")}
      {...props}
    >
      {children}
    </div>
  );
});

SelectTrigger.displayName = "SelectTrigger";

/** Select Content - the dropdown panel */
export const SelectContent = React.forwardRef<
HTMLDivElement,
React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <Slot
      asChild
      placement="bottom-start"
      ref={ref}
      className={cn(
        "absolute z-50 w-64 rounded-md border bg-popover p-1 shadow-md",
        "data-[state=open]:bg-accent/80",
        className
      )}
      {...props}
    >
      {children}
    </Slot>
  );
});

SelectContent.displayName = "SelectContent";

/** Select Item - individual option */
export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, value, children, ...props }, ref) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    return (
      <Slot
        rootRef={ref}
        wrapperRef={ref}
        mount={mounted}
        className={cn(
          "relative flex cursor-default items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:outline-none focus:bg-accent/5",
          "data-[value]",
          dataAttribute(value),
          "data-[state=checked]:bg-accent/5",
          "data-[state=checked]:text-accent-foreground"
        )}
        onClick={({ currentTarget }: { currentTarget: Element }) => {
          // Select the item and close
          onClick?.(value);
        }}
      >
        {children}
      </Slot>
    );
  }
);

SelectItem.displayName = "SelectItem";

/** Helper to create data attribute for selected state */
function dataAttribute(value: string) {
  return `data-[value=${value}]`;
}