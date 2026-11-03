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
  // Estado de opciones: Record<groupId, ProductOptionItem[]>
  const [selectedOptionsMap, setSelectedOptionsMap] = useState<
    Record<string, ProductOptionItem[]>
  >({});

  // Resetear estados cuando se abre un nuevo producto
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setNotes("");

      // Si hay grupos obligatorios con una única opción disponible, preseleccionarla
      const initialMap: Record<string, ProductOptionItem[]> = {};
      product.option_groups.forEach((group) => {
        if (group.is_required && group.items.length === 1 && group.items[0]) {
          initialMap[group.id] = [group.items[0]];
        } else {
          initialMap[group.id] = [];
        }
      });
      setSelectedOptionsMap(initialMap);
    }
  }, [product, isOpen]);

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

  // Manejo de selección/deselección de opciones
  const handleToggleOption = (
    groupId: string,
    item: ProductOptionItem,
    maxSelectable: number | null,
    isRequired: boolean,
  ) => {
    setSelectedOptionsMap((prev) => {
      const currentSelected = prev[groupId] || [];
      const isAlreadySelected = currentSelected.some((opt) => opt.id === item.id);

      // Caso 1: Selección única (Radio-like)
      if (maxSelectable === 1) {
        if (isAlreadySelected) {
          // Si no es obligatorio, permite deseleccionar
          return {
            ...prev,
            [groupId]: isRequired ? currentSelected : [],
          };
        }
        return {
          ...prev,
          [groupId]: [item],
        };
      }

      // Caso 2: Selección múltiple (Checkbox-like)
      if (isAlreadySelected) {
        return {
          ...prev,
          [groupId]: currentSelected.filter((opt) => opt.id !== item.id),
        };
      }

      // Verificar límite máximo
      if (maxSelectable !== null && currentSelected.length >= maxSelectable) {
        return prev;
      }

      return {
        ...prev,
        [groupId]: [...currentSelected, item],
      };
    });
  };

  // Validación: verificar si todos los grupos obligatorios están completos
  const missingRequiredGroups = useMemo(() => {
    if (!product) return [];

    return product.option_groups.filter((group) => {
      if (!group.is_required) return false;
      const selected = selectedOptionsMap[group.id] || [];
      return selected.length === 0;
    });
  }, [product, selectedOptionsMap]);

  const isValid = missingRequiredGroups.length === 0;

  // Cálculo de precio unitario y subtotal
  const { unitPrice, subtotal, flattenedSelectedOptions } = useMemo(() => {
    if (!product) {
      return {
        unitPrice: 0,
        subtotal: 0,
        flattenedSelectedOptions: [] as SelectedOptionItem[],
      };
    }

    let extraOptionsCost = 0;
    const flattened: SelectedOptionItem[] = [];

    product.option_groups.forEach((group) => {
      const selectedItems = selectedOptionsMap[group.id] || [];
      selectedItems.forEach((item) => {
        const itemPrice = item.price ?? 0;
        extraOptionsCost += itemPrice;
        flattened.push({
          id: item.id,
          name: item.name,
          price: itemPrice,
          group_id: group.id,
          group_name: group.name,
        });
      });
    });

    const calculatedUnitPrice = product.base_price + extraOptionsCost;
    const calculatedSubtotal = calculatedUnitPrice * quantity;

    return {
      unitPrice: calculatedUnitPrice,
      subtotal: calculatedSubtotal,
      flattenedSelectedOptions: flattened,
    };
  }, [product, selectedOptionsMap, quantity]);

  const handleConfirm = () => {
    if (!product || !isValid) return;

    onConfirm({
      product,
      quantity,
      selected_options: flattenedSelectedOptions,
      notes: notes.trim(),
      unit_price: unitPrice,
      subtotal,
    });

    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="variant-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      {/* Backdrop con blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Contenedor del Modal / Bottom Sheet */}
      <div className="relative w-full max-w-lg max-h-[92vh] sm:max-h-[85vh] bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 z-10 border border-zinc-200 dark:border-zinc-800">
        {/* Barra superior de arrastre en mobile */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Header con botón de cerrar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <h2
            id="variant-modal-title"
            className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate pr-4"
          >
            {product.name}
          </h2>
          <button
            onClick={onClose}
            type="button"
            aria-label="Cerrar modal"
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo scrolleable del modal */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Cabecera del producto */}
          <div className="flex gap-4">
            {product.image_url && (
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-lg font-bold text-[var(--store-primary,#e11d48)]">
                {formatPrice(product.base_price)}
              </span>
              {product.description && (
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-3 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>
          </div>

          {/* Grupos de opciones y modificadores */}
          {product.option_groups.map((group) => {
            const isSingle = group.max_selectable === 1;
            const selectedItems = selectedOptionsMap[group.id] || [];
            const isAtMax =
              group.max_selectable !== null &&
              selectedItems.length >= group.max_selectable;

            return (
              <div
                key={group.id}
                className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-900/50"
              >
                {/* Título del grupo y badges de condición */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {group.name}
                    </h3>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {isSingle
                        ? "Elegí 1 opción"
                        : group.max_selectable
                        ? `Hasta ${group.max_selectable} opciones`
                        : "Opciones a elección"}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                      group.is_required
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {group.is_required ? "Obligatorio" : "Opcional"}
                  </span>
                </div>

                {/* Lista de ítems del grupo */}
                <div className="space-y-2">
                  {group.items.map((item) => {
                    const isSelected = selectedItems.some(
                      (opt) => opt.id === item.id,
                    );
                    const isDisabled = !isSelected && isAtMax;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() =>
                          handleToggleOption(
                            group.id,
                            item,
                            group.max_selectable,
                            Boolean(group.is_required),
                          )
                        }
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-white dark:bg-zinc-800 border-[var(--store-primary,#e11d48)] shadow-sm text-zinc-900 dark:text-zinc-100"
                            : isDisabled
                            ? "bg-zinc-100/50 dark:bg-zinc-900/30 border-transparent text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-50"
                            : "bg-white dark:bg-zinc-800/60 border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Indicador visual de selección (radio o checkbox) */}
                          <div
                            className={`w-4 h-4 rounded-${
                              isSingle ? "full" : "md"
                            } border flex items-center justify-center transition-colors flex-shrink-0 ${
                              isSelected
                                ? "bg-[var(--store-primary,#e11d48)] border-[var(--store-primary,#e11d48)] text-white"
                                : "border-zinc-300 dark:border-zinc-600 bg-transparent"
                            }`}
                          >
                            {isSelected && (
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            )}
                          </div>
                          <span className="truncate">{item.name}</span>
                        </div>

                        {/* Precio adicional si aplica */}
                        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 pl-2 flex-shrink-0">
                          {item.price && item.price > 0
                            ? `+ ${formatPrice(item.price)}`
                            : "Sin cargo"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Campo de notas / aclaraciones para la cocina */}
          <div className="space-y-1.5">
            <label
              htmlFor="kitchen-notes"
              className="block font-semibold text-xs sm:text-sm text-zinc-800 dark:text-zinc-200"
            >
              Aclaraciones para el local
            </label>
            <textarea
              id="kitchen-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Sin cebolla, aderezos aparte, servilletas extra..."
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--store-primary,#e11d48)] focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Selector de cantidad */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800">
            <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">
              Cantidad
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Restar una unidad"
                className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all shadow-sm"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <span className="w-8 text-center font-bold text-base text-zinc-900 dark:text-zinc-100">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Sumar una unidad"
                className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center active:scale-95 transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer fijo con total y botón de agregar */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
          {!isValid && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                Completá las opciones obligatorias:{" "}
                <strong>
                  {missingRequiredGroups.map((g) => g.name).join(", ")}
                </strong>
              </span>
            </div>
          )}

          <button
            type="button"
            disabled={!isValid}
            onClick={handleConfirm}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-[var(--store-primary,#e11d48)] hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-between"
          >
            <span>Agregar al pedido</span>
            <span>{formatPrice(subtotal)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

