"use client";

import Image from "next/image";
import { Plus, SlidersHorizontal } from "lucide-react";
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
      className={`group py-4 border-b border-zinc-200 transition-colors ${
        isAvailable
          ? "cursor-pointer hover:bg-zinc-50/80 focus-visible:outline-none focus-visible:bg-zinc-50"
          : "opacity-60 cursor-not-allowed"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Contenido textual del producto */}
        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="font-semibold text-sm sm:text-base text-zinc-900 leading-snug">
                {product.name}
              </h3>
              {!isAvailable && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 shrink-0">
                  Agotado
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-xs sm:text-sm text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}

            {hasOptions && isAvailable && (
              <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                <SlidersHorizontal className="w-3 h-3 text-zinc-400" />
                <span>Personalizable</span>
              </div>
            )}
          </div>

          {/* Precio y Botón de acción */}
          <div className="mt-3 flex items-center justify-between gap-3 pt-1">
            <span className="font-semibold text-sm sm:text-base text-zinc-900 tabular-nums">
              {formattedPrice}
            </span>

            {isAvailable ? (
              <button
                type="button"
                onClick={handleButtonClick}
                aria-label={`Agregar ${product.name}`}
                className="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-900 bg-white border border-zinc-300 hover:border-zinc-400 hover:bg-zinc-100 active:bg-zinc-200 transition-colors inline-flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 select-none"
              >
                <Plus className="w-4 h-4 text-zinc-700" />
                <span>Agregar</span>
              </button>
            ) : (
              <span className="text-xs font-medium text-zinc-400">
                No disponible
              </span>
            )}
          </div>
        </div>

        {/* Imagen del producto: SOLO si existe */}
        {product.image_url ? (
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-100">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-102 transition-transform duration-300"
              sizes="(max-width: 640px) 96px, 112px"
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}
