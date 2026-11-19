"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { getCurrentTheme, setTheme, subscribeToTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  /**
   * - `default`: sobre superficies del tema (encabezado de la landing).
   * - `onDark`: sobre el bordó del panel admin.
   * - `floating`: botón con fondo propio, sobre imágenes de portada.
   */
  variant?: "default" | "onDark" | "floating";
  className?: string;
}

const VARIANT_STYLES = {
  default:
    "text-text-secondary hover:text-text-primary hover:bg-surface-2 focus-visible:ring-brand",
  onDark:
    "text-white/80 hover:text-white hover:bg-white/10 focus-visible:ring-white",
  floating:
    "bg-surface/85 backdrop-blur-md border border-border text-text-primary hover:bg-surface shadow-sm focus-visible:ring-brand",
} as const;

export function ThemeToggle({ variant = "default", className }: ThemeToggleProps) {
  // En el servidor no se conoce el tema: se asume claro y los íconos se resuelven por CSS (dark:)
  const theme = useSyncExternalStore(subscribeToTheme, getCurrentTheme, () => "light" as const);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      className={cn(
        "relative inline-flex items-center justify-center w-11 h-11 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2",
        VARIANT_STYLES[variant],
        className
      )}
    >
      {/* Se muestra el ícono del modo al que se va a cambiar */}
      <Moon className="w-[18px] h-[18px] dark:hidden" aria-hidden="true" />
      <Sun className="w-[18px] h-[18px] hidden dark:block" aria-hidden="true" />
    </button>
  );
}
