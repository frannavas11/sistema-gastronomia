"use client";

import Image from "next/image";
import { Plus, SlidersHorizontal, UtensilsCrossed } from "lucide-react";
import type { ProductWithOptions } from "@/types/store";

interface ProductCardProps {
  product: ProductWithOptions;
  onSelect: (product: ProductWithOptions) => void;
  onQuickAdd?: (product: ProductWithOptions) => void;
}

export function ProductCard({
  product,
  onSelect,
  onQuickAdd,
}: ProductCardProps) {
  const isAvailable = product.is_available ?? true;
  const hasOptions = (product.option_groups?.length ?? 0) > 0;

  const formattedPrice = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(product.base_price);

  const handleCardClick = () => {
    if (!isAvailable) return;
    onSelect(product);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;

    if (!hasOptions && onQuickAdd) {
      onQuickAdd(product);
    } else {
      onSelect(product);
    }
  };

  return (
    <article
      onClick={handleCardClick}
      role={isAvailable ? "button" : undefined}
      tabIndex={isAvailable ? 0 : -1}
      onKeyDown={(e) => {
        if (isAvailable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={`group relative flex gap-3.5 p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 select-none ${
        isAvailable
          ? "bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-md cursor-pointer active:scale-[0.99]"
          : "bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200/50 dark:border-zinc-800/50 opacity-60 cursor-not-allowed"
      }`}
    >
      {/* Información del producto */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {/* Título y Badge de agotado */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm sm:text-base leading-snug text-zinc-900 dark:text-zinc-100 group-hover:text-[var(--store-primary,#e11d48)] transition-colors">
              {product.name}
            </h3>
            {!isAvailable && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex-shrink-0">
                Agotado
              </span>
            )}
          </div>

          {/* Descripción */}
          {product.description && (
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Indicador de personalizable si tiene modificadores */}
          {hasOptions && isAvailable && (
            <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              <SlidersHorizontal className="w-3 h-3 text-[var(--store-primary,#e11d48)]" />
              <span>Personalizable</span>
            </div>
          )}
        </div>

        {/* Precio y Botón de acción */}
        <div className="mt-3 pt-1 flex items-center justify-between gap-2">
          <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
            {formattedPrice}
          </span>

          {isAvailable ? (
            <button
              type="button"
              onClick={handleButtonClick}
              aria-label={`Añadir o configurar ${product.name}`}
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-[var(--store-primary,#e11d48)] hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden xs:inline">Agregar</span>
            </button>
          ) : (
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-600">
              No disponible
            </span>
          )}
        </div>
      </div>

      {/* Imagen del producto */}
      {product.image_url ? (
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-300 ${
              isAvailable ? "group-hover:scale-105" : "grayscale"
            }`}
            sizes="(max-width: 640px) 96px, 112px"
          />
        </div>
      ) : (
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center flex-shrink-0 text-zinc-400">
          <UtensilsCrossed className="w-7 h-7 stroke-[1.5]" />
        </div>
      )}
    </article>
  );
}
