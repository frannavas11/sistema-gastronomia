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
          toast.success(`Categoría "${newCategoryName.trim()}" creada.`);
          if (res.category) {
            setAddedCategories((prev) => [...prev, res.category!]);
            setSelectedCategoryId(res.category.id);
          }
          setNewCategoryName("");
          setMode("product");
          router.refresh();
        }
      } else {
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
        className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-white bg-[#78232F] hover:bg-[#541923] transition-colors shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#78232F] focus-visible:ring-offset-2"
      >
        <Plus className="w-4 h-4" />
        <span>Nuevo Producto</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FFFCF8] border border-[#E9DAD2] rounded-2xl max-w-lg w-full p-6 shadow-xl relative text-[#211B19]">
            {/* Cabecera */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E9DAD2] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F6EBE4] text-[#78232F] flex items-center justify-center">
                  {mode === "product" ? (
                    <Utensils className="w-4 h-4" />
                  ) : (
                    <FolderPlus className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-normal text-[#211B19]">
                    {mode === "product"
                      ? "Agregar Nuevo Producto"
                      : "Agregar Nueva Categoría"}
                  </h3>
                  <p className="text-xs text-[#74645E]">
                    {mode === "product"
                      ? "Creá un plato o bebida para tu carta"
                      : "Organizá tus productos en una nueva sección"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="min-h-[44px] min-w-[44px] rounded-full text-[#74645E] hover:text-[#211B19] hover:bg-[#F6EBE4] transition-colors flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector de modo (Producto / Categoría) */}
            <div className="flex rounded-xl bg-[#F6EBE4] p-1 mb-4 border border-[#E9DAD2]">
              <button
                type="button"
                onClick={() => setMode("product")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  mode === "product"
                    ? "bg-[#FFFCF8] text-[#78232F] shadow-xs font-semibold"
                    : "text-[#74645E] hover:text-[#211B19]"
                }`}
              >
                Producto
              </button>
              <button
                type="button"
                onClick={() => setMode("category")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  mode === "category"
                    ? "bg-[#FFFCF8] text-[#78232F] shadow-xs font-semibold"
                    : "text-[#74645E] hover:text-[#211B19]"
                }`}
              >
                Categoría
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-[#FDE8E7] border border-[#FAC5C2] text-xs text-[#C74742]">
                {error}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "category" ? (
                <div>
                  <label className="block text-xs font-medium text-[#74645E] mb-1">
                    Nombre de la Categoría
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Pizzas Especiales, Empanadas, Bebidas..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FBF5EF] border border-[#E9DAD2] rounded-xl text-sm text-[#211B19] placeholder:text-[#A18A81] focus:outline-none focus:ring-2 focus:ring-[#78232F] focus:bg-[#FFFCF8]"
                  />
                  <p className="text-[11px] text-[#74645E] mt-1">
                    Al crear la categoría, podrás asociarle productos inmediatamente.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#74645E] mb-1">
                      Categoría
                    </label>
                    {allCategories.length > 0 ? (
                      <select
                        value={activeCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FBF5EF] border border-[#E9DAD2] rounded-xl text-sm text-[#211B19] focus:outline-none focus:ring-2 focus:ring-[#78232F] focus:bg-[#FFFCF8]"
                      >
                        {allCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 rounded-xl bg-[#FEF3E2] border border-[#FAD7A0] text-xs text-[#8C5815]">
                        No tenés categorías creadas. Cambiá a la pestaña &quot;Categoría&quot; arriba para crear la primera.
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#74645E] mb-1">
                      Nombre del Producto
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Pizza Napolitana Grande"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FBF5EF] border border-[#E9DAD2] rounded-xl text-sm text-[#211B19] placeholder:text-[#A18A81] focus:outline-none focus:ring-2 focus:ring-[#78232F] focus:bg-[#FFFCF8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#74645E] mb-1">
                      Descripción (opcional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ej. Salsa de tomate casera, muzzarella y albahaca fresca."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FBF5EF] border border-[#E9DAD2] rounded-xl text-sm text-[#211B19] placeholder:text-[#A18A81] focus:outline-none focus:ring-2 focus:ring-[#78232F] focus:bg-[#FFFCF8] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#74645E] mb-1">
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
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FBF5EF] border border-[#E9DAD2] rounded-xl text-sm text-[#211B19] placeholder:text-[#A18A81] focus:outline-none focus:ring-2 focus:ring-[#78232F] focus:bg-[#FFFCF8] tabular-nums"
                    />
                  </div>

                  <ImageUploadInput
                    storeId={storeId}
                    value={imageUrl}
                    onChange={setImageUrl}
                  />
                </>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E9DAD2]">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium text-[#74645E] hover:text-[#211B19] hover:bg-[#F6EBE4] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || (mode === "product" && allCategories.length === 0)}
                  className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-white bg-[#78232F] hover:bg-[#541923] disabled:opacity-50 transition-colors shadow-xs"
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
