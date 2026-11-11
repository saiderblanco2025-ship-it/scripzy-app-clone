"use client";

import { useEffect } from "react";
import { useSupabase } from "@/lib/supabase";

export default function Layout({
  children,
  title = "Scripzy.app",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const { user } = useSupabase();

  useEffect(() => {
    // Track page view or handle auth state changes
    console.log("Page loaded:", title, "User:", user?.email);
  }, [user, title]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <svg
                className="h-5 w-5 text-primary-foreground"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 1l...
</path>
              </svg>
            </div>
            <span className="text-xl font-bold">Scripzy</span>
          </div>
          
          {/* User menu */}
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user.email?.split("@")[0] || "User"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // TODO: Sign out
                }
              >
                Sign out
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Sign in
              }
            >
              Sign in
            </Button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4">
        {children}
      </main>
    </div>
  );
}