"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface LogoutButtonProps {
  className?: string;
  variant?: "danger" | "outline" | "ghost";
  showIcon?: boolean;
  label?: string;
}

export function LogoutButton({
  className = "",
  variant = "danger",
  showIcon = true,
  label = "Cerrar Sesión",
}: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setLoading(false);
    }
  };

  const variantStyles = {
    danger:
      "bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300 shadow-2xs",
    outline:
      "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs",
    ghost:
      "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
      ) : showIcon ? (
        <LogOut className="w-3.5 h-3.5 text-current" />
      ) : null}
      <span>{loading ? "Cerrando..." : label}</span>
    </button>
  );
}
