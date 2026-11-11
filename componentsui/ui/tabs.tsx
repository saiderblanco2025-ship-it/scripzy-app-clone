"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

const TabsContext = React.createContext<{
  active: string;
  setActive: (v: string) => void;
} | null>(null);

export function Tabs({ defaultValue, children, className }: TabsProps) {
  const [active, setActive] = React.useState(defaultValue);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-1 rounded-md bg-slate-900/60 p-1">{children}</div>;
}

export function TabsTrigger({ value, children }: TabsTriggerProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) return null;
  const isActive = ctx.active === value;
  return (
    <button
      type="button"
      onClick={() => ctx.setActive(value)}
      className={cn(
        "flex-1 rounded px-3 py-1.5 text-sm font-medium transition-colors",
        isActive ? "bg-violet-600 text-white" : "text-slate-300 hover:bg-slate-800"
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }: TabsContentProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx || ctx.active !== value) return null;
  return <div className="pt-3">{children}</div>;
}