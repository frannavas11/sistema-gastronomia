"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Json } from "@/types/supabase";

type ServiceClient = ReturnType<typeof createServiceClient>;
type ActionResult<T extends object = object> =
  | ({ success: true } & T)
  | { success: false; error: string };

const DEFAULT_PRIMARY = "#78232F";

/**
 * Valida que la sesión actual pertenezca a un usuario autenticado
 * y que el comercio objetivo le pertenezca.
 */
async function verifyStoreOwnership(storeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("No autenticado. Por favor iniciá sesión.");
  }

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("id, slug, owner_id")
    .eq("id", storeId)
    .single();

  if (storeError || !store) {
    throw new Error("Comercio no encontrado.");
  }

  if (store.owner_id !== user.id) {
    throw new Error("No tenés permisos para administrar este comercio.");
  }

  return store;
}

/**
 * Envoltorio común de todas las acciones del panel: verifica la propiedad del local,
 * entrega un cliente service_role, revalida las rutas afectadas y normaliza los errores.
 * Antes este bloque try/catch + revalidate estaba copiado en cada acción.
 */
async function ownerAction<T extends object>(
  storeId: string,
  revalidate: string[],
  run: (ctx: { db: ServiceClient; store: { id: string; slug: string } }) => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    if (!storeId || typeof storeId !== "string") {
      throw new Error("ID de comercio no especificado.");
    }
    const store = await verifyStoreOwnership(storeId);
    const result = await run({ db: createServiceClient(), store });
    for (const path of revalidate) revalidatePath(path);
    revalidatePath(`/${store.slug}`);
    return { success: true, ...result };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error desconocido",
    };
  }
}

function assertValidPrice(value: number, message: string) {
  if (!Number.isFinite(value) || value < 0 || value > 100_000_000) {
    throw new Error(message);
  }
}

/**
 * Las imágenes se renderizan con next/image, que lanza un error (y rompe la carta entera)
 * si el host no está en `images.remotePatterns`. Sólo se aceptan URLs https de esos hosts.
 */
function normalizeImageUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("La URL de la imagen no es válida.");
  }
  const allowedHost =
    parsed.hostname.endsWith(".supabase.co") || parsed.hostname === "images.unsplash.com";
  if (parsed.protocol !== "https:" || !allowedHost) {
    throw new Error(
      "Por ahora sólo se aceptan imágenes subidas desde el panel (o de images.unsplash.com).",
    );
  }
  return parsed.toString();
}

/** Siguiente display_order para que lo nuevo quede al final (antes todo se creaba con 10). */
async function nextDisplayOrder(
  db: ServiceClient,
  table: "categories" | "products",
  storeId: string,
) {
  const { data } = await db
    .from(table)
    .select("display_order")
    .eq("store_id", storeId)
    .order("display_order", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  return (data?.display_order ?? 0) + 10;
}

/** Verifica que un grupo de opciones pertenezca al local (evita tocar datos de otros locales). */
async function assertGroupInStore(db: ServiceClient, groupId: string, storeId: string) {
  const { data } = await db
    .from("product_option_groups")
    .select("id")
    .eq("id", groupId)
    .eq("store_id", storeId)
    .maybeSingle();
  if (!data) throw new Error("El grupo no pertenece a este comercio.");
}

/** Verifica que una opción pertenezca al local a través de su grupo. */
async function assertOptionItemInStore(db: ServiceClient, itemId: string, storeId: string) {
  const { data: item } = await db
    .from("product_option_items")
    .select("id, product_option_groups!inner(store_id)")
    .eq("id", itemId)
    .maybeSingle();
  const itemStoreId = (item?.product_option_groups as { store_id?: string } | null)?.store_id;
  if (!item || itemStoreId !== storeId) {
    throw new Error("La opción no existe o no pertenece a este comercio.");
  }
}

// ─── Local ──────────────────────────────────────────────────────────────────

export async function toggleStoreOpenStatus(storeId: string, newIsOpen: boolean) {
  return ownerAction(storeId, ["/admin", "/admin/settings"], async ({ db }) => {
    const { error } = await db.from("stores").update({ is_open: newIsOpen }).eq("id", storeId);
    if (error) throw new Error(`Error al actualizar el estado del local: ${error.message}`);
    return { is_open: newIsOpen };
  });
}

export async function updateStoreSettings(payload: {
  storeId: string;
  name: string;
  phoneWhatsapp: string;
  deliveryCost: number;
  minOrderAmount: number;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  primaryColor?: string | null;
}) {
  return ownerAction(payload.storeId, ["/admin", "/admin/settings"], async ({ db }) => {
    const name = payload.name.trim();
    if (name.length < 2 || name.length > 80) {
      throw new Error("El nombre del comercio debe tener entre 2 y 80 caracteres.");
    }
    const phone = payload.phoneWhatsapp.replace(/\D/g, "");
    if (phone.length < 10 || phone.length > 15) {
      throw new Error("Ingresá un WhatsApp válido con código de país (ej. 5491122334455).");
    }
    assertValidPrice(payload.deliveryCost, "El costo de envío no es válido.");
    assertValidPrice(payload.minOrderAmount, "El monto mínimo no es válido.");

    const updateData: {
      name: string;
      phone_whatsapp: string;
      delivery_cost: number;
      min_order_amount: number;
      logo_url?: string | null;
      banner_url?: string | null;
      theme_colors?: Json;
    } = {
      name,
      phone_whatsapp: phone,
      delivery_cost: payload.deliveryCost,
      min_order_amount: payload.minOrderAmount,
    };

    if (payload.logoUrl !== undefined) updateData.logo_url = normalizeImageUrl(payload.logoUrl);
    if (payload.bannerUrl !== undefined) updateData.banner_url = normalizeImageUrl(payload.bannerUrl);

    if (payload.primaryColor !== undefined) {
      const color = payload.primaryColor?.trim() || DEFAULT_PRIMARY;
      if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color)) {
        throw new Error("El color principal debe ser un código hexadecimal válido (ej. #78232F).");
      }
      const { data: storeRecord } = await db
        .from("stores")
        .select("theme_colors")
        .eq("id", payload.storeId)
        .single();
      const existing = storeRecord?.theme_colors;
      const existingTheme =
        existing && typeof existing === "object" && !Array.isArray(existing)
          ? (existing as Record<string, Json>)
          : {};
      updateData.theme_colors = { ...existingTheme, primary: color };
    }

    const { error } = await db.from("stores").update(updateData).eq("id", payload.storeId);
    if (error) throw new Error(`Error al actualizar configuración: ${error.message}`);
    return {};
  });
}

/**
 * Sube una imagen al bucket público 'store-assets' de Supabase Storage.
 * Valida tamaño (máx 5MB) y tipo MIME; la extensión se deriva del tipo real, no del nombre.
 */
export async function uploadStoreImage(formData: FormData) {
  const storeId = formData.get("storeId");
  const file = formData.get("file");
  return ownerAction(typeof storeId === "string" ? storeId : "", [], async ({ db, store }) => {
    if (!(file instanceof File)) throw new Error("No se seleccionó ningún archivo para subir.");

    const extensions: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };
    const ext = extensions[file.type];
    if (!ext) {
      throw new Error("Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG, WEBP o GIF.");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("La imagen supera el límite de 5 MB permitido.");
    }

    const storagePath = `${store.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const { error: uploadError } = await db.storage
      .from("store-assets")
      .upload(storagePath, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
    if (uploadError) throw new Error(`Error al subir la imagen: ${uploadError.message}`);

    const { data } = db.storage.from("store-assets").getPublicUrl(storagePath);
    return { url: data.publicUrl };
  });
}

// ─── Pedidos ────────────────────────────────────────────────────────────────

export async function deleteOrder(storeId: string, orderId: number) {
  return ownerAction(storeId, ["/admin/orders", "/admin"], async ({ db }) => {
    // Primero se verifica que el pedido sea de este local: antes se borraban los ítems
    // de cualquier pedido (de cualquier local) y recién después se filtraba por store_id.
    const { data: order } = await db
      .from("orders")
      .select("id")
      .eq("id", orderId)
      .eq("store_id", storeId)
      .maybeSingle();
    if (!order) throw new Error("El pedido no existe o no pertenece a este comercio.");

    const { error: itemsError } = await db.from("order_items").delete().eq("order_id", orderId);
    if (itemsError) throw new Error(`Error al eliminar los ítems del pedido: ${itemsError.message}`);

    const { error } = await db.from("orders").delete().eq("id", orderId).eq("store_id", storeId);
    if (error) throw new Error(`Error al eliminar pedido: ${error.message}`);
    return {};
  });
}

// ─── Menú: categorías y productos ───────────────────────────────────────────

export async function createCategory(storeId: string, name: string) {
  return ownerAction(storeId, ["/admin/menu"], async ({ db }) => {
    const cleanName = name.trim();
    if (!cleanName) throw new Error("El nombre de la categoría es obligatorio.");
    if (cleanName.length > 60) throw new Error("El nombre de la categoría es demasiado largo.");

    const { data: category, error } = await db
      .from("categories")
      .insert({
        store_id: storeId,
        name: cleanName,
        is_active: true,
        display_order: await nextDisplayOrder(db, "categories", storeId),
      })
      .select()
      .single();
    if (error) throw new Error(`Error al crear categoría: ${error.message}`);
    return { category };
  });
}

/** Elimina una categoría del menú (solo si no contiene productos). */
export async function deleteCategory(storeId: string, categoryId: string) {
  return ownerAction(storeId, ["/admin/menu"], async ({ db }) => {
    const { count, error: countError } = await db
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category_id", categoryId)
      .eq("store_id", storeId);
    if (countError) {
      throw new Error(`Error al verificar productos de la categoría: ${countError.message}`);
    }
    if (count && count > 0) {
      throw new Error(
        `No podés eliminar esta categoría porque contiene ${count} producto(s). Reubicá o eliminá los productos primero.`,
      );
    }

    const { error } = await db
      .from("categories")
      .delete()
      .eq("id", categoryId)
      .eq("store_id", storeId);
    if (error) throw new Error(`Error al eliminar categoría: ${error.message}`);
    return {};
  });
}

export async function createProduct(payload: {
  storeId: string;
  categoryId: string;
  name: string;
  description?: string;
  basePrice: number;
  imageUrl?: string;
}) {
  return ownerAction(payload.storeId, ["/admin/menu"], async ({ db }) => {
    const name = payload.name.trim();
    if (!name) throw new Error("El nombre del producto es obligatorio.");
    if (name.length > 80) throw new Error("El nombre del producto es demasiado largo.");
    assertValidPrice(payload.basePrice, "El precio base debe ser un valor positivo.");

    const { data: category } = await db
      .from("categories")
      .select("id")
      .eq("id", payload.categoryId)
      .eq("store_id", payload.storeId)
      .maybeSingle();
    if (!category) throw new Error("La categoría seleccionada no pertenece a este comercio.");

    const { data: product, error } = await db
      .from("products")
      .insert({
        store_id: payload.storeId,
        category_id: payload.categoryId,
        name,
        description: payload.description?.trim().slice(0, 300) || null,
        base_price: payload.basePrice,
        image_url: normalizeImageUrl(payload.imageUrl),
        is_active: true,
        is_available: true,
        display_order: await nextDisplayOrder(db, "products", payload.storeId),
      })
      .select()
      .single();
    if (error) throw new Error(`Error al crear producto: ${error.message}`);
    return { product };
  });
}

export async function toggleProductAvailability(
  productId: string,
  storeId: string,
  newIsAvailable: boolean,
) {
  return ownerAction(storeId, ["/admin/menu"], async ({ db }) => {
    const { error } = await db
      .from("products")
      .update({ is_available: newIsAvailable })
      .eq("id", productId)
      .eq("store_id", storeId);
    if (error) throw new Error(`Error al actualizar disponibilidad: ${error.message}`);
    return { is_available: newIsAvailable };
  });
}

export async function updateProductBasePrice(productId: string, storeId: string, newPrice: number) {
  return ownerAction(storeId, ["/admin/menu"], async ({ db }) => {
    assertValidPrice(newPrice, "El precio ingresado no es válido.");
    const { error } = await db
      .from("products")
      .update({ base_price: newPrice })
      .eq("id", productId)
      .eq("store_id", storeId);
    if (error) throw new Error(`Error al actualizar precio: ${error.message}`);
    return { base_price: newPrice };
  });
}

// ─── Menú: grupos de opciones y adicionales ─────────────────────────────────

export async function getProductOptionGroups(storeId: string, productId: string) {
  const result = await ownerAction(storeId, [], async ({ db }) => {
    const { data: groups, error } = await db
      .from("product_option_groups")
      .select(
        "id, name, is_required, max_selectable, product_id, store_id, product_option_items (id, name, price, is_available, group_id)",
      )
      .eq("store_id", storeId)
      .eq("product_id", productId);
    if (error) throw new Error(`Error al cargar opciones: ${error.message}`);

    return {
      groups: (groups ?? []).map((g) => ({
        id: g.id,
        name: g.name,
        is_required: Boolean(g.is_required),
        max_selectable: g.max_selectable,
        product_id: g.product_id,
        store_id: g.store_id,
        items: (g.product_option_items ?? []).map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price ?? 0,
          is_available: item.is_available ?? true,
          group_id: item.group_id,
        })),
      })),
    };
  });
  return result.success ? result : { ...result, groups: [] };
}

export async function createOptionGroup(payload: {
  storeId: string;
  productId: string;
  name: string;
  isRequired: boolean;
  maxSelectable: number | null;
}) {
  return ownerAction(payload.storeId, ["/admin/menu"], async ({ db }) => {
    const name = payload.name.trim();
    if (!name) throw new Error("El nombre del grupo de opciones es obligatorio.");
    if (payload.maxSelectable !== null && (!Number.isInteger(payload.maxSelectable) || payload.maxSelectable < 1)) {
      throw new Error("El máximo de opciones debe ser un número entero positivo.");
    }

    const { data: product } = await db
      .from("products")
      .select("id")
      .eq("id", payload.productId)
      .eq("store_id", payload.storeId)
      .maybeSingle();
    if (!product) throw new Error("El producto no pertenece a este comercio.");

    const { data: group, error } = await db
      .from("product_option_groups")
      .insert({
        store_id: payload.storeId,
        product_id: payload.productId,
        name,
        is_required: payload.isRequired,
        max_selectable: payload.maxSelectable,
      })
      .select()
      .single();
    if (error) throw new Error(`Error al crear grupo: ${error.message}`);
    return { group };
  });
}

/** Elimina un grupo de opciones y todos sus ítems relacionados. */
export async function deleteOptionGroup(payload: { storeId: string; groupId: string }) {
  return ownerAction(payload.storeId, ["/admin/menu"], async ({ db }) => {
    // Antes se borraban las opciones del grupo ANTES de verificar a qué local pertenecía.
    await assertGroupInStore(db, payload.groupId, payload.storeId);

    const { error: itemsError } = await db
      .from("product_option_items")
      .delete()
      .eq("group_id", payload.groupId);
    if (itemsError) throw new Error(`Error al eliminar las opciones: ${itemsError.message}`);

    const { error } = await db
      .from("product_option_groups")
      .delete()
      .eq("id", payload.groupId)
      .eq("store_id", payload.storeId);
    if (error) throw new Error(`Error al eliminar grupo: ${error.message}`);
    return {};
  });
}

export async function createOptionItem(payload: {
  storeId: string;
  groupId: string;
  name: string;
  price: number;
}) {
  return ownerAction(payload.storeId, ["/admin/menu"], async ({ db }) => {
    const name = payload.name.trim();
    if (!name) throw new Error("El nombre de la opción es obligatorio.");
    assertValidPrice(payload.price, "El precio de la opción no puede ser negativo.");
    await assertGroupInStore(db, payload.groupId, payload.storeId);

    const { data: item, error } = await db
      .from("product_option_items")
      .insert({ group_id: payload.groupId, name, price: payload.price, is_available: true })
      .select()
      .single();
    if (error) throw new Error(`Error al crear opción: ${error.message}`);
    return { item };
  });
}

export async function deleteOptionItem(payload: { storeId: string; itemId: string }) {
  return ownerAction(payload.storeId, ["/admin/menu"], async ({ db }) => {
    await assertOptionItemInStore(db, payload.itemId, payload.storeId);
    const { error } = await db.from("product_option_items").delete().eq("id", payload.itemId);
    if (error) throw new Error(`Error al eliminar opción: ${error.message}`);
    return {};
  });
}

export async function toggleOptionItemAvailability(payload: {
  storeId: string;
  itemId: string;
  newIsAvailable: boolean;
}) {
  return ownerAction(payload.storeId, ["/admin/menu"], async ({ db }) => {
    // Antes se actualizaba la opción sin verificar que fuera de este local.
    await assertOptionItemInStore(db, payload.itemId, payload.storeId);
    const { error } = await db
      .from("product_option_items")
      .update({ is_available: payload.newIsAvailable })
      .eq("id", payload.itemId);
    if (error) throw new Error(`Error al actualizar disponibilidad: ${error.message}`);
    return { is_available: payload.newIsAvailable };
  });
}
