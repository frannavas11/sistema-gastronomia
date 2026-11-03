"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { X, Minus, Plus, Check, AlertCircle } from "lucide-react";
import type {
  ProductWithOptions,
  ProductOptionItem,
  SelectedOptionItem,
  ConfiguredItemPayload,
} from "@/types/store";

interface VariantModalProps {
  product: ProductWithOptions | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: ConfiguredItemPayload) => void;
}

export function VariantModal({
  product,
  isOpen,
  onClose,
  onConfirm,
}: VariantModalProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  // Estado de opciones inicializado declarativamente al montar (controlado por key={product.id})
  const [selectedOptionsMap, setSelectedOptionsMap] = useState<
    Record<string, ProductOptionItem[]>
  >(() => {
    if (!product) return {};
    const initialMap: Record<string, ProductOptionItem[]> = {};
    product.option_groups.forEach((group) => {
      if (group.is_required && group.items.length === 1 && group.items[0]) {
        initialMap[group.id] = [group.items[0]];
      } else {
        initialMap[group.id] = [];
      }
    });
    return initialMap;
  });

  // Validación de grupos requeridos
  const validationErrors = useMemo(() => {
    if (!product) return [];
    const missingGroupNames: string[] = [];

    product.option_groups.forEach((group) => {
      if (group.is_required) {
        const selected = selectedOptionsMap[group.id] || [];
        if (selected.length === 0) {
          missingGroupNames.push(group.name);
        }
      }
    });

    return missingGroupNames;
  }, [product, selectedOptionsMap]);

  // Cálculo del precio unitario total (precio base + adicionales seleccionados)
  const unitPrice = useMemo(() => {
    if (!product) return 0;
    let extraTotal = 0;
    Object.values(selectedOptionsMap).forEach((items) => {
      items.forEach((item) => {
        extraTotal += item.price || 0;
      });
    });
    return product.base_price + extraTotal;
  }, [product, selectedOptionsMap]);

  // Bloquear scroll de la página mientras el modal está abierto
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Si no hay producto seleccionado o no está abierto, no renderizar
  if (!isOpen || !product) {
    return null;
  }

  // Manejo de selección/deselección de opciones por grupo
  const handleToggleOption = (
    groupId: string,
    item: ProductOptionItem,
    maxSelectable: number | null,
  ) => {
    setSelectedOptionsMap((prev) => {
      const currentSelection = prev[groupId] || [];
      const isAlreadySelected = currentSelection.some((i) => i.id === item.id);

      if (isAlreadySelected) {
        // Deseleccionar
        return {
          ...prev,
          [groupId]: currentSelection.filter((i) => i.id !== item.id),
        };
      }

      // Si es de selección única (radio button behavior)
      if (maxSelectable === 1) {
        return {
          ...prev,
          [groupId]: [item],
        };
      }

      // Si tiene límite máximo y ya se alcanzó, no permitir más
      if (
        maxSelectable !== null &&
        maxSelectable > 1 &&
        currentSelection.length >= maxSelectable
      ) {
        return prev;
      }

      // Añadir opción
      return {
        ...prev,
        [groupId]: [...currentSelection, item],
      };
    });
  };

  const isValid = validationErrors.length === 0;
  const subtotal = unitPrice * quantity;

  // Confirmar y despachar payload estructurado al carrito
  const handleConfirm = () => {
    if (!isValid) return;

    const flattenedOptions: SelectedOptionItem[] = [];
    product.option_groups.forEach((group) => {
      const selectedItems = selectedOptionsMap[group.id] || [];
      selectedItems.forEach((item) => {
        flattenedOptions.push({
          id: item.id,
          name: item.name,
          price: item.price || 0,
          group_id: group.id,
          group_name: group.name,
        });
      });
    });

    onConfirm({
      product,
      quantity,
      selected_options: flattenedOptions,
      notes: notes.trim(),
      unit_price: unitPrice,
      subtotal,
    });

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sheet / Modal Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200">
        {/* Cabecera del modal: Imagen y botón de cierre */}
        <div className="relative w-full flex-shrink-0">
          {product.image_url ? (
            <div className="relative w-full h-44 sm:h-52 bg-zinc-100 dark:bg-zinc-800">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 512px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
            </div>
          ) : (
            <div className="h-16 bg-zinc-100 dark:bg-zinc-800" />
          )}

          {/* Botón cerrar */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de producto"
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center transition-colors shadow-md z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Título, descripción y precio base */}
          <div>
            <h2
              id="modal-product-title"
              className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
            >
              {product.name}
            </h2>
            {product.description && (
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                {product.description}
              </p>
            )}
            <div className="mt-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Base: {formatPrice(product.base_price)}
            </div>
          </div>

          {/* Grupos de Opciones / Modificadores */}
          {product.option_groups.length > 0 && (
            <div className="space-y-6 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              {product.option_groups.map((group) => {
                const isSingleChoice = group.max_selectable === 1;
                const currentSelected = selectedOptionsMap[group.id] || [];
                const isSatisfied =
                  !group.is_required || currentSelected.length > 0;

                return (
                  <fieldset key={group.id} className="space-y-2.5">
                    {/* Encabezado del grupo */}
                    <div className="flex items-center justify-between">
                      <div>
                        <legend className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {group.name}
                        </legend>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {group.is_required ? (
                            <span className="text-rose-500 font-semibold mr-1">
                              Obligatorio
                            </span>
                          ) : (
                            <span className="mr-1">Opcional</span>
                          )}
                          {isSingleChoice
                            ? "• Elegí 1"
                            : group.max_selectable
                            ? `• Hasta ${group.max_selectable}`
                            : ""}
                        </span>
                      </div>

                      {group.is_required && !isSatisfied && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          Falta elegir
                        </span>
                      )}
                    </div>

                    {/* Lista de ítems del grupo */}
                    <div className="space-y-1.5">
                      {group.items.map((item) => {
                        const isSelected = currentSelected.some(
                          (i) => i.id === item.id,
                        );

                        return (
                          <label
                            key={item.id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                              isSelected
                                ? "bg-rose-500/5 dark:bg-rose-500/10 border-[var(--store-primary,#e11d48)] text-zinc-900 dark:text-zinc-100 shadow-sm"
                                : "bg-white dark:bg-zinc-850/60 border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Control visual (Radio o Checkbox estilizado) */}
                              <div
                                className={`w-5 h-5 flex items-center justify-center transition-colors ${
                                  isSingleChoice
                                    ? "rounded-full border-2"
                                    : "rounded-md border-2"
                                } ${
                                  isSelected
                                    ? "border-[var(--store-primary,#e11d48)] bg-[var(--store-primary,#e11d48)] text-white"
                                    : "border-zinc-300 dark:border-zinc-600 bg-transparent"
                                }`}
                              >
                                {isSelected && (
                                  isSingleChoice ? (
                                    <span className="w-2 h-2 rounded-full bg-white" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  )
                                )}
                              </div>

                              <span className="text-sm font-medium">
                                {item.name}
                              </span>
                            </div>

                            {/* Precio adicional si aplica */}
                            {item.price && item.price > 0 ? (
                              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                                +{formatPrice(item.price)}
                              </span>
                            ) : (
                              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                Sin costo
                              </span>
                            )}

                            {/* Input oculto para accesibilidad */}
                            <input
                              type={isSingleChoice ? "radio" : "checkbox"}
                              name={`group-${group.id}`}
                              checked={isSelected}
                              onChange={() =>
                                handleToggleOption(
                                  group.id,
                                  item,
                                  group.max_selectable,
                                )
                              }
                              className="sr-only"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              })}
            </div>
          )}

          {/* Notas especiales / Aclaraciones para la cocina */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <label
              htmlFor="product-notes"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5"
            >
              Aclaraciones para el local (opcional)
            </label>
            <textarea
              id="product-notes"
              rows={2}
              maxLength={150}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Sin cebolla, aderezo aparte, bien cocido..."
              className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--store-primary,#e11d48)] focus:border-transparent resize-none transition-all"
            />
            <span className="block text-right text-[10px] text-zinc-400 mt-1">
              {notes.length}/150
            </span>
          </div>
        </div>

        {/* Footer fijo con selector de cantidad y botón agregar */}
        <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0 space-y-3">
          {/* Alerta si faltan campos requeridos */}
          {!isValid && (
            <div className="flex items-center gap-1.5 text-xs text-rose-500 bg-rose-500/10 p-2 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Completá las opciones obligatorias para continuar.</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Selector de cantidad */}
            <div className="flex items-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Disminuir cantidad"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-750 disabled:opacity-40 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                aria-label="Aumentar cantidad"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-750 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Botón principal */}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!isValid}
              className="flex-1 flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm text-white bg-[var(--store-primary,#e11d48)] hover:opacity-95 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
            >
              <span>Agregar al pedido</span>
              <span>{formatPrice(subtotal)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
