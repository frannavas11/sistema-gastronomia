"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Pencil, X, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { updateProduct, deleteProduct } from "@/app/admin/actions";
import { ImageUploadInput } from "@/components/admin/ImageUploadInput";

interface CategoryOption {
  id: string;
  name: string;
}

export interface ProductToEdit {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  category_id: string;
  image_url: string | null;
}

interface EditProductModalProps {
  storeId: string;
  product: ProductToEdit | null;
  categories: CategoryOption[];
  isOpen: boolean;
  onClose: () => void;
}

interface EditProductModalContentProps {
  storeId: string;
  product: ProductToEdit;
  categories: CategoryOption[];
  onClose: () => void;
}

function EditProductModalContent({
  storeId,
  product,
  categories,
  onClose,
}: EditProductModalContentProps) {
  const router = useRouter();

  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description || "");
  const [basePrice, setBasePrice] = useState(String(product.base_price));
  const [categoryId, setCategoryId] = useState(product.category_id);
  const [imageUrl, setImageUrl] = useState(product.image_url || "");

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceNum = parseFloat(basePrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Ingresá un precio válido.");
      return;
    }
    if (!categoryId) {
      setError("Debés seleccionar una categoría.");
      return;
    }
    if (!name.trim()) {
      setError("El nombre del producto es obligatorio.");
      return;
    }

    setLoading(true);

    try {
      const res = await updateProduct({
        storeId,
        productId: product.id,
        categoryId,
        name: name.trim(),
        description: description.trim() || undefined,
        basePrice: priceNum,
        imageUrl: imageUrl.trim() || null,
      });

      if (!res.success) {
        setError(res.error || "Error al actualizar el producto.");
      } else {
        toast.success(`Producto "${name.trim()}" actualizado.`);
        onClose();
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Seguro que deseás eliminar el producto "${product.name}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await deleteProduct(product.id, storeId);
      if (res.success) {
        toast.success(`Producto "${product.name}" eliminado.`);
        onClose();
        router.refresh();
      } else {
        toast.error(res.error || "No se pudo eliminar el producto.");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar el producto");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade">
      <div className="bg-surface border border-border rounded-2xl max-w-lg w-full p-6 shadow-xl relative text-text-primary max-h-[90vh] overflow-y-auto">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-surface-2 text-brand-fg flex items-center justify-center">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-normal text-text-primary">
                Editar Producto
              </h3>
              <p className="text-xs text-text-secondary">
                Modificá los datos del plato y su foto para la carta
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-error-soft border border-error-border text-xs text-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Categoría
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand focus:bg-surface"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Nombre del Producto
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Pizza Napolitana Grande"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand focus:bg-surface"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Descripción (opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ej. Salsa de tomate casera, muzzarella y albahaca fresca."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand focus:bg-surface resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
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
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand focus:bg-surface tabular-nums"
            />
          </div>

          <ImageUploadInput
            storeId={storeId}
            value={imageUrl}
            onChange={setImageUrl}
          />

          <div className="pt-3 flex items-center justify-between gap-2 border-t border-border flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading || deleting}
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium text-error hover:bg-error-soft transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              {deleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>Eliminar producto</span>
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={loading || deleting}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || deleting}
                className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-white bg-brand hover:bg-brand-dark disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditProductModal({
  storeId,
  product,
  categories,
  isOpen,
  onClose,
}: EditProductModalProps) {
  if (!isOpen || !product || typeof document === "undefined") return null;

  return createPortal(
    <EditProductModalContent
      key={product.id}
      storeId={storeId}
      product={product}
      categories={categories}
      onClose={onClose}
    />,
    document.body,
  );
}
