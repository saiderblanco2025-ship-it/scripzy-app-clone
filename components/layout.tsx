"use client";

import { Button } from "@/componentsui/ui/button";

export default function Layout({
  children,
  title = "Scripzy.app",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-600 text-sm font-bold text-white">
              S
            </div>
            <span className="text-xl font-bold">{title}</span>
          </div>
          <Button variant="outline" size="sm">
            Sign in
          </Button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl p-4">{children}</main>
    </div>
  );
}