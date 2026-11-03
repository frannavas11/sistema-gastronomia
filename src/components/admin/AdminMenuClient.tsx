"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { UtensilsCrossed, PackageOpen, HelpCircle } from "lucide-react";
import { ProductAvailabilityToggle } from "@/components/admin/ProductAvailabilityToggle";
import { QuickPriceEditor } from "@/components/admin/QuickPriceEditor";
import { CreateProductModal } from "@/components/admin/CreateProductModal";
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
  store: {
    id: string;
    name: string;
    slug: string;
  };
  categories: Category[];
  products: Product[];
}

export function AdminMenuClient({
  store,
  categories,
  products,
}: AdminMenuClientProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

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

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    if (!selectedCategoryId) return products;
    return products.filter((p) => p.category_id === selectedCategoryId);
  }, [products, selectedCategoryId]);

  return (
    <div className="space-y-6">
      {/* 1. Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Menú y Precios
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Administrá categorías, platos, precios y disponibilidad en tiempo real.
          </p>
        </div>

        <CreateProductModal
          storeId={store.id}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        />
      </div>

      {/* 2. Gestor visual de Categorías */}
      <CategoryListManager
        storeId={store.id}
        categories={categoriesWithCounts}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      {/* 3. Listado de Productos */}
      {products.length === 0 ? (
        <div className="p-10 text-center rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 mx-auto flex items-center justify-center text-slate-500 mb-3">
            <PackageOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            Tu menú aún no tiene productos
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            Comenzá creando una categoría arriba (ej. Pizzas, Bebidas) y agregá tus primeros platos.
          </p>
          <CreateProductModal
            storeId={store.id}
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-xs sm:text-sm text-slate-500">
            No hay productos en la categoría seleccionada.
          </p>
          <button
            type="button"
            onClick={() => setSelectedCategoryId(null)}
            className="mt-2 text-xs font-medium text-slate-900 hover:underline"
          >
            Ver todos los productos
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-700">
                Productos ({filteredProducts.length}
                {selectedCategoryId ? ` en ${categoryMap.get(selectedCategoryId)}` : ""})
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Hacé clic en cualquier precio para editarlo</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredProducts.map((product) => {
              const catName = categoryMap.get(product.category_id) || "Sin categoría";

              return (
                <div
                  key={product.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Imagen o Thumbnail */}
                    {product.image_url ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                        <UtensilsCrossed className="w-5 h-5 text-slate-400" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-slate-900 truncate">
                          {product.name}
                        </h4>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {catName}
                        </span>
                      </div>
                      {product.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-lg">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Acciones Rápidas */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-wrap">
                    <div className="flex flex-col items-start sm:items-end">
                      <span className="text-[10px] font-medium text-slate-400 mb-0.5">
                        Variantes
                      </span>
                      <ProductOptionsManagerModal
                        storeId={store.id}
                        productId={product.id}
                        productName={product.name}
                      />
                    </div>

                    <div className="flex flex-col items-start sm:items-end">
                      <span className="text-[10px] font-medium text-slate-400 mb-0.5">
                        Precio Base
                      </span>
                      <QuickPriceEditor
                        productId={product.id}
                        storeId={store.id}
                        initialPrice={product.base_price}
                      />
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-medium text-slate-400 mb-0.5">
                        Disponibilidad
                      </span>
                      <ProductAvailabilityToggle
                        productId={product.id}
                        storeId={store.id}
                        initialIsAvailable={product.is_available ?? true}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
