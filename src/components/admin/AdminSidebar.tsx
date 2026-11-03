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
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-40">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
            <Store className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-slate-900">
              Panel Gastro
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Administración
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
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
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 3. Menú móvil desplegable */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 z-50 flex flex-col justify-between p-4 transform transition-transform duration-200 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo en drawer móvil */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                <Store className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-slate-900">
                  Panel Gastro
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Administración
                </span>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navegación móvil */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-slate-100 text-slate-900 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${active ? "text-slate-900" : "text-slate-400"}`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sección de usuario y logout móvil */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2.5 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-900 truncate">
                {userEmail || "Usuario"}
              </p>
              <span className="text-[10px] text-emerald-600 font-medium">
                ● En línea
              </span>
            </div>
          </div>
          <LogoutButton variant="outline" className="w-full" />
        </div>
      </div>

      {/* 4. Sidebar fijo de Desktop (md en adelante) */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-slate-200 p-4 sticky top-0 h-screen select-none">
        {/* Brand Header */}
        <div className="pb-5 border-b border-slate-200 mb-5">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white">
              <Store className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-slate-900 tracking-tight">
                Panel Gastro
              </span>
              <span className="text-xs text-slate-500">
                Gestión de tu local
              </span>
            </div>
          </Link>
        </div>

        {/* Navegación Principal Desktop */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400">
            Navegación
          </div>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active ? "text-slate-900" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer del Sidebar: Perfil de usuario y botón de logout */}
        <div className="pt-4 border-t border-slate-200">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-900 truncate">
                  {userEmail || "Dueño del comercio"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-slate-500">
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
