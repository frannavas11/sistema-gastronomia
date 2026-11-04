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
      toast.error(result.error || "No se pudo actualizar la disponibilidad.");
    } else {
      toast.success(
        nextState
          ? "Producto activo en la carta."
          : "Producto marcado como agotado.",
      );
    }

    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      aria-label={isAvailable ? "Pausar producto" : "Activar producto"}
      className="min-h-[44px] inline-flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#78232F] rounded-xl px-2 py-1 select-none disabled:opacity-50 transition-colors"
      title={isAvailable ? "Hacé clic para marcar como agotado" : "Hacé clic para activar en la carta"}
    >
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
          isAvailable ? "bg-[#249653]" : "bg-[#E9DAD2]"
        }`}
      >
        <span
          className={`inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
            isAvailable ? "translate-x-5" : "translate-x-0"
          }`}
        >
          {loading && <Loader2 className="w-3 h-3 animate-spin text-[#74645E]" />}
        </span>
      </span>

      <span
        className={`text-xs font-semibold ${
          isAvailable ? "text-[#249653]" : "text-[#74645E]"
        }`}
      >
        {isAvailable ? "Activo" : "Agotado"}
      </span>
    </button>
  );
}
