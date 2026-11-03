"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Drawer } from "vaul";
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!product) {
    return null;
  }

  const handleToggleOption = (
    groupId: string,
    item: ProductOptionItem,
    maxSelectable: number | null,
  ) => {
    setSelectedOptionsMap((prev) => {
      const currentSelection = prev[groupId] || [];
      const isAlreadySelected = currentSelection.some((i) => i.id === item.id);

      if (isAlreadySelected) {
        return {
          ...prev,
          [groupId]: currentSelection.filter((i) => i.id !== item.id),
        };
      }

      if (maxSelectable === 1) {
        return {
          ...prev,
          [groupId]: [item],
        };
      }

      if (
        maxSelectable !== null &&
        maxSelectable > 1 &&
        currentSelection.length >= maxSelectable
      ) {
        return prev;
      }

      return {
        ...prev,
        [groupId]: [...currentSelection, item],
      };
    });
  };

  const isValid = validationErrors.length === 0;
  const subtotal = unitPrice * quantity;

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
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 max-h-[92vh] sm:max-h-[85vh] bg-white rounded-t-3xl z-50 flex flex-col focus:outline-none max-w-lg mx-auto shadow-2xl overflow-hidden border-t border-zinc-200">
          {/* Manija de arrastre accesible para el bottom-sheet */}
          <div className="w-12 h-1.5 bg-zinc-300 rounded-full mx-auto my-3 shrink-0" />

          {/* Cabecera del modal: Imagen opcional y botón de cierre */}
          <div className="relative w-full shrink-0">
            {product.image_url ? (
              <div className="relative w-full h-44 sm:h-52 bg-zinc-100 border-b border-zinc-200">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 512px"
                />
              </div>
            ) : null}

            {/* Botón cerrar táctil */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar modal de producto"
              className="absolute top-2 right-3 min-h-[44px] min-w-[44px] rounded-full bg-white/90 hover:bg-white text-zinc-700 flex items-center justify-center transition-colors shadow-xs z-10 border border-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Contenido con scroll */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
            <div>
              <Drawer.Title className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900">
                {product.name}
              </Drawer.Title>
              {product.description ? (
                <Drawer.Description className="text-xs sm:text-sm text-zinc-500 mt-1.5 leading-relaxed">
                  {product.description}
                </Drawer.Description>
              ) : (
                <Drawer.Description className="sr-only">
                  Detalles y opciones de {product.name}
                </Drawer.Description>
              )}
              <div className="mt-2 text-sm font-semibold text-zinc-900 tabular-nums">
                Precio base: {formatPrice(product.base_price)}
              </div>
            </div>

            {/* Grupos de opciones */}
            {product.option_groups.length > 0 && (
              <div className="space-y-6 pt-4 border-t border-zinc-200">
                {product.option_groups.map((group) => {
                  const isSingleChoice = group.max_selectable === 1;
                  const currentSelected = selectedOptionsMap[group.id] || [];
                  const isSatisfied =
                    !group.is_required || currentSelected.length > 0;

                  return (
                    <fieldset key={group.id} className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <legend className="text-sm font-semibold text-zinc-900">
                            {group.name}
                          </legend>
                          <span className="text-xs text-zinc-500">
                            {group.is_required ? (
                              <span className="text-[var(--store-primary,#D62828)] font-medium mr-1">
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
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            Falta elegir
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        {group.items.map((item) => {
                          const isSelected = currentSelected.some(
                            (i) => i.id === item.id,
                          );

                          return (
                            <label
                              key={item.id}
                              className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer select-none min-h-[44px] ${
                                isSelected
                                  ? "bg-zinc-50 border-zinc-900 text-zinc-900"
                                  : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-5 h-5 flex items-center justify-center transition-colors ${
                                    isSingleChoice
                                      ? "rounded-full border"
                                      : "rounded-md border"
                                  } ${
                                    isSelected
                                      ? "border-zinc-900 bg-zinc-900 text-white"
                                      : "border-zinc-300 bg-white"
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

                                <span className="text-sm font-medium text-zinc-900">
                                  {item.name}
                                </span>
                              </div>

                              {item.price && item.price > 0 ? (
                                <span className="text-xs font-semibold text-zinc-700 tabular-nums">
                                  +{formatPrice(item.price)}
                                </span>
                              ) : (
                                <span className="text-xs text-zinc-400">
                                  Sin costo
                                </span>
                              )}

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

            {/* Aclaraciones */}
            <div className="pt-4 border-t border-zinc-200">
              <label
                htmlFor="product-notes"
                className="block text-xs font-semibold text-zinc-700 mb-1.5"
              >
                Aclaraciones para la cocina (opcional)
              </label>
              <textarea
                id="product-notes"
                rows={2}
                maxLength={150}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Sin cebolla, aderezo aparte, etc."
                className="w-full p-3 rounded-xl border border-zinc-200 bg-zinc-50 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white resize-none transition-all"
              />
              <span className="block text-right text-[11px] text-zinc-400 mt-1 tabular-nums">
                {notes.length}/150
              </span>
            </div>
          </div>

          {/* Footer fijo con selector de cantidad y botón agregar */}
          <div className="p-4 sm:p-5 border-t border-zinc-200 bg-white shrink-0 space-y-3">
            {!isValid && (
              <div className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Completá las opciones obligatorias para continuar.</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              {/* Selector de cantidad */}
              <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-50 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Disminuir cantidad"
                  className="min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center text-zinc-700 hover:bg-white disabled:opacity-30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-zinc-900 tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  aria-label="Aumentar cantidad"
                  className="min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center text-zinc-700 hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Botón principal */}
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!isValid}
                className="flex-1 min-h-[48px] flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm text-white bg-[var(--store-primary,#D62828)] hover:opacity-95 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
              >
                <span>Agregar al pedido</span>
                <span className="tabular-nums font-bold">{formatPrice(subtotal)}</span>
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
