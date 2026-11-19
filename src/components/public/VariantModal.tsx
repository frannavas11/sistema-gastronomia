"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Drawer } from "vaul";
import { X, Minus, Plus, Check } from "lucide-react";
import { formatCurrencyARS } from "@/lib/format";
import type {
  ProductWithOptions,
  ProductOptionItem,
  SelectedOptionItem,
  ConfiguredItemPayload,
} from "@/types/store";

interface VariantModalProps {
  product: ProductWithOptions;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: ConfiguredItemPayload) => void;
}

const NOTES_MAX = 150;

function initialSelection(product: ProductWithOptions) {
  const map: Record<string, ProductOptionItem[]> = {};
  for (const group of product.option_groups) {
    // Si un grupo obligatorio tiene una única opción, se preselecciona
    map[group.id] = group.is_required && group.items.length === 1 ? [group.items[0]] : [];
  }
  return map;
}

export function VariantModal({ product, isOpen, onClose, onConfirm }: VariantModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [selection, setSelection] = useState(() => initialSelection(product));

  const missingRequired = product.option_groups.filter(
    (g) => g.is_required && (selection[g.id]?.length ?? 0) === 0,
  );
  const isValid = missingRequired.length === 0;

  const unitPrice = useMemo(
    () =>
      product.base_price +
      Object.values(selection)
        .flat()
        .reduce((sum, item) => sum + (item.price ?? 0), 0),
    [product.base_price, selection],
  );
  const subtotal = unitPrice * quantity;

  const toggleOption = (groupId: string, item: ProductOptionItem, max: number | null) => {
    setSelection((prev) => {
      const current = prev[groupId] ?? [];
      if (current.some((i) => i.id === item.id)) {
        return { ...prev, [groupId]: current.filter((i) => i.id !== item.id) };
      }
      if (max === 1) return { ...prev, [groupId]: [item] };
      if (max !== null && current.length >= max) return prev;
      return { ...prev, [groupId]: [...current, item] };
    });
  };

  const handleConfirm = () => {
    if (!isValid) return;
    const selected_options: SelectedOptionItem[] = product.option_groups.flatMap((group) =>
      (selection[group.id] ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price ?? 0,
        group_id: group.id,
        group_name: group.name,
      })),
    );
    onConfirm({
      product,
      quantity,
      selected_options,
      notes: notes.trim(),
      unit_price: unitPrice,
      subtotal,
    });
    onClose();
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Drawer.Content className="fixed bottom-0 inset-x-0 z-50 max-w-lg mx-auto max-h-[94vh] flex flex-col rounded-t-[2rem] bg-surface shadow-2xl overflow-hidden focus:outline-none">
          {/* Cabecera con foto a sangre o franja de color */}
          <div className="relative shrink-0">
            {product.image_url ? (
              <div className="relative h-56 sm:h-64 bg-surface-2">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 512px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-black/20" />
              </div>
            ) : (
              <div className="h-20 bg-brand-light" />
            )}
            <div className="absolute top-3 inset-x-0 mx-auto w-10 h-1.5 rounded-full bg-white/70" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface/90 backdrop-blur text-text-primary shadow-md flex items-center justify-center hover:bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6 -mt-6 relative">
            <p className="eyebrow text-brand-fg">{formatCurrencyARS(product.base_price)}</p>
            <Drawer.Title className="mt-1 font-serif text-3xl leading-tight text-text-primary text-balance">
              {product.name}
            </Drawer.Title>
            <Drawer.Description
              className={
                product.description
                  ? "mt-2 font-serif italic text-text-secondary leading-relaxed"
                  : "sr-only"
              }
            >
              {product.description || `Opciones de ${product.name}`}
            </Drawer.Description>

            {product.option_groups.map((group) => {
              const isSingle = group.max_selectable === 1;
              const selected = selection[group.id] ?? [];
              const isMissing = group.is_required && selected.length === 0;
              const rule = isSingle
                ? "Elegí 1"
                : group.max_selectable
                  ? `Hasta ${group.max_selectable}`
                  : "Elegí las que quieras";

              return (
                <fieldset key={group.id} className="mt-8">
                  <div className="flex items-baseline justify-between gap-3">
                    <legend className="font-serif text-xl text-text-primary">{group.name}</legend>
                    <span
                      className={`eyebrow shrink-0 px-2 py-0.5 rounded-full ${
                        isMissing
                          ? "bg-brand-light text-brand-fg"
                          : group.is_required
                            ? "bg-success-soft text-success"
                            : "text-text-tertiary"
                      }`}
                    >
                      {group.is_required ? (isMissing ? "Obligatorio" : "Listo") : "Opcional"}
                    </span>
                  </div>
                  <p className="text-xs text-text-tertiary mt-0.5">{rule}</p>

                  <div className="mt-3 divide-y divide-border border-y border-border">
                    {group.items.map((item) => {
                      const isSelected = selected.some((i) => i.id === item.id);
                      return (
                        <label
                          key={item.id}
                          className="flex items-center gap-3 py-3.5 cursor-pointer select-none group/opt"
                        >
                          <input
                            type={isSingle ? "radio" : "checkbox"}
                            name={`group-${group.id}`}
                            checked={isSelected}
                            onChange={() => toggleOption(group.id, item, group.max_selectable)}
                            className="peer sr-only"
                          />
                          <span
                            className={`w-5 h-5 shrink-0 flex items-center justify-center border-[1.5px] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand ring-offset-2 ${
                              isSingle ? "rounded-full" : "rounded-md"
                            } ${
                              isSelected
                                ? "border-brand bg-brand text-brand-contrast"
                                : "border-border-strong group-hover/opt:border-text-tertiary"
                            }`}
                          >
                            {isSelected &&
                              (isSingle ? (
                                <span className="w-2 h-2 rounded-full bg-current" />
                              ) : (
                                <Check className="w-3.5 h-3.5" strokeWidth={3} />
                              ))}
                          </span>
                          <span
                            className={`flex-1 text-[0.95rem] ${
                              isSelected ? "text-text-primary font-medium" : "text-text-secondary"
                            }`}
                          >
                            {item.name}
                          </span>
                          <span className="text-sm tabular-nums text-text-secondary">
                            {item.price ? `+${formatCurrencyARS(item.price)}` : "—"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}

            <div className="mt-8">
              <label htmlFor="product-notes" className="font-serif text-xl text-text-primary">
                ¿Alguna aclaración?
              </label>
              <textarea
                id="product-notes"
                rows={2}
                maxLength={NOTES_MAX}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Sin cebolla, salsa aparte, bien cocido…"
                className="mt-2 w-full p-3.5 rounded-2xl border border-border bg-background text-sm text-text-primary placeholder:text-text-tertiary placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand focus:bg-surface resize-none transition-colors"
              />
              <span className="block text-right text-[11px] text-text-tertiary tabular-nums">
                {notes.length}/{NOTES_MAX}
              </span>
            </div>
          </div>

          <div className="shrink-0 p-4 border-t border-border bg-surface safe-bottom">
            {!isValid && (
              <p className="text-xs text-brand-fg mb-3 text-center">
                Falta elegir: {missingRequired.map((g) => g.name).join(", ")}
              </p>
            )}
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-full border border-border bg-background p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Restar uno"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-text-primary hover:bg-surface-2 disabled:opacity-30 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-7 text-center font-semibold tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  aria-label="Sumar uno"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-text-primary hover:bg-surface-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={!isValid}
                className="flex-1 min-h-[52px] px-5 rounded-full bg-brand text-brand-contrast font-semibold text-sm flex items-center justify-between shadow-lg shadow-black/10 hover:bg-brand-dark active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
              >
                <span>Agregar</span>
                <span className="font-serif text-base tabular-nums">{formatCurrencyARS(subtotal)}</span>
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
