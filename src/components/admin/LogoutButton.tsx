"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  className?: string;
  variant?: "danger" | "outline" | "ghost" | "onDark";
  label?: string;
}

const VARIANT_STYLES = {
  danger:
    "bg-surface hover:bg-error-soft text-text-primary hover:text-error border border-border-strong hover:border-error-border",
  outline: "bg-surface hover:bg-background text-text-primary border border-border-strong",
  ghost: "text-text-secondary hover:text-text-primary hover:bg-surface-2",
  onDark: "text-white/75 hover:text-white hover:bg-white/10 border border-white/15",
} as const;

export function LogoutButton({ className, variant = "danger", label = "Cerrar sesión" }: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await createClient().auth.signOut();
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      // cn() (tailwind-merge) resuelve conflictos: antes `className` se concatenaba y
      // chocaba con los colores de la variante (el resultado dependía del orden del CSS).
      className={cn(
        "inline-flex items-center justify-center gap-2 px-3.5 min-h-[40px] text-xs sm:text-sm font-medium rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
      <span>{loading ? "Cerrando…" : label}</span>
    </button>
  );
}
