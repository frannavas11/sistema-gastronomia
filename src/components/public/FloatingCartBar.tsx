"use client";

import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ShoppingBag } from "lucide-react";

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
  const isVisible = hasHydrated && totalItems > 0;

  const formattedSubtotal = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(subtotal);

  return (
    <AnimatePresence>
      {isVisible && (
        <aside
          aria-label="Resumen del pedido"
          className="fixed bottom-0 inset-x-0 z-40 p-4 pointer-events-none"
        >
          <div className="max-w-lg mx-auto pointer-events-auto">
            <motion.button
              type="button"
              onClick={onOpenCheckout}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              whileTap={{ scale: 0.98 }}
              className="w-full min-h-[56px] px-5 py-3.5 rounded-2xl bg-[var(--store-primary,#D62828)] text-white shadow-xl flex items-center justify-between select-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
            >
              {/* Indicador de ítems */}
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 text-white shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0.6 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-white text-[var(--store-primary,#D62828)] text-[11px] font-extrabold flex items-center justify-center tabular-nums shadow-sm"
                  >
                    {totalItems}
                  </motion.span>
                </div>

                <div className="text-left">
                  <span className="block text-xs font-medium text-white/90 leading-tight">
                    Ver pedido ({totalItems} {totalItems === 1 ? "ítem" : "ítems"})
                  </span>
                  <span className="block text-base font-bold tabular-nums leading-tight mt-0.5">
                    {formattedSubtotal}
                  </span>
                </div>
              </div>

              {/* Botón de acción */}
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold tracking-wide bg-white/20 hover:bg-white/30 px-3.5 py-1.5 rounded-xl transition-colors">
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </motion.button>
          </div>
        </aside>
      )}
    </AnimatePresence>
  );
}
