"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Utensils, FolderPlus } from "lucide-react";
import { toast } from "sonner";
import { createProduct, createCategory } from "@/app/admin/actions";
import { ImageUploadInput } from "@/components/admin/ImageUploadInput";

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
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"product" | "category">("product");

  // Categorías añadidas durante la sesión del modal
  const [addedCategories, setAddedCategories] = useState<Category[]>([]);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Combinar categorías del servidor con las creadas en el modal
  const allCategories = [...categories, ...addedCategories.filter((ac) => !categories.some((c) => c.id === ac.id))];
  const activeCategoryId = selectedCategoryId || allCategories[0]?.id || "";

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
          toast.success(`Categoría "${newCategoryName.trim()}" creada con éxito.`);
          if (res.category) {
            setAddedCategories((prev) => [
              ...prev,
              { id: res.category.id, name: res.category.name },
            ]);
            setSelectedCategoryId(res.category.id);
          }
          setNewCategoryName("");
          setMode("product");
          router.refresh();
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
        if (!activeCategoryId) {
          setError("Debés seleccionar una categoría. Si no hay ninguna, creá una primero.");
          setLoading(false);
          return;
        }

        const res = await createProduct({
          storeId,
          categoryId: activeCategoryId,
          name: name.trim(),
          description: description.trim() || undefined,
          basePrice: priceNum,
          imageUrl: imageUrl.trim() || undefined,
        });

        if (!res.success) {
          setError(res.error || "Error al crear el producto.");
        } else {
          toast.success(`Producto "${name.trim()}" agregado al menú.`);
          resetForm();
          setIsOpen(false);
          router.refresh();
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
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
      >
        <Plus className="w-4 h-4" />
        <span>Nuevo Ítem / Categoría</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl relative text-slate-900">
            {/* Cabecera */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  {mode === "product" ? (
                    <Utensils className="w-4 h-4" />
                  ) : (
                    <FolderPlus className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {mode === "product"
                      ? "Agregar Nuevo Producto"
                      : "Agregar Nueva Categoría"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {mode === "product"
                      ? "Creá un plato o bebida para tu carta"
                      : "Organizá tus productos en una nueva sección"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector de modo (Producto / Categoría) */}
            <div className="flex rounded-lg bg-slate-100 p-1 mb-4 border border-slate-200">
              <button
                type="button"
                onClick={() => setMode("product")}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  mode === "product"
                    ? "bg-white text-slate-900 shadow-2xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Producto
              </button>
              <button
                type="button"
                onClick={() => setMode("category")}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  mode === "category"
                    ? "bg-white text-slate-900 shadow-2xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Categoría
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {error}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "category" ? (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nombre de la Categoría
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Pizzas Especiales, Empanadas, Bebidas..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Al crear la categoría, podrás asociarle productos inmediatamente.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Categoría
                    </label>
                    {allCategories.length > 0 ? (
                      <select
                        value={activeCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                      >
                        {allCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                        No tenés categorías creadas. Cambiá a la pestaña &quot;Categoría&quot; arriba para crear la primera.
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nombre del Producto
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Pizza Napolitana Grande"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Descripción (opcional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ej. Salsa de tomate casera, muzzarella y albahaca fresca."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
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
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 tabular-nums"
                    />
                  </div>

                  <ImageUploadInput
                    storeId={storeId}
                    value={imageUrl}
                    onChange={setImageUrl}
                  />
                </>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || (mode === "product" && allCategories.length === 0)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-2xs"
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
