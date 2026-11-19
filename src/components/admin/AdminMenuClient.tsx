"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { UtensilsCrossed, PackageOpen, HelpCircle, Pencil } from "lucide-react";
import { ProductAvailabilityToggle } from "@/components/admin/ProductAvailabilityToggle";
import { QuickPriceEditor } from "@/components/admin/QuickPriceEditor";
import { CreateProductModal } from "@/components/admin/CreateProductModal";
import { EditProductModal } from "@/components/admin/EditProductModal";
import { ProductOptionsManagerModal } from "@/components/admin/ProductOptionsManagerModal";
import { CategoryListManager } from "@/components/admin/CategoryListManager";

interface Category {
  id: string;
  name: string;
  display_order: number | null;
  is_active: boolean | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  is_available: boolean | null;
  is_active: boolean | null;
  category_id: string;
  image_url: string | null;
  display_order: number | null;
}

interface AdminMenuClientProps {
  storeId: string;
  categories: Category[];
  products: Product[];
}

export function AdminMenuClient({ storeId, categories, products }: AdminMenuClientProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Mapear nombre de categoría por id
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  // Contar productos por categoría
  const categoriesWithCounts = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) => {
      counts.set(p.category_id, (counts.get(p.category_id) || 0) + 1);
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      count: counts.get(cat.id) || 0,
    }));
  }, [categories, products]);

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ id: c.id, name: c.name })),
    [categories],
  );

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    if (!selectedCategoryId) return products;
    return products.filter((p) => p.category_id === selectedCategoryId);
  }, [products, selectedCategoryId]);

  return (
    <div className="space-y-8">
      {/* 1. Cabecera */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 animate-rise">
        <div>
          <p className="eyebrow text-brand-fg">La carta</p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl tracking-tight text-text-primary">
            Menú y precios
          </h1>
          <p className="mt-2 text-text-secondary">
            Categorías, platos, precios y disponibilidad. Los cambios se ven al instante en la carta.
          </p>
        </div>

        <CreateProductModal storeId={storeId} categories={categoryOptions} />
      </header>

      {/* 2. Gestor visual de Categorías */}
      <CategoryListManager
        storeId={storeId}
        categories={categoriesWithCounts}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      {/* 3. Listado y Tabla de Productos */}
      {products.length === 0 ? (
        <div className="py-16 px-6 text-center rounded-2xl bg-surface border border-border shadow-xs max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border mx-auto flex items-center justify-center text-brand-fg mb-4">
            <PackageOpen className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-xl font-normal text-text-primary">
            Tu menú aún no tiene productos
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary max-w-sm mx-auto mt-1.5 mb-6 leading-relaxed">
            Comenzá creando una categoría arriba (ej. Pizzas, Empanadas, Bebidas) y agregá tus primeros platos para que aparezcan en la carta pública.
          </p>
          <CreateProductModal storeId={storeId} categories={categoryOptions} />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-14 px-6 text-center rounded-2xl bg-surface border border-border shadow-xs max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border mx-auto flex items-center justify-center text-brand-fg">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-normal text-text-primary">
            Categoría sin productos
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary max-w-xs mx-auto leading-relaxed">
            No hay platos cargados en &quot;{categoryMap.get(selectedCategoryId || "")}&quot;. Podés agregar uno con el botón &quot;Nuevo Producto&quot;.
          </p>
          <button
            type="button"
            onClick={() => setSelectedCategoryId(null)}
            className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-brand-fg bg-surface-2 hover:bg-border transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            Ver todos los productos
          </button>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-brand-fg" />
              <span className="text-xs font-semibold text-text-primary">
                Productos ({filteredProducts.length}
                {selectedCategoryId ? ` en ${categoryMap.get(selectedCategoryId)}` : ""})
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Hacé clic en cualquier precio para editarlo en el acto</span>
            </div>
          </div>

          {/* Tabla de Productos estilo Dashboard de Referencia */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-2/60 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">Foto</th>
                  <th className="py-3 px-4">Nombre</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Categoría</th>
                  <th className="py-3 px-4">Precio</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((product) => {
                  const catName = categoryMap.get(product.category_id) || "Sin categoría";

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-surface-2/40 transition-colors"
                    >
                      {/* Foto */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(product)}
                          title="Editar producto y foto"
                          className="relative w-11 h-11 rounded-xl overflow-hidden bg-surface-2 border border-border shrink-0 hover:ring-2 hover:ring-brand hover:opacity-90 transition-all cursor-pointer group text-left block"
                        >
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="44px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-tertiary group-hover:text-brand-fg">
                              <UtensilsCrossed className="w-5 h-5" />
                            </div>
                          )}
                        </button>
                      </td>

                      {/* Nombre y descripción */}
                      <td className="py-3 px-4 min-w-[180px]">
                        <div className="font-semibold text-sm text-text-primary leading-tight">
                          {product.name}
                        </div>
                        {product.description && (
                          <p className="text-xs text-text-secondary mt-0.5 line-clamp-1 max-w-xs">
                            {product.description}
                          </p>
                        )}
                        <span className="sm:hidden inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-2 text-text-secondary border border-border mt-1">
                          {catName}
                        </span>
                      </td>

                      {/* Categoría */}
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-surface-2 text-text-secondary border border-border">
                          {catName}
                        </span>
                      </td>

                      {/* Precio editable */}
                      <td className="py-3 px-4">
                        <QuickPriceEditor
                          productId={product.id}
                          storeId={storeId}
                          initialPrice={product.base_price}
                        />
                      </td>

                      {/* Estado switch Activo/Agotado */}
                      <td className="py-3 px-4">
                        <ProductAvailabilityToggle
                          productId={product.id}
                          storeId={storeId}
                          initialIsAvailable={product.is_available ?? true}
                        />
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(product)}
                            title="Editar plato y foto"
                            className="min-h-[36px] px-2.5 py-1.5 rounded-xl text-xs font-semibold text-text-primary bg-surface-2 hover:bg-border transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Editar</span>
                          </button>
                          <ProductOptionsManagerModal
                            storeId={storeId}
                            productId={product.id}
                            productName={product.name}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para editar producto existente y su foto */}
      <EditProductModal
        storeId={storeId}
        product={editingProduct}
        categories={categoryOptions}
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
      />
    </div>
  );
}
