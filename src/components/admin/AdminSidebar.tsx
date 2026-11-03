"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Settings,
  Store,
  Menu as MenuIcon,
  X,
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* 1. Header superior exclusivo para Mobile (hasta md) */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-sm shadow-rose-600/30">
            <Store className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-zinc-100">
              Panel Gastro
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              Administración
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <MenuIcon className="w-5 h-5" />
          )}
        </button>
      </header>

      {/* 2. Drawer / Backdrop para Mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 3. Menú móvil desplegable */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-zinc-900 border-r border-zinc-800 z-50 flex flex-col justify-between p-4 transform transition-transform duration-200 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo en drawer móvil */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-sm shadow-rose-600/30">
                <Store className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-zinc-100">
                  Panel Gastro
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Administración
                </span>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navegación móvil */}
          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    active
                      ? "bg-rose-500/15 text-rose-400 font-semibold border border-rose-500/30"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${active ? "text-rose-400" : "text-zinc-400"}`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sección de usuario y logout móvil */}
        <div className="pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-2.5 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-200 truncate">
                {userEmail || "Usuario"}
              </p>
              <span className="text-[10px] text-emerald-400 font-mono">
                ● En línea
              </span>
            </div>
          </div>
          <LogoutButton variant="outline" className="w-full" />
        </div>
      </div>

      {/* 4. Sidebar fijo de Desktop (md en adelante) */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-zinc-900 border-r border-zinc-800 p-4 sticky top-0 h-screen select-none">
        {/* Brand Header */}
        <div className="pb-6 border-b border-zinc-800/80 mb-6">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white shadow-lg shadow-rose-600/25 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-zinc-100 tracking-tight">
                  Panel Gastro
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  SaaS
                </span>
              </div>
              <span className="text-xs text-zinc-400">
                Gestión de tu local
              </span>
            </div>
          </Link>
        </div>

        {/* Navegación Principal Desktop */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Navegación
          </div>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all group ${
                  active
                    ? "bg-rose-500/15 text-rose-400 font-semibold border border-rose-500/30 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active
                        ? "text-rose-400"
                        : "text-zinc-400 group-hover:text-zinc-200"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer del Sidebar: Perfil de usuario y botón de logout */}
        <div className="pt-4 border-t border-zinc-800/80">
          <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-300 flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-200 truncate">
                  {userEmail || "Dueño del comercio"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Sesión activa
                  </span>
                </div>
              </div>
            </div>
          </div>

          <LogoutButton variant="outline" className="w-full text-xs py-2" />
        </div>
      </aside>
    </>
  );
}

