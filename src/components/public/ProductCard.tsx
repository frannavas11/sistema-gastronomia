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
      className={`group relative bg-white rounded-2xl p-4 sm:p-5 shadow-sm shadow-slate-200 border border-slate-100 transition-all duration-200 flex flex-col justify-between gap-3 select-none ${
        isAvailable
          ? "cursor-pointer hover:border-slate-200 hover:shadow-md hover:shadow-slate-200/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          : "opacity-60 cursor-not-allowed"
      }`}
    >
      {/* Contenido principal superior */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="font-semibold text-sm sm:text-base text-slate-900 leading-snug group-hover:text-slate-700 transition-colors">
              {product.name}
            </h3>
            {!isAvailable && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 shrink-0">
                Agotado
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}

          {hasOptions && isAvailable && (
            <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
              <SlidersHorizontal className="w-3 h-3 text-slate-400" />
              <span>Personalizable</span>
            </div>
          )}
        </div>

        {/* Imagen del producto: SOLO si existe */}
        {product.image_url ? (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-102 transition-transform duration-300"
              sizes="(max-width: 640px) 80px, 96px"
            />
          </div>
        ) : null}
      </div>

      {/* Precio y Botón de acción */}
      <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-50">
        <span className="font-bold text-sm sm:text-base text-slate-900 tabular-nums">
          {formattedPrice}
        </span>

        {isAvailable ? (
          <button
            type="button"
            onClick={handleButtonClick}
            aria-label={`Agregar ${product.name}`}
            className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-900 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 transition-colors inline-flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600" />
            <span>Agregar</span>
          </button>
        ) : (
          <span className="text-xs font-medium text-slate-400">
            No disponible
          </span>
        )}
      </div>
    </article>
  );
}
