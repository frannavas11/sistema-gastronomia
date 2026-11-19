"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Plus, SlidersHorizontal } from "lucide-react";
import { formatCurrencyARS } from "@/lib/format";
import type { ProductWithOptions } from "@/types/store";

interface ProductCardProps {
  product: ProductWithOptions;
  onSelect: (product: ProductWithOptions) => void;
  onQuickAdd: (product: ProductWithOptions) => void;
}

/**
 * Plato en formato de carta impresa: nombre · · · · precio con línea punteada,
 * descripción en serif itálica y foto a la derecha con el botón "+" superpuesto.
 */
export function ProductCard({ product, onSelect, onQuickAdd }: ProductCardProps) {
  const isAvailable = product.is_available ?? true;
  const hasOptions = product.option_groups.length > 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;
    if (hasOptions) onSelect(product);
    else onQuickAdd(product);
  };

  const addButton = isAvailable && (
    <motion.button
      type="button"
      onClick={handleAdd}
      whileTap={{ scale: 0.9 }}
      aria-label={hasOptions ? `Elegir opciones de ${product.name}` : `Agregar ${product.name}`}
      className="w-10 h-10 rounded-full bg-brand text-brand-contrast shadow-md shadow-black/15 flex items-center justify-center ring-4 ring-surface hover:bg-brand-dark transition-colors focus-visible:outline-none focus-visible:ring-brand/40"
    >
      <Plus className="w-5 h-5" strokeWidth={2.5} />
    </motion.button>
  );

  return (
    <article
      onClick={() => isAvailable && onSelect(product)}
      role={isAvailable ? "button" : undefined}
      tabIndex={isAvailable ? 0 : -1}
      aria-disabled={!isAvailable || undefined}
      onKeyDown={(e) => {
        if (isAvailable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect(product);
        }
      }}
      className={`group relative flex gap-4 py-5 rounded-xl transition-colors ${
        isAvailable
          ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4"
          : "cursor-not-allowed"
      }`}
    >
      <div className={`flex-1 min-w-0 ${isAvailable ? "" : "opacity-55"}`}>
        <div className="flex items-baseline gap-2">
          <h3
            className={`font-serif text-[1.15rem] sm:text-xl leading-snug text-text-primary transition-colors group-hover:text-brand-fg ${
              isAvailable ? "" : "line-through decoration-1"
            }`}
          >
            {product.name}
          </h3>
          <span className="leader" aria-hidden="true" />
          <span className="font-semibold text-[0.95rem] text-text-primary tabular-nums shrink-0">
            {formatCurrencyARS(product.base_price)}
          </span>
        </div>

        {product.description && (
          <p className="mt-1.5 font-serif italic text-sm leading-relaxed text-text-secondary line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="mt-2.5 flex items-center gap-2 min-h-5">
          {!isAvailable ? (
            <span className="eyebrow text-error">Agotado por hoy</span>
          ) : hasOptions ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-tertiary">
              <SlidersHorizontal className="w-3 h-3" />
              A tu gusto
            </span>
          ) : null}
        </div>
      </div>

      {product.image_url ? (
        <div className="relative shrink-0 self-start">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-surface-2 shadow-sm">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className={`object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
                isAvailable ? "" : "grayscale"
              }`}
              sizes="(max-width: 640px) 96px, 112px"
            />
          </div>
          {addButton && <div className="absolute -bottom-3 -right-2">{addButton}</div>}
        </div>
      ) : (
        addButton && <div className="shrink-0 self-center">{addButton}</div>
      )}
    </article>
  );
}
