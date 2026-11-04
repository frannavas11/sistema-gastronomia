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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[#E9DAD2]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-[#211B19]">
            Menú y Precios
          </h1>
          <p className="text-xs sm:text-sm text-[#74645E] mt-1">
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

      {/* 3. Listado y Tabla de Productos */}
      {products.length === 0 ? (
        <div className="py-16 px-6 text-center rounded-2xl bg-[#FFFCF8] border border-[#E9DAD2] shadow-xs max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#F6EBE4] border border-[#E9DAD2] mx-auto flex items-center justify-center text-[#78232F] mb-4">
            <PackageOpen className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-xl font-normal text-[#211B19]">
            Tu menú aún no tiene productos
          </h3>
          <p className="text-xs sm:text-sm text-[#74645E] max-w-sm mx-auto mt-1.5 mb-6 leading-relaxed">
            Comenzá creando una categoría arriba (ej. Pizzas, Empanadas, Bebidas) y agregá tus primeros platos para que aparezcan en la carta pública.
          </p>
          <CreateProductModal
            storeId={store.id}
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-14 px-6 text-center rounded-2xl bg-[#FFFCF8] border border-[#E9DAD2] shadow-xs max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#F6EBE4] border border-[#E9DAD2] mx-auto flex items-center justify-center text-[#78232F]">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-normal text-[#211B19]">
            Categoría sin productos
          </h3>
          <p className="text-xs sm:text-sm text-[#74645E] max-w-xs mx-auto leading-relaxed">
            No hay platos cargados en &quot;{categoryMap.get(selectedCategoryId || "")}&quot;. Podés agregar uno con el botón &quot;Nuevo Producto&quot;.
          </p>
          <button
            type="button"
            onClick={() => setSelectedCategoryId(null)}
            className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-[#78232F] bg-[#F6EBE4] hover:bg-[#E9DAD2] transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            Ver todos los productos
          </button>
        </div>
      ) : (
        <div className="bg-[#FFFCF8] border border-[#E9DAD2] rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#E9DAD2] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-[#78232F]" />
              <span className="text-xs font-semibold text-[#211B19]">
                Productos ({filteredProducts.length}
                {selectedCategoryId ? ` en ${categoryMap.get(selectedCategoryId)}` : ""})
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#74645E]">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Hacé clic en cualquier precio para editarlo en el acto</span>
            </div>
          </div>

          {/* Tabla de Productos estilo Dashboard de Referencia */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E9DAD2] bg-[#F6EBE4]/60 text-[11px] font-semibold text-[#74645E] uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">Foto</th>
                  <th className="py-3 px-4">Nombre</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Categoría</th>
                  <th className="py-3 px-4">Precio</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DAD2]">
                {filteredProducts.map((product) => {
                  const catName = categoryMap.get(product.category_id) || "Sin categoría";

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-[#F6EBE4]/40 transition-colors"
                    >
                      {/* Foto */}
                      <td className="py-3 px-4">
                        {product.image_url ? (
                          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#F6EBE4] border border-[#E9DAD2] shrink-0">
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="44px"
                            />
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-[#F6EBE4] border border-[#E9DAD2] flex items-center justify-center text-[#A18A81] shrink-0">
                            <UtensilsCrossed className="w-5 h-5" />
                          </div>
                        )}
                      </td>

                      {/* Nombre y descripción */}
                      <td className="py-3 px-4 min-w-[180px]">
                        <div className="font-semibold text-sm text-[#211B19] leading-tight">
                          {product.name}
                        </div>
                        {product.description && (
                          <p className="text-xs text-[#74645E] mt-0.5 line-clamp-1 max-w-xs">
                            {product.description}
                          </p>
                        )}
                        <span className="sm:hidden inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F6EBE4] text-[#74645E] border border-[#E9DAD2] mt-1">
                          {catName}
                        </span>
                      </td>

                      {/* Categoría */}
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-[#F6EBE4] text-[#74645E] border border-[#E9DAD2]">
                          {catName}
                        </span>
                      </td>

                      {/* Precio editable */}
                      <td className="py-3 px-4">
                        <QuickPriceEditor
                          productId={product.id}
                          storeId={store.id}
                          initialPrice={product.base_price}
                        />
                      </td>

                      {/* Estado switch Activo/Agotado */}
                      <td className="py-3 px-4">
                        <ProductAvailabilityToggle
                          productId={product.id}
                          storeId={store.id}
                          initialIsAvailable={product.is_available ?? true}
                        />
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-right">
                        <ProductOptionsManagerModal
                          storeId={store.id}
                          productId={product.id}
                          productName={product.name}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
