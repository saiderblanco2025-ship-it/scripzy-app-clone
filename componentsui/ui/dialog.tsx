"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface DialogTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
}

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface DialogTitleProps extends React.HTMLAttributes<HTMLTitleElement> {
  className?: string;
}

export const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ className, open: controlledOpen, onOpenChange, children, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(controlledOpen ?? false);

    React.useEffect(() => {
      if (controlledOpen !== undefined) {
        setIsOpen(controlledOpen);
      }
    }, [controlledOpen]);

    return (
      <Slot
        asChild
        ref={ref}
        mount={isOpen}
        className={cn(
          "fixed inset-0 z-50",
          className
        )}
      >
        <div
          className={cn(
            "fixed inset-0 z-50 transition-opacity",
            "data-[state=open]:opacity-100",
            "data-[state=closed]:opacity-0"
          )}
        >
          <div
            className={cn(
              "absolute top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm",
            )}
          >
            {/* Background click to close */}
            <div
              onClick={(e: React.MouseEvent) => {
                if (e.target === e.currentTarget) {
                  setIsOpen(false);
                  onOpenChange?.(false);
                }
              }}
            />
          </div>

          <Slot
            asChild
            placement="center"
            className={cn(
              "relative transform overflow-hidden rounded-lg bg-white px-4 py-6 shadow-lg text-left transition-all data-[state=closed]:scale-95 data-[state=closed]:duration-200",
              "data-[state=open]:scale-100 data-[state=open]:duration-300",
              className
            )}
          >
            {children}
          </Slot>
        </div>
      </Slot>
    );
  }
);
Dialog.displayName = "Dialog";

/** DialogTrigger - the element that opens the dialog */
export const DialogTrigger = React.forwardRef<HTMLDivElement, DialogTriggerProps>(
  ({ className, asChild = true, children, ...props }, ref) => {
    return (
      <Slot
        asChild
        mount={true}
        className={cn(className)}
        ref={ref}
      >
        {asChild ? (
          <div>{children}</div>
        ) : (
          <div>{children}</div>
        )}
      </Slot>
    );
  }
);
DialogTrigger.displayName = "DialogTrigger";

/** DialogContent - the dialog panel */
export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, open: controlledOpen, children, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(controlledOpen ?? true);

    return (
      <Slot
        asChild
        mount={isOpen}
        className={cn(
          "relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 shadow-lg text-left transition-all sm:rounded-2xl",
          "data-[state=closed]:scale-95 data-[state=closed]:duration-200",
          "data-[state=open]:scale-100 data-[state=open]:duration-300",
          className
        )}
        {...props}
      >
        {children}
      </Slot>
    );
  }
);
DialogContent.displayName = "DialogContent";

/** DialogHeader - the dialog header section */
export const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex flex-col space-y-2 pt-2", className)} {...props}>
        {children}
      </div>
    );
  }
);
DialogHeader.displayName = "DialogHeader";

/** DialogTitle - the dialog title */
export const DialogTitle = React.forwardRef<HTMLTitleElement, DialogTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <title ref={ref} className={cn("text-lg font-semibold", className)} {...props}>
        {children}
      </title>
    );
  }
);
DialogTitle.displayName = "DialogTitle";