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
      <div className="inline-flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-300 shadow-2xs">
        <span className="text-xs font-medium text-slate-500 pl-1">$</span>
        <input
          type="number"
          step="50"
          min="0"
          autoFocus
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="w-20 px-1 py-0.5 bg-transparent text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none tabular-nums"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-white transition-colors disabled:opacity-50"
          title="Guardar precio"
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
          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          title="Cancelar"
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
      className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
      title="Hacé clic para modificar el precio"
    >
      <span className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
        {formatPrice(price)}
      </span>
      <Pencil className="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition-colors" />
    </button>
  );
}
