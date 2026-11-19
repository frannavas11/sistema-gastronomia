"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Settings, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LogoutButton } from "./LogoutButton";

interface AdminSidebarProps {
  userEmail?: string | null;
  storeName: string | null;
  storeSlug: string | null;
}

const NAV_ITEMS = [
  { label: "Resumen", href: "/admin", icon: LayoutDashboard },
  { label: "Pedidos", href: "/admin/orders", icon: ShoppingBag },
  { label: "Menú", href: "/admin/menu", icon: UtensilsCrossed },
  { label: "Ajustes", href: "/admin/settings", icon: Settings },
];

/** Textura de papel sobre el bordó del sidebar */
const grainStyle = { backgroundImage: "var(--paper-grain)", backgroundSize: "180px" };

export function AdminSidebar({ userEmail, storeName, storeSlug }: AdminSidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <>
      {/* ── Mobile: barra superior ── */}
      <header
        className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-2.5 bg-sidebar text-white border-b border-sidebar-border"
        style={grainStyle}
      >
        <Link href="/admin" className="min-w-0">
          <span className="eyebrow block text-white/55">Panel</span>
          <span className="font-serif text-lg leading-tight truncate block">{storeName ?? "Mi local"}</span>
        </Link>
        <div className="flex items-center gap-1">
          {storeSlug && (
            <Link
              href={`/${storeSlug}`}
              target="_blank"
              aria-label="Ver la carta pública"
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ExternalLink className="w-[18px] h-[18px]" />
            </Link>
          )}
          <ThemeToggle variant="onDark" />
        </div>
      </header>

      {/* ── Mobile: navegación inferior ── */}
      <nav
        aria-label="Navegación del panel"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-sidebar border-t border-sidebar-border safe-bottom shadow-[0_-8px_24px_rgba(0,0,0,0.18)]"
        style={grainStyle}
      >
        <div className="flex items-stretch justify-around px-2 pt-1.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex-1 min-h-[52px] flex flex-col items-center justify-center gap-1 rounded-xl text-[11px] transition-colors ${
                  active ? "text-white font-semibold" : "text-white/60 hover:text-white"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="mobile-nav-active"
                    className="absolute inset-x-3 top-0 h-[2px] rounded-full bg-white"
                  />
                )}
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Desktop: sidebar ── */}
      <aside
        className="hidden md:flex sticky top-0 h-screen w-72 shrink-0 flex-col justify-between bg-sidebar text-white border-r border-sidebar-border px-6 py-8"
        style={grainStyle}
      >
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link href="/admin" className="min-w-0">
              <span className="eyebrow text-white/50">Panel del local</span>
              <span className="mt-1 block font-serif text-3xl leading-[1.05] text-balance">
                {storeName ?? "Mi local"}
              </span>
            </Link>
            <ThemeToggle variant="onDark" className="-mr-2 shrink-0" />
          </div>

          {storeSlug && (
            <Link
              href={`/${storeSlug}`}
              target="_blank"
              className="mt-4 inline-flex items-center gap-1.5 font-serif italic text-sm text-white/70 hover:text-white transition-colors"
            >
              Ver la carta pública
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}

          <div className="my-8 h-px bg-white/15" />

          <nav aria-label="Navegación del panel" className="space-y-1">
            {NAV_ITEMS.map((item, index) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center gap-3 px-3 min-h-[48px] rounded-xl text-sm transition-colors ${
                    active ? "text-white font-semibold" : "text-white/65 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="desktop-nav-active"
                      className="absolute inset-0 rounded-xl bg-white/12 border border-white/10"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <span className="relative font-serif italic text-xs text-white/45 tabular-nums w-5">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Icon className="relative w-4 h-4" />
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3">
          <div className="h-px bg-white/15" />
          <p className="text-xs text-white/55 truncate" title={userEmail ?? undefined}>
            {userEmail}
          </p>
          <LogoutButton variant="onDark" className="w-full" />
        </div>
      </aside>
    </>
  );
}
