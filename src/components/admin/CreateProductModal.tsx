"use client";

import { useState } from "react";
import { Plus, X, Loader2, Utensils, FolderPlus } from "lucide-react";
import { createProduct, createCategory } from "@/app/admin/actions";

interface Category {
  id: string;
  name: string;
}

interface CreateProductModalProps {
  storeId: string;
  categories: Category[];
}

export function CreateProductModal({
  storeId,
  categories,
}: CreateProductModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"product" | "category">("product");

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setDescription("");
    setBasePrice("");
    setNewCategoryName("");
    setImageUrl("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "category") {
        if (!newCategoryName.trim()) {
          setError("El nombre de la categoría es requerido.");
          setLoading(false);
          return;
        }

        const res = await createCategory(storeId, newCategoryName.trim());
        if (!res.success) {
          setError(res.error || "Error al crear la categoría.");
        } else {
          resetForm();
          setIsOpen(false);
        }
      } else {
        if (!name.trim()) {
          setError("El nombre del producto es requerido.");
          setLoading(false);
          return;
        }
        const priceNum = parseFloat(basePrice);
        if (isNaN(priceNum) || priceNum < 0) {
          setError("Ingresá un precio válido.");
          setLoading(false);
          return;
        }
        if (!categoryId) {
          setError("Debes seleccionar una categoría. Si no hay ninguna, creá una primero.");
          setLoading(false);
          return;
        }

        const res = await createProduct({
          storeId,
          categoryId,
          name: name.trim(),
          description: description.trim() || undefined,
          basePrice: priceNum,
          imageUrl: imageUrl.trim() || undefined,
        });

        if (!res.success) {
          setError(res.error || "Error al crear el producto.");
        } else {
          resetForm();
          setIsOpen(false);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          resetForm();
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
      >
        <Plus className="w-4 h-4" />
        <span>Nuevo Ítem / Categoría</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            {/* Cabecera */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  {mode === "product" ? (
                    <Utensils className="w-5 h-5" />
                  ) : (
                    <FolderPlus className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">
                    {mode === "product"
                      ? "Agregar Nuevo Producto"
                      : "Agregar Nueva Categoría"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {mode === "product"
                      ? "Creá un plato o bebida para tu carta"
                      : "Organizá tus productos en una nueva sección"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector de modo (Producto / Categoría) */}
            <div className="flex rounded-xl bg-zinc-950 p-1 mb-5 border border-zinc-800">
              <button
                type="button"
                onClick={() => setMode("product")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  mode === "product"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Producto
              </button>
              <button
                type="button"
                onClick={() => setMode("category")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  mode === "category"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Categoría
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                {error}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "category" ? (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Nombre de la Categoría
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Pizzas Especiales, Empanadas, Bebidas..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Categoría
                    </label>
                    {categories.length > 0 ? (
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                        No tenés categorías creadas. Cambiá a la pestaña &quot;Categoría&quot; arriba para crear la primera.
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Nombre del Producto
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Pizza Napolitana Grande"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Descripción (opcional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ej. Salsa de tomate casera, muzzarella, rodajas de tomate y albahaca fresca."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Precio Base ($)
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="50"
                        placeholder="Ej. 9500"
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                        URL de Imagen (opcional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || (mode === "product" && categories.length === 0)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{mode === "product" ? "Crear Producto" : "Crear Categoría"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

