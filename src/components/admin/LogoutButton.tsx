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
      "bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500/50",
    outline:
      "border border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white focus:ring-zinc-600",
    ghost:
      "text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 focus:ring-rose-500/30",
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : showIcon ? (
        <LogOut className="w-4 h-4 text-current" />
      ) : null}
      <span>{loading ? "Cerrando..." : label}</span>
    </button>
  );
}

