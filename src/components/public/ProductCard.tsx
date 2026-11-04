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
      className={`group relative bg-[#FFFCF8] rounded-2xl p-3 sm:p-4 border border-[#E9DAD2] shadow-[0_2px_8px_rgba(33,27,25,0.04)] transition-all duration-200 flex gap-3 sm:gap-4 select-none ${
        isAvailable
          ? "cursor-pointer hover:border-[#D5C2B8] hover:shadow-[0_4px_12px_rgba(33,27,25,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-primary,#78232F)]"
          : "opacity-60 cursor-not-allowed"
      }`}
    >
      {/* 1. Foto a la izquierda (o recuadro crema con ícono genérico) */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#F6EBE4] shrink-0 border border-[#E9DAD2] flex items-center justify-center">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-102 transition-transform duration-300"
            sizes="(max-width: 640px) 96px, 112px"
          />
        ) : (
          <UtensilsCrossed className="w-7 h-7 text-[#A18A81]" />
        )}
      </div>

      {/* 2. Información del producto y acción */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="font-semibold text-sm sm:text-base text-[#211B19] leading-snug group-hover:text-[#541923] transition-colors">
              {product.name}
            </h3>
            {!isAvailable && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F6EBE4] text-[#74645E] shrink-0">
                Agotado
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-xs text-[#74645E] mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}

          {hasOptions && isAvailable && (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-[#74645E]">
              <SlidersHorizontal className="w-3 h-3 text-[#A18A81]" />
              <span>Personalizable</span>
            </div>
          )}
        </div>

        {/* Fila inferior: Precio y Botón Agregar */}
        <div className="pt-2 flex items-center justify-between gap-2">
          <span className="font-bold text-sm sm:text-base text-[#211B19] tabular-nums">
            {formattedPrice}
          </span>

          {isAvailable ? (
            <button
              type="button"
              onClick={handleButtonClick}
              aria-label={`Agregar ${product.name}`}
              className="min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[var(--store-primary,#78232F)] text-[var(--store-primary-contrast,#ffffff)] hover:opacity-90 active:scale-95 transition-all inline-flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-primary,#78232F)] shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar</span>
            </button>
          ) : (
            <span className="text-xs font-medium text-[#74645E]">
              No disponible
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
