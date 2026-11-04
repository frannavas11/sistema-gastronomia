"use client";

import { useState } from "react";
import { Check, X, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateProductBasePrice } from "@/app/admin/actions";

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

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(val);
  };

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
      <div className="inline-flex items-center gap-1 bg-[#FFFCF8] p-1 rounded-xl border border-[#78232F] shadow-xs">
        <span className="text-xs font-medium text-[#74645E] pl-1">$</span>
        <input
          type="number"
          step="50"
          min="0"
          autoFocus
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="w-20 px-1 py-0.5 bg-transparent text-xs sm:text-sm font-bold text-[#211B19] focus:outline-none tabular-nums"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          aria-label="Confirmar precio"
          className="p-1.5 rounded-lg bg-[#78232F] hover:bg-[#541923] text-white transition-colors disabled:opacity-50 min-h-[32px] min-w-[32px] flex items-center justify-center"
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
          className="p-1.5 rounded-lg hover:bg-[#F6EBE4] text-[#74645E] transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
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
      className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl hover:bg-[#F6EBE4] border border-transparent hover:border-[#E9DAD2] transition-colors cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#78232F] min-h-[44px]"
      title="Hacé clic para editar el precio"
    >
      <span className="text-sm font-bold text-[#211B19] tabular-nums">
        {formatPrice(price)}
      </span>
      <Pencil className="w-3.5 h-3.5 text-[#A18A81] group-hover:text-[#78232F] transition-colors" />
    </button>
  );
}
