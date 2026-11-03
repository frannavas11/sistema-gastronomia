import { redirect } from "next/navigation";
import Image from "next/image";
import {
  UtensilsCrossed,
  Sparkles,
  Search,
  PackageOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductAvailabilityToggle } from "@/components/admin/ProductAvailabilityToggle";
import { QuickPriceEditor } from "@/components/admin/QuickPriceEditor";
import { CreateProductModal } from "@/components/admin/CreateProductModal";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Obtener el comercio del usuario
  const { data: store } = await supabase
    .from("stores")
    .select("id, name, slug")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!store) {
    return (
      <div className="p-8 text-center text-zinc-400">
        No se encontró ningún local vinculado a tu usuario.
      </div>
    );
  }

  // Consultar categorías y productos de este comercio
  const [categoriesResult, productsResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, display_order, is_active")
      .eq("store_id", store.id)
      .order("display_order", { ascending: true }),
    supabase
      .from("products")
      .select("id, name, description, base_price, is_available, is_active, category_id, image_url, display_order")
      .eq("store_id", store.id)
      .order("display_order", { ascending: true }),
  ]);

  const categories = categoriesResult.data ?? [];
  const products = productsResult.data ?? [];

  // Mapear nombre de categoría por id
  const categoryMap = new Map<string, string>();
  categories.forEach((cat) => categoryMap.set(cat.id, cat.name));

  return (
    <div className="space-y-6">
      {/* 1. Cabecera de la sección de Menú */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-rose-400" />
              Gestión de Carta
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            Menú y Precios
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Pausá productos agotados con un clic y modificá los precios base en tiempo real.
          </p>
        </div>

        <CreateProductModal
          storeId={store.id}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        />
      </div>

      {/* 2. Listado de Productos */}
      {products.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-zinc-900 border border-zinc-800">
          <div className="w-16 h-16 rounded-3xl bg-zinc-800/80 mx-auto flex items-center justify-center text-zinc-500 mb-4">
            <PackageOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-200">
            Tu menú aún no tiene productos
          </h3>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto mt-1 mb-5">
            Comenzá creando una categoría (ej. Pizzas, Hamburguesas) y agregá tus primeros platos con sus precios base.
          </p>
          <CreateProductModal
            storeId={store.id}
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          />
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Productos en Carta ({products.length})
              </span>
            </div>
            <span className="text-xs text-zinc-500">
              💡 Tocá cualquier precio para editarlo rápidamente
            </span>
          </div>

          <div className="divide-y divide-zinc-800/80">
            {products.map((product) => {
              const catName = categoryMap.get(product.category_id) || "Sin categoría";

              return (
                <div
                  key={product.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-850/40 transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Imagen o Placeholder */}
                    {product.image_url ? (
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-zinc-800 flex-shrink-0 border border-zinc-700/60">
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="60px"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-500 flex-shrink-0">
                        <UtensilsCrossed className="w-6 h-6 text-zinc-600" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-bold text-zinc-100 truncate">
                          {product.name}
                        </h4>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                          {catName}
                        </span>
                      </div>
                      {product.description && (
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-1 max-w-lg">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Acciones Rápidas: Precio y Disponibilidad */}
                  <div className="flex items-center justify-between sm:justify-end gap-3.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                    <div className="flex flex-col items-start sm:items-end">
                      <span className="text-[10px] uppercase font-semibold text-zinc-500">
                        Precio Base
                      </span>
                      <QuickPriceEditor
                        productId={product.id}
                        storeId={store.id}
                        initialPrice={product.base_price}
                      />
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[10px] uppercase font-semibold text-zinc-500 mb-1">
                        Estado
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

