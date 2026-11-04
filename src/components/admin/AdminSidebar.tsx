"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Settings,
  Store,
  User,
} from "lucide-react";
import { LogoutButton } from "./LogoutButton";

interface AdminSidebarProps {
  userEmail?: string | null;
}

const NAV_ITEMS = [
  {
    label: "Dashboard",
    sublabel: "Inicio y métricas",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Pedidos",
    sublabel: "Historial y activos",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Menú",
    sublabel: "Categorías y productos",
    href: "/admin/menu",
    icon: UtensilsCrossed,
  },
  {
    label: "Configuración",
    sublabel: "Datos del local y tema",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* 1. Header superior exclusivo para Mobile (hasta md) */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#541923] text-white border-b border-[#42131C] sticky top-0 z-30 shadow-xs">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white">
            <Store className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-normal text-base text-white tracking-wide">
              Panel Gastro
            </span>
            <span className="text-[10px] text-white/70">
              Administración
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-white/80 truncate max-w-[140px]">
            {userEmail}
          </span>
        </div>
      </header>

      {/* 2. Barra de Navegación Inferior Móvil Real (ergonómica, accesible con pulgar) */}
      <nav
        aria-label="Navegación móvil"
        className="fixed bottom-0 inset-x-0 bg-[#541923] text-white border-t border-[#42131C] z-40 flex items-center justify-around py-1.5 px-2 safe-bottom md:hidden shadow-lg shadow-black/25"
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 min-h-[48px] flex flex-col items-center justify-center gap-1 rounded-xl transition-colors select-none ${
                active
                  ? "bg-white/15 text-white font-semibold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-[10px] leading-tight tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* 3. Sidebar fijo de Desktop en bordó profundo (md en adelante) */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-[#541923] text-white border-r border-[#42131C] p-5 sticky top-0 h-screen select-none justify-between">
        <div>
          {/* Header del Sidebar */}
          <div className="pb-5 border-b border-white/15 mb-6">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-serif font-normal text-lg text-white tracking-wide truncate">
                  Panel Gastro
                </span>
                <span className="text-xs text-white/70 truncate">
                  Gestión artesanal
                </span>
              </div>
            </Link>
          </div>

          {/* Navegación Desktop */}
          <nav className="space-y-1.5">
            <div className="px-3 pb-2 text-[11px] font-semibold text-white/50 tracking-wider">
              Navegación
            </div>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                    active
                      ? "bg-white/15 text-white font-semibold shadow-xs"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer del Sidebar Desktop */}
        <div className="pt-4 border-t border-white/15 space-y-3">
          <div className="p-3 rounded-xl bg-white/10 border border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {userEmail || "Dueño del local"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#249653]" />
                  <span className="text-[10px] text-white/70">
                    En línea
                  </span>
                </div>
              </div>
            </div>
          </div>

          <LogoutButton
            variant="outline"
            className="w-full text-xs py-2.5 bg-white/5 hover:bg-white/10 text-white border-white/20 min-h-[44px]"
          />
        </div>
      </aside>
    </>
  );
}
