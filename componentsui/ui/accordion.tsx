"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

/** Acordeón simple con un solo nivel */
export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  className,
}: AccordionItemProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className={cn("w-full rounded-md border border-slate-700 bg-slate-900/60", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-100 hover:bg-slate-800"
      >
        <span>{title}</span>
        <span className="text-slate-400">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-4 pb-4 text-sm text-slate-300">{children}</div>}
    </div>
  );
}