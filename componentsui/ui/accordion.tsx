"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface AccordionTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const Accordion = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {children}
      </div>
    );
  }
);
Accordion.displayName = "Accordion";

/** Accordion Item - individual accordion section */
export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, defaultOpen = false, open: controlledOpen, onOpenChange, ...props }, ref) => {
    const [open, setOpen] = React.useState<boolean>(!!defaultOpen);
    const isOpen = controlledOpen !== undefined ? controlledOpen : open;

    return (
      <div
        ref={ref}
        className={cn("w-full rounded-md border bg-background", "data-[open=true]:shadow-sm")}
        {...props}
      >
        <Slot
          asChild
          placement="bottom"
          className={cn("w-full")}
        >
          <div
            role="button"
            aria-controls={`accordion-item-${value}`}
            aria-expanded={isOpen}
            className={cn(
              "flex w-full rounded-md border bg-background p-2.5 pr-8 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent/5",
              "data-[open=true]:bg-accent/5",
              "data-[state=open]:bg-accent/5",
              className
            )}
          >
            {children}
          </div>
        </Slot>
        <div
          id={`accordion-item-${value}`}
          role="region"
          aria-labelledby={`accordion-item-${value}-header`}
          className={cn(
            "max-h-96 overflow-hidden rounded-md bg-transparent pt-1 transition-[max-height] duration-200 ease-out",
            "data-[open=true]:max-h-[1000px]",
            "data-[open=false]:max-h-0"
          )}
        >
          <div className="p-2.5">{children}</div>
        </div>
      </div>
    );
  }
);

AccordionItem.displayName = "AccordionItem";

/** Accordion Trigger - the clickable header */
export const AccordionTrigger = React.forwardRef<HTMLDivElement, AccordionTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full rounded-md border bg-background p-2.5 pr-8 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent/5",
          "data-[open=true]:bg-accent/5",
          className
        )}
      >
        {children}
      </div>
    );
  }
);

AccordionTrigger.displayName = "AccordionTrigger";

/** Accordion Content - the collapsible body */
export const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, value, ...props }, ref) => {
    return (
      <div
        ref={ref}
        id={`accordion-item-${value}-content`}
        role="region"
        aria-labelledby={`accordion-item-${value}-header`}
        className={cn(
          "max-h-96 overflow-hidden rounded-md bg-transparent pt-1 transition-[max-height] duration-200 ease-out",
          "data-[open=true]:max-h-[1000px]",
          "data-[open=false]:max-h-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AccordionContent.displayName = "AccordionContent";