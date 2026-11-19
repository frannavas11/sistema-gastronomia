"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createCategory, deleteCategory } from "@/app/admin/actions";

interface Category {
  id: string;
  name: string;
  count: number;
}

interface CategoryListManagerProps {
  storeId: string;
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export function CategoryListManager({
  storeId,
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryListManagerProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setLoading(true);
    try {
      const res = await createCategory(storeId, newCatName.trim());
      if (res.success) {
        toast.success(`Categoría "${newCatName.trim()}" creada con éxito.`);
        setNewCatName("");
        setIsAdding(false);
        router.refresh();
      } else {
        toast.error(res.error || "No se pudo crear la categoría.");
      }
    } catch {
      toast.error("Error al crear categoría.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (cat.count > 0) {
      toast.error(`No podés eliminar "${cat.name}" porque contiene ${cat.count} producto(s).`);
      return;
    }

    if (!confirm(`¿Eliminar la categoría "${cat.name}"?`)) return;

    setDeletingId(cat.id);
    try {
      const res = await deleteCategory(storeId, cat.id);
      if (res.success) {
        toast.success(`Categoría "${cat.name}" eliminada.`);
        if (selectedCategoryId === cat.id) {
          onSelectCategory(null);
        }
        router.refresh();
      } else {
        toast.error(res.error || "Error al eliminar categoría.");
      }
    } catch {
      toast.error("Error al eliminar categoría.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-base font-normal text-text-primary">
            Categorías del Menú
          </h2>
          <p className="text-xs text-text-secondary">
            Organizá las secciones de tu carta.
          </p>
        </div>

        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-brand-fg bg-surface-2 hover:bg-border transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Categoría</span>
          </button>
        )}
      </div>

      {/* Formulario rápido para agregar categoría */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="flex items-center gap-2 p-2 rounded-xl bg-surface-2 border border-border"
        >
          <input
            type="text"
            required
            autoFocus
            placeholder="Nombre de la categoría (ej. Pizzas, Empanadas, Bebidas)"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 min-h-[44px] px-3.5 py-2 bg-surface border border-border rounded-xl text-xs sm:text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <button
            type="submit"
            disabled={loading || !newCatName.trim()}
            className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand hover:bg-brand-dark disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            <span>Guardar</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setNewCatName("");
            }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-text-secondary hover:text-text-primary rounded-xl"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Píldoras de categorías */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={`min-h-[44px] px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer select-none ${
            selectedCategoryId === null
              ? "bg-brand text-white shadow-xs font-semibold"
              : "bg-surface-2 text-text-secondary hover:text-text-primary hover:bg-border"
          }`}
        >
          Todas
        </button>

        {categories.length === 0 ? (
          <span className="text-xs text-text-secondary italic">
            No tenés categorías creadas todavía. Hacé clic en &quot;Nueva Categoría&quot;.
          </span>
        ) : (
          categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;

            return (
              <div
                key={cat.id}
                className={`inline-flex items-center gap-1.5 pl-3.5 pr-2 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[44px] select-none ${
                  isSelected
                    ? "bg-brand text-white shadow-xs font-semibold"
                    : "bg-surface-2 text-text-secondary hover:text-text-primary hover:bg-border"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className="focus:outline-none cursor-pointer"
                >
                  <span>{cat.name}</span>
                  <span
                    className={`ml-1.5 tabular-nums text-[11px] font-semibold ${
                      isSelected ? "text-white/80" : "text-text-secondary"
                    }`}
                  >
                    ({cat.count})
                  </span>
                </button>

                {cat.count === 0 && (
                  <button
                    type="button"
                    onClick={() => handleDelete(cat)}
                    disabled={deletingId === cat.id}
                    title="Eliminar categoría vacía"
                    className="p-1 rounded-full hover:bg-error-soft hover:text-error transition-colors text-inherit opacity-70 hover:opacity-100"
                  >
                    {deletingId === cat.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
