"use client";

import { useState } from "react";
import { Check, X, Pencil, Loader2 } from "lucide-react";
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
      return;
    }

    setLoading(true);
    const result = await updateProductBasePrice(productId, storeId, numeric);

    if (result.success) {
      setPrice(numeric);
      setIsEditing(false);
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
      <div className="inline-flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-rose-500/50 shadow-sm animate-fade-in">
        <span className="text-xs font-semibold text-zinc-400 pl-1.5">$</span>
        <input
          type="number"
          step="50"
          min="0"
          autoFocus
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="w-24 px-1.5 py-0.5 bg-transparent text-sm font-bold text-zinc-100 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50"
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
          className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
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
      className="group inline-flex items-center gap-2 px-2.5 py-1 rounded-xl hover:bg-zinc-800/80 transition-colors border border-transparent hover:border-zinc-700"
      title="Hacé clic para modificar el precio rápido"
    >
      <span className="text-sm font-bold text-zinc-100 group-hover:text-rose-400 transition-colors">
        {formatPrice(price)}
      </span>
      <Pencil className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
    </button>
  );
}

