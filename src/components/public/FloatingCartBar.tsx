"use client";

import { motion, AnimatePresence } from "motion/react";
import { ArrowRight } from "lucide-react";
import { formatCurrencyARS } from "@/lib/format";

interface FloatingCartBarProps {
  totalItems: number;
  subtotal: number;
  isVisible: boolean;
  onOpenCheckout: () => void;
}

/**
 * Barra flotante del pedido. Antes medía su propia altura con ResizeObserver, la escribía
 * en una variable CSS global Y la devolvía por prop al padre (dos mecanismos para lo mismo);
 * ahora el padre simplemente reserva un espacio fijo cuando la barra está visible.
 */
export function FloatingCartBar({
  totalItems,
  subtotal,
  isVisible,
  onOpenCheckout,
}: FloatingCartBarProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          aria-label="Resumen del pedido"
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed bottom-0 inset-x-0 z-40 px-4 pt-4 safe-bottom pointer-events-none"
        >
          <button
            type="button"
            onClick={onOpenCheckout}
            className="pointer-events-auto w-full max-w-md mx-auto min-h-[60px] pl-2 pr-5 rounded-full bg-ink text-ink-contrast shadow-2xl shadow-black/30 flex items-center justify-between gap-3 active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/40"
          >
            <span className="flex items-center gap-3">
              <motion.span
                key={totalItems}
                initial={{ scale: 0.7 }}
                animate={{ scale: 1 }}
                className="w-11 h-11 rounded-full bg-brand text-brand-contrast font-semibold tabular-nums flex items-center justify-center"
              >
                {totalItems}
              </motion.span>
              <span className="text-left leading-tight">
                <span className="eyebrow block opacity-70">Tu pedido</span>
                <span className="font-serif text-lg tabular-nums">{formatCurrencyARS(subtotal)}</span>
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
              Ver la cuenta
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
