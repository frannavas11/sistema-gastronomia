"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toggleProductAvailability } from "@/app/admin/actions";

interface ProductAvailabilityToggleProps {
  productId: string;
  storeId: string;
  initialIsAvailable: boolean;
}

export function ProductAvailabilityToggle({
  productId,
  storeId,
  initialIsAvailable,
}: ProductAvailabilityToggleProps) {
  const [isAvailable, setIsAvailable] = useState(initialIsAvailable);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const nextState = !isAvailable;
    setLoading(true);
    setIsAvailable(nextState);

    const result = await toggleProductAvailability(
      productId,
      storeId,
      nextState,
    );

    if (!result.success) {
      // Revertir si falló
      setIsAvailable(!nextState);
    }

    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all focus:outline-none focus:ring-2 disabled:opacity-50 ${
        isAvailable
          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 focus:ring-emerald-500/30"
          : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-750 hover:text-zinc-300 focus:ring-zinc-600"
      }`}
      title={
        isAvailable
          ? "Hacé clic para pausar este producto de la carta"
          : "Hacé clic para habilitar este producto en la carta"
      }
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
      ) : (
        <span
          className={`w-2 h-2 rounded-full transition-colors ${
            isAvailable ? "bg-emerald-400" : "bg-rose-500"
          }`}
        />
      )}
      <span>{isAvailable ? "Disponible" : "Agotado"}</span>
    </button>
  );
}

