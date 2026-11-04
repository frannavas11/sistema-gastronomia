"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Drawer } from "vaul";
import { motion } from "motion/react";
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
        <Drawer.Overlay className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 transition-opacity" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 max-h-[92vh] sm:max-h-[85vh] bg-[#FFFCF8] rounded-t-3xl z-50 flex flex-col focus:outline-none max-w-lg mx-auto shadow-2xl overflow-hidden border-t border-[#E9DAD2]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex flex-col h-full max-h-[92vh] sm:max-h-[85vh] overflow-hidden"
          >
            {/* Manija de arrastre del bottom-sheet */}
            <div className="w-12 h-1.5 bg-[#E9DAD2] rounded-full mx-auto my-3 shrink-0" />

          {/* Cabecera del modal: Imagen o ícono genérico y botón cerrar */}
          <div className="relative w-full shrink-0">
            {product.image_url ? (
              <div className="relative w-full h-44 sm:h-52 bg-[#F6EBE4] border-b border-[#E9DAD2]">
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
              className="absolute top-2.5 right-3 min-h-[44px] min-w-[44px] rounded-full bg-[#FFFCF8]/90 hover:bg-[#FFFCF8] text-[#74645E] hover:text-[#211B19] flex items-center justify-center transition-colors shadow-xs z-10 border border-[#E9DAD2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-primary,#78232F)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Contenido desplazable */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
            <div>
              <Drawer.Title className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-[#211B19]">
                {product.name}
              </Drawer.Title>
              {product.description ? (
                <Drawer.Description className="text-xs sm:text-sm text-[#74645E] mt-1.5 leading-relaxed">
                  {product.description}
                </Drawer.Description>
              ) : (
                <Drawer.Description className="sr-only">
                  Detalles y opciones de {product.name}
                </Drawer.Description>
              )}
              <div className="mt-2.5 text-sm font-semibold text-[#211B19] tabular-nums">
                Precio base: {formatPrice(product.base_price)}
              </div>
            </div>

            {/* Grupos de opciones */}
            {product.option_groups.length > 0 && (
              <div className="space-y-6 pt-4 border-t border-[#E9DAD2]">
                {product.option_groups.map((group) => {
                  const isSingleChoice = group.max_selectable === 1;
                  const currentSelected = selectedOptionsMap[group.id] || [];
                  const isSatisfied =
                    !group.is_required || currentSelected.length > 0;

                  return (
                    <fieldset key={group.id} className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <legend className="text-sm font-semibold text-[#211B19]">
                            {group.name}
                          </legend>
                          <span className="text-xs text-[#74645E]">
                            {group.is_required ? (
                              <span className="text-[var(--store-primary,#78232F)] font-medium mr-1">
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
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FDE8E7] text-[#C74742] border border-[#FAC5C2]">
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
                                  ? "bg-[#F6EBE4] border-[var(--store-primary,#78232F)] text-[#211B19] shadow-xs"
                                  : "bg-[#FFFCF8] border-[#E9DAD2] text-[#74645E] hover:border-[#D5C2B8] hover:text-[#211B19]"
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
                                      ? "border-[var(--store-primary,#78232F)] bg-[var(--store-primary,#78232F)] text-[var(--store-primary-contrast,#ffffff)]"
                                      : "border-[#E9DAD2] bg-[#FFFCF8]"
                                  }`}
                                >
                                  {isSelected && (
                                    isSingleChoice ? (
                                      <span className="w-2 h-2 rounded-full bg-current" />
                                    ) : (
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    )
                                  )}
                                </div>

                                <span className="text-sm font-medium text-[#211B19]">
                                  {item.name}
                                </span>
                              </div>

                              {item.price && item.price > 0 ? (
                                <span className="text-xs font-semibold text-[#74645E] tabular-nums">
                                  +{formatPrice(item.price)}
                                </span>
                              ) : (
                                <span className="text-xs text-[#74645E]">
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

            {/* Aclaraciones para la cocina */}
            <div className="pt-4 border-t border-[#E9DAD2]">
              <label
                htmlFor="product-notes"
                className="block text-xs font-semibold text-[#74645E] mb-1.5"
              >
                Aclaraciones para el pedido (opcional)
              </label>
              <textarea
                id="product-notes"
                rows={2}
                maxLength={150}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Sin condimento, salsa aparte, etc."
                className="w-full p-3 rounded-xl border border-[#E9DAD2] bg-[#FBF5EF] text-xs sm:text-sm text-[#211B19] placeholder:text-[#A18A81] focus:outline-none focus:ring-2 focus:ring-[var(--store-primary,#78232F)] focus:bg-[#FFFCF8] resize-none transition-all"
              />
              <span className="block text-right text-[11px] text-[#74645E] mt-1 tabular-nums">
                {notes.length}/150
              </span>
            </div>
          </div>

          {/* Footer fijo con selector de cantidad y botón agregar */}
          <div className="p-4 sm:p-5 border-t border-[#E9DAD2] bg-[#FFFCF8] shrink-0 space-y-3">
            {!isValid && (
              <div className="flex items-center gap-1.5 text-xs text-[#C74742] bg-[#FDE8E7] border border-[#FAC5C2] p-2.5 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#C74742]" />
                <span>Completá las opciones obligatorias para continuar.</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              {/* Selector de cantidad */}
              <div className="flex items-center rounded-xl border border-[#E9DAD2] bg-[#F6EBE4] p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Disminuir cantidad"
                  className="min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center text-[#211B19] hover:bg-[#FFFCF8] disabled:opacity-30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-primary,#78232F)]"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-[#211B19] tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  aria-label="Aumentar cantidad"
                  className="min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center text-[#211B19] hover:bg-[#FFFCF8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-primary,#78232F)]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Botón principal */}
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!isValid}
                className="flex-1 min-h-[48px] flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm text-[var(--store-primary-contrast,#ffffff)] bg-[var(--store-primary,#78232F)] hover:opacity-95 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-primary,#78232F)] focus-visible:ring-offset-2"
              >
                <span>Agregar al pedido</span>
                <span className="tabular-nums font-bold">{formatPrice(subtotal)}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
