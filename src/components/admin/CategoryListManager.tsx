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
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Categorías del Menú
          </h2>
          <p className="text-xs text-slate-500">
            Organizá las secciones de tu carta.
          </p>
        </div>

        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
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
          className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200"
        >
          <input
            type="text"
            required
            autoFocus
            placeholder="Nombre de la categoría (ej. Pizzas, Bebidas, Postres)"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
          />
          <button
            type="submit"
            disabled={loading || !newCatName.trim()}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-1"
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
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
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
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            selectedCategoryId === null
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Todas
        </button>

        {categories.length === 0 ? (
          <span className="text-xs text-slate-400 italic">
            No tenés categorías creadas todavía. Hacé clic en &quot;Nueva Categoría&quot;.
          </span>
        ) : (
          categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;

            return (
              <div
                key={cat.id}
                className={`inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className="focus:outline-none"
                >
                  <span>{cat.name}</span>
                  <span
                    className={`ml-1.5 tabular-nums text-[11px] font-semibold ${
                      isSelected ? "text-slate-300" : "text-slate-400"
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
                    className={`p-0.5 rounded-full hover:bg-rose-100 hover:text-rose-600 transition-colors ${
                      isSelected ? "text-slate-400 hover:text-rose-300" : "text-slate-400"
                    }`}
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
