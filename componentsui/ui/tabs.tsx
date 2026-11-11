"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultIndex?: number;
  index?: number;
  onIndexChange?: (index: number) => void;
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultIndex?: number;
  index?: number;
  onIndexChange?: (index: number) => void;
}

export interface TabsTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  value: string;
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, children, defaultIndex = 0, index: controlledIndex, onIndexChange, ...props }, ref) => {
    const [index, setIndex] = React.useState(defaultIndex);
    const activeIndex = controlledIndex !== undefined ? controlledIndex : index;

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {React.Children.toArray(children).map((child, i) => {
          // Check if child is TabsList, TabsTrigger, or TabsContent
          if (!React.isValidElement(child)) return null;
          
          const childType = child.type.displayName || "";
          
          if (childType === "TabsList") {
            return React.cloneElement(child, {
              ...child.props,
              "data-index": String(i),
            });
          }
          
          if (childType === "TabsTrigger") {
            return React.cloneElement(child, {
              ...child.props,
              "data-value": String(child.props.value || i),
              "aria-controls": `tabs-content-${child.props.value || i}`,
            });
          }
          
          if (childType === "TabsContent") {
            return React.cloneElement(child, {
              ...child.props,
              "data-value": String(child.props.value || i),
              "aria-labelledby": `tabs-trigger-${child.props.value || i}`,
            });
          }
          
          return child;
        })}
      </div>
    );
  }
);
Tabs.displayName = "Tabs";

/** TabsList - the horizontal navigation */
export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, defaultIndex, index: controlledIndex, onIndexChange, ...props }, ref) => {
    const [activeIndex, setActiveIndex] = React.useState(defaultIndex ?? 0);
    const finalIndex = controlledIndex ?? activeIndex;

    return (
      <div
        ref={ref}
        className={cn(
          "flex h-10 w-full overflow-x-auto rounded-md bg-background px-1",
          className
        )}
        {...props}
      >
        {React.Children.toArray(children).map((child, i) => {
          if (!React.isValidElement(child)) return null;
          
          return React.cloneElement(child, {
            ...child.props,
            "data-index": String(i),
            "aria-selected": String(i === finalIndex),
            "role": "button",
            tabIndex: i === finalIndex ? 0 : -1,
            onClick: (e: React.MouseEvent) => {
              e.preventDefault();
              setActiveIndex(i);
              onIndexChange?.(i);
            },
          });
        })}
      </div>
    );
  }
);
TabsList.displayName = "TabsList";

/** TabsTrigger - individual tab button */
export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const [activeIndex, setActiveIndex] = React.useState(0);
    const finalIndex = activeIndex;

    return (
      <button
        ref={ref}
        className={cn(
          "flex-1 inline-flex items-center justify-center rounded-md px-2 py-1.5 text-sm font-medium focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "transition-colors",
          finalIndex === Number(value) ? "bg-primary-foreground text-primary-600" : "text-muted-foreground hover:text-foreground",
          "data-[state=active]:bg-primary-foreground/10",
          "data-[state=active]:text-primary-600",
          className
        )}
        onClick={() => setActiveIndex(Number(value))}
        disabled={false}
        type="button"
        aria-controls={`tabs-content-${value}`}
        aria-selected={String(finalIndex === Number(value))}
      >
        {children}
      </button>
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

/** TabsContent - the tab panel content */
export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const [activeIndex, setActiveIndex] = React.useState(0);

    return (
      <div
        ref={ref}
        className={cn(
          "pt-2 pb-3 sm:pt-6 pb-8 overflow-x-auto divide-y divide-border/50",
          "flex flex-col sm:flex-row gap-2",
          "rounded-md bg-border",
          `data-[state=active]:bg-background ${value === "0" ? "block" : "hidden"}`,
          className
        )}
      >
        {React.Children.toArray(children).map((child, i) => {
          if (!React.isValidElement(child)) return null;
          
          return React.cloneElement(child, {
            ...child.props,
            "data-value": String(child.props.value || i),
            "aria-labelledby": `tabs-trigger-${child.props.value || i}`,
          });
        })}
      </div>
    );
  }
);
TabsContent.displayName = "TabsContent";