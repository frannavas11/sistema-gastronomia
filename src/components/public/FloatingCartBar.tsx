"use client";

import { ShoppingBag, ArrowRight } from "lucide-react";

interface FloatingCartBarProps {
  totalItems: number;
  subtotal: number;
  hasHydrated?: boolean;
  onOpenCheckout: () => void;
}

export function FloatingCartBar({
  totalItems,
  subtotal,
  hasHydrated = true,
  onOpenCheckout,
}: FloatingCartBarProps) {
  // Evitar desajustes de hidratación antes de que Zustand cargue de localStorage
  if (!hasHydrated || totalItems === 0) {
    return null;
  }

  const formattedSubtotal = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(subtotal);

  return (
    <aside
      aria-label="Resumen del carrito"
      className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 pointer-events-none"
    >
      <div className="max-w-lg mx-auto pointer-events-auto">
        <button
          type="button"
          onClick={onOpenCheckout}
          className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[var(--store-primary,#e11d48)] text-white shadow-2xl hover:opacity-95 active:scale-[0.99] transition-all duration-200 select-none animate-in slide-in-from-bottom-5 duration-300"
        >
          {/* Contador y Badge */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-5 h-5 text-white" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-[var(--store-primary,#e11d48)] text-[11px] font-extrabold flex items-center justify-center shadow-sm">
                {totalItems}
              </span>
            </div>

            <div className="text-left">
              <span className="block text-xs font-medium text-white/80 leading-none">
                Ver pedido ({totalItems} {totalItems === 1 ? "ítem" : "ítems"})
              </span>
              <span className="block text-base sm:text-lg font-bold leading-tight mt-0.5">
                {formattedSubtotal}
              </span>
            </div>
          </div>

          {/* Botón de acción */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 text-xs sm:text-sm font-semibold tracking-wide">
            <span>Continuar</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </button>
      </div>
    </aside>
  );
}
