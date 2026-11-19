"use client";

import { useState } from "react";
import { Check, X, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateProductBasePrice } from "@/app/admin/actions";
import { formatCurrencyARS } from "@/lib/format";

interface QuickPriceEditorProps {
  productId: string;
  storeId: string;
  initialPrice: number;
}

export function QuickPriceEditor({
  productId,
  storeId,
  initialPrice,
}: QuickPriceEditorProps) {
  const [price, setPrice] = useState(initialPrice);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(initialPrice.toString());
  const [loading, setLoading] = useState(false);

  const formatPrice = formatCurrencyARS;

  const handleSave = async () => {
    const numeric = parseFloat(inputValue);
    if (isNaN(numeric) || numeric < 0) {
      toast.error("Ingresá un precio válido.");
      return;
    }

    setLoading(true);
    const result = await updateProductBasePrice(productId, storeId, numeric);

    if (result.success) {
      setPrice(numeric);
      setIsEditing(false);
      toast.success("Precio actualizado.");
    } else {
      toast.error(result.error || "No se pudo actualizar el precio.");
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setInputValue(price.toString());
    }
  };

  if (isEditing) {
    return (
      <div className="inline-flex items-center gap-1 bg-surface p-1 rounded-xl border border-brand shadow-xs">
        <span className="text-xs font-medium text-text-secondary pl-1">$</span>
        <input
          type="number"
          step="50"
          min="0"
          autoFocus
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="w-20 px-1 py-0.5 bg-transparent text-xs sm:text-sm font-bold text-text-primary focus:outline-none tabular-nums"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          aria-label="Confirmar precio"
          className="p-1.5 rounded-lg bg-brand hover:bg-brand-dark text-white transition-colors disabled:opacity-50 min-h-[32px] min-w-[32px] flex items-center justify-center"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setInputValue(price.toString());
          }}
          disabled={loading}
          aria-label="Cancelar edición"
          className="p-1.5 rounded-lg hover:bg-surface-2 text-text-secondary transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setInputValue(price.toString());
        setIsEditing(true);
      }}
      className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl hover:bg-surface-2 border border-transparent hover:border-border transition-colors cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand min-h-[44px]"
      title="Hacé clic para editar el precio"
    >
      <span className="text-sm font-bold text-text-primary tabular-nums">
        {formatPrice(price)}
      </span>
      <Pencil className="w-3.5 h-3.5 text-text-tertiary group-hover:text-brand-fg transition-colors" />
    </button>
  );
}
