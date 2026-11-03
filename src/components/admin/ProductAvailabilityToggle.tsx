"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
      setIsAvailable(!nextState);
      toast.error(result.error || "No se pudo actualizar el estado.");
    } else {
      toast.success(
        nextState
          ? "Producto habilitado en la carta."
          : "Producto pausado de la carta.",
      );
    }

    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 ${
        isAvailable
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
          : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
      }`}
      title={
        isAvailable
          ? "Hacé clic para pausar este producto de la carta"
          : "Hacé clic para habilitar este producto en la carta"
      }
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin text-current" />
      ) : (
        <span
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            isAvailable ? "bg-emerald-500" : "bg-slate-400"
          }`}
        />
      )}
      <span>{isAvailable ? "Disponible" : "Pausado"}</span>
    </button>
  );
}
