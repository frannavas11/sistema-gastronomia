import { cache } from "react";
import { createClient } from "./server";
import type {
  CatalogData,
  CategoryWithProducts,
  ProductOptionGroupWithItems,
  ProductOptionItem,
  ProductWithOptions,
} from "@/types/store";

/**
 * Obtiene los datos del comercio y su catálogo completo (categorías, productos activos y grupos de opciones).
 * Está envuelta en `cache()` de React para que llamadas en `generateMetadata` y en el
 * Server Component de la página compartan la misma ejecución sin repetir consultas a Supabase.
 */
export const getStoreCatalog = cache(
  async (slug: string): Promise<CatalogData | null> => {
    const supabase = await createClient();

    // 1. Obtener la tienda por su slug (solo campos públicos, excluyendo owner_id por higiene de datos)
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select(
        "id, name, slug, phone_whatsapp, is_open, delivery_cost, min_order_amount, theme_colors, logo_url, banner_url",
      )
      .eq("slug", slug)
      .single();

    if (storeError) {
      console.error("[getStoreCatalog] Error al consultar la tienda en Supabase:", storeError);
      return null;
    }

    if (!store) {
      console.warn(`[getStoreCatalog] Tienda no encontrada para el slug: "${slug}"`);
      return null;
    }

    // 2. Consultar en paralelo: categorías activas, productos activos y modificadores
    const [categoriesResult, productsResult, optionGroupsResult] =
      await Promise.all([
        supabase
          .from("categories")
          .select("*")
          .eq("store_id", store.id)
          .eq("is_active", true)
          .order("display_order", { ascending: true }),
        supabase
          .from("products")
          .select("*")
          .eq("store_id", store.id)
          .eq("is_active", true)
          .order("display_order", { ascending: true }),
        supabase
          .from("product_option_groups")
          .select(
            `
            *,
            product_option_items (
              *
            )
          `,
          )
          .eq("store_id", store.id),
      ]);

    if (categoriesResult.error) {
      console.error("[getStoreCatalog] Error al consultar categorías:", categoriesResult.error);
    }
    if (productsResult.error) {
      console.error("[getStoreCatalog] Error al consultar productos:", productsResult.error);
    }
    if (optionGroupsResult.error) {
      console.error("[getStoreCatalog] Error al consultar grupos de opciones:", optionGroupsResult.error);
    }

    const rawCategories = categoriesResult.data ?? [];
    const rawProducts = productsResult.data ?? [];
    const rawOptionGroups = optionGroupsResult.data ?? [];

    // 3. Organizar los grupos de opciones e ítems por producto
    const optionGroupsByProduct = new Map<
      string,
      ProductOptionGroupWithItems[]
    >();

    for (const group of rawOptionGroups) {
      const items = (
        (group.product_option_items as ProductOptionItem[]) ?? []
      ).filter((item) => item.is_available !== false);

      const groupWithItems: ProductOptionGroupWithItems = {
        id: group.id,
        created_at: group.created_at,
        is_required: group.is_required,
        max_selectable: group.max_selectable,
        name: group.name,
        product_id: group.product_id,
        store_id: group.store_id,
        items,
      };

      const existing = optionGroupsByProduct.get(group.product_id) ?? [];
      existing.push(groupWithItems);
      optionGroupsByProduct.set(group.product_id, existing);
    }

    // 4. Mapear y anidar productos dentro de sus respectivas categorías
    const categoryMap = new Map<string, CategoryWithProducts>();

    for (const cat of rawCategories) {
      categoryMap.set(cat.id, {
        ...cat,
        products: [],
      });
    }

    const uncategorizedProducts: ProductWithOptions[] = [];

    for (const prod of rawProducts) {
      const productWithOptions: ProductWithOptions = {
        ...prod,
        option_groups: optionGroupsByProduct.get(prod.id) ?? [],
      };

      const category = categoryMap.get(prod.category_id);
      if (category) {
        category.products.push(productWithOptions);
      } else {
        uncategorizedProducts.push(productWithOptions);
      }
    }

    const categories = Array.from(categoryMap.values());

    // Si existen productos activos cuya categoría no esté activa o no exista, se agrupan en "Otros"
    if (uncategorizedProducts.length > 0) {
      categories.push({
        id: "uncategorized",
        store_id: store.id,
        name: "Otros",
        display_order: 9999,
        is_active: true,
        created_at: null,
        products: uncategorizedProducts,
      });
    }

    return {
      store,
      categories,
    };
  },
);
