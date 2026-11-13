"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Sparkles,
  Compass,
  ImageIcon,
  BookOpen,
  Crown,
  FileText,
  TrendingUp,
} from "lucide-react";
import { getUserBalance } from "@/lib/supabase";
import { UserMenu } from "@/components/user-menu";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
  { href: "/script-lab", label: "Script Lab", icon: Sparkles, key: "script-lab" },
  { href: "/nichos", label: "Buscador de Nichos", icon: Compass, key: "nichos" },
  { href: "/miniaturas", label: "Miniaturas", icon: ImageIcon, key: "miniaturas" },
  { href: "/patrones", label: "Top Patterns", icon: TrendingUp, key: "patrones" },
  { href: "/recursos", label: "Recursos", icon: BookOpen, key: "recursos" },
  { href: "/pricing", label: "Planes", icon: Crown, key: "pricing" },
];

function formatCredits(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(".0", "") + "K";
  return String(n);
}

export function AppShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  const [balance, setBalance] = useState<{
    script_character_credits: number;
    thumbnail_credits: number;
  } | null>(null);

  useEffect(() => {
    let activeQuery = true;
    getUserBalance().then((b) => {
      if (!activeQuery) return;
      if (b) {
        setBalance({
          script_character_credits: b.script_character_credits,
          thumbnail_credits: b.thumbnail_credits,
        });
      }
    });
    return () => {
      activeQuery = false;
    };
  }, []);

  const linkCls = (itemKey: string) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
      active === itemKey
        ? "bg-violet-600/20 font-semibold text-white"
        : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950 text-slate-100">
      {/* ===== Sidebar (desktop) ===== */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col justify-between border-r border-slate-800 bg-slate-950/95 px-3 py-4 lg:flex">
        <div>
          {/* Logo */}
          <Link href="/" className="mb-6 flex items-center gap-2 px-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-600 text-sm font-bold text-white">
              S
            </span>
            Scripzy
          </Link>

          {/* Navegación */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link key={item.key} href={item.href} className={linkCls(item.key)}>
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Créditos siempre visibles */}
        <div className="space-y-2">
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
            <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              <FileText className="h-3 w-3" /> Créditos de guion
            </p>
            <p className="text-lg font-bold text-white">
              {balance ? formatCredits(balance.script_character_credits) : "…"}
              <span className="ml-1 text-[10px] font-normal text-slate-500">
                caracteres
              </span>
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
            <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              🖼️ Miniaturas
            </p>
            <p className="text-lg font-bold text-white">
              {balance ? balance.thumbnail_credits : "…"}
              <span className="ml-1 text-[10px] font-normal text-slate-500">
                créditos
              </span>
            </p>
          </div>
          <div className="px-1">
            <UserMenu />
          </div>
        </div>
      </aside>

      {/* ===== Barra superior (mobile) ===== */}
      <div className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-600 text-sm font-bold text-white">
              S
            </span>
            Scripzy
          </Link>
          <UserMenu />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 text-sm">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 ${
                active === item.key
                  ? "bg-violet-600/20 font-semibold text-white"
                  : "text-slate-400"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* ===== Contenido ===== */}
      <div className="lg:pl-60">{children}</div>
    </div>
  );
}
