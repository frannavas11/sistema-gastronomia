"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

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

  return { user, store };
}

/**
 * Cambia el estado del comercio entre Abierto (true) y Cerrado (false).
 */
export async function toggleStoreOpenStatus(
  storeId: string,
  newIsOpen: boolean,
) {
  try {
    const { store } = await verifyStoreOwnership(storeId);

    const serviceClient = createServiceClient();
    const { error } = await serviceClient
      .from("stores")
      .update({ is_open: newIsOpen })
      .eq("id", storeId);

    if (error) {
      throw new Error(`Error al actualizar el estado del local: ${error.message}`);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/settings");
    revalidatePath(`/${store.slug}`);

    return { success: true, is_open: newIsOpen };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { success: false, error: message };
  }
}

/**
 * Cambia la disponibilidad de un producto: Disponible (true) / Pausado (false).
 */
export async function toggleProductAvailability(
  productId: string,
  storeId: string,
  newIsAvailable: boolean,
) {
  try {
    const { store } = await verifyStoreOwnership(storeId);

    const serviceClient = createServiceClient();
    const { error } = await serviceClient
      .from("products")
      .update({ is_available: newIsAvailable })
      .eq("id", productId)
      .eq("store_id", storeId);

    if (error) {
      throw new Error(`Error al actualizar disponibilidad: ${error.message}`);
    }

    revalidatePath("/admin/menu");
    revalidatePath(`/${store.slug}`);

    return { success: true, is_available: newIsAvailable };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { success: false, error: message };
  }
}

/**
 * Actualiza el precio base de un producto.
 */
export async function updateProductBasePrice(
  productId: string,
  storeId: string,
  newPrice: number,
) {
  try {
    if (isNaN(newPrice) || newPrice < 0) {
      throw new Error("El precio ingresado no es válido.");
    }

    const { store } = await verifyStoreOwnership(storeId);

    const serviceClient = createServiceClient();
    const { error } = await serviceClient
      .from("products")
      .update({ base_price: newPrice })
      .eq("id", productId)
      .eq("store_id", storeId);

    if (error) {
      throw new Error(`Error al actualizar precio: ${error.message}`);
    }

    revalidatePath("/admin/menu");
    revalidatePath(`/${store.slug}`);

    return { success: true, base_price: newPrice };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { success: false, error: message };
  }
}

/**
 * Crea una nueva categoría en el menú.
 */
export async function createCategory(storeId: string, name: string) {
  try {
    if (!name.trim()) {
      throw new Error("El nombre de la categoría es obligatorio.");
    }

    const { store } = await verifyStoreOwnership(storeId);

    const serviceClient = createServiceClient();
    const { data: category, error } = await serviceClient
      .from("categories")
      .insert({
        store_id: storeId,
        name: name.trim(),
        is_active: true,
        display_order: 10,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear categoría: ${error.message}`);
    }

    revalidatePath("/admin/menu");
    revalidatePath(`/${store.slug}`);

    return { success: true, category };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { success: false, error: message };
  }
}

/**
 * Elimina una categoría del menú (solo si no contiene productos activos).
 */
export async function deleteCategory(storeId: string, categoryId: string) {
  try {
    const { store } = await verifyStoreOwnership(storeId);

    const serviceClient = createServiceClient();

    // Validar que no tenga productos asociados
    const { count, error: countError } = await serviceClient
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category_id", categoryId)
      .eq("store_id", storeId);

    if (countError) {
      throw new Error(`Error al verificar productos de la categoría: ${countError.message}`);
    }

    if (count && count > 0) {
      throw new Error(`No podés eliminar esta categoría porque contiene ${count} producto(s). Reubicá o eliminá los productos primero.`);
    }

    const { error } = await serviceClient
      .from("categories")
      .delete()
      .eq("id", categoryId)
      .eq("store_id", storeId);

    if (error) {
      throw new Error(`Error al eliminar categoría: ${error.message}`);
    }

    revalidatePath("/admin/menu");
    revalidatePath(`/${store.slug}`);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { success: false, error: message };
  }
}

/**
 * Crea un nuevo producto básico.
 */
export async function createProduct(payload: {
  storeId: string;
  categoryId: string;
  name: string;
  description?: string;
  basePrice: number;
  imageUrl?: string;
}) {
  try {
    if (!payload.name.trim()) {
      throw new Error("El nombre del producto es obligatorio.");
    }
    if (isNaN(payload.basePrice) || payload.basePrice < 0) {
      throw new Error("El precio base debe ser un valor positivo.");
    }

    const { store } = await verifyStoreOwnership(payload.storeId);

    const serviceClient = createServiceClient();

    // Validar que la categoría pertenezca a este local
    const { data: category } = await serviceClient
      .from("categories")
      .select("id")
      .eq("id", payload.categoryId)
      .eq("store_id", payload.storeId)
      .maybeSingle();

    if (!category) {
      throw new Error("La categoría seleccionada no pertenece a este comercio.");
    }

    const { data: product, error } = await serviceClient
      .from("products")
      .insert({
        store_id: payload.storeId,
        category_id: payload.categoryId,
        name: payload.name.trim(),
        description: payload.description?.trim() || null,
        base_price: payload.basePrice,
        image_url: payload.imageUrl?.trim() || null,
        is_active: true,
        is_available: true,
        display_order: 10,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear producto: ${error.message}`);
    }

    revalidatePath("/admin/menu");
    revalidatePath(`/${store.slug}`);

    return { success: true, product };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { success: false, error: message };
  }
}

/**
 * Actualiza la información operativa del comercio (teléfono, costo de envío, etc.)
 */
export async function updateStoreSettings(payload: {
  storeId: string;
  name: string;
  phoneWhatsapp: string;
  deliveryCost: number;
  minOrderAmount: number;
  logoUrl?: string | null;
  bannerUrl?: string | null;
}) {
  try {
    const { store } = await verifyStoreOwnership(payload.storeId);

    const serviceClient = createServiceClient();
    const updateData: {
      name: string;
      phone_whatsapp: string;
      delivery_cost: number;
      min_order_amount: number;
      logo_url?: string | null;
      banner_url?: string | null;
    } = {
      name: payload.name.trim(),
      phone_whatsapp: payload.phoneWhatsapp.trim().replace(/\D/g, ""),
      delivery_cost: payload.deliveryCost,
      min_order_amount: payload.minOrderAmount,
    };

    if (payload.logoUrl !== undefined) {
      updateData.logo_url = payload.logoUrl ? payload.logoUrl.trim() : null;
    }
    if (payload.bannerUrl !== undefined) {
      updateData.banner_url = payload.bannerUrl ? payload.bannerUrl.trim() : null;
    }

    const { error } = await serviceClient
      .from("stores")
      .update(updateData)
      .eq("id", payload.storeId);

    if (error) {
      throw new Error(`Error al actualizar configuración: ${error.message}`);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/settings");
    revalidatePath(`/${store.slug}`);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { success: false, error: message };
  }
}

/**
 * Elimina un pedido y sus ítems asociados de forma segura.
 */
export async function deleteOrder(storeId: string, orderId: number) {
  try {
    const { store } = await verifyStoreOwnership(storeId);

    const serviceClient = createServiceClient();

    // 1. Eliminar ítems asociados primero
    await serviceClient
      .from("order_items")
      .delete()
      .eq("order_id", orderId);

    // 2. Eliminar el pedido validando que pertenezca al local
    const { error } = await serviceClient
      .from("orders")
      .delete()
      .eq("id", orderId)
      .eq("store_id", storeId);

    if (error) {
      throw new Error(`Error al eliminar pedido: ${error.message}`);
    }

    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    revalidatePath(`/${store.slug}`);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { success: false, error: message };
  }
}

/**
 * Sube una imagen al bucket público 'store-assets' de Supabase Storage.
 * Valida sesión de usuario, pertenencia del comercio, tamaño (máx 5MB) y tipo MIME.
 */
export async function uploadStoreImage(formData: FormData) {
  try {
    const storeId = formData.get("storeId") as string;
    const file = formData.get("file") as File | null;

    if (!storeId || typeof storeId !== "string") {
      throw new Error("ID de comercio no especificado.");
    }
    if (!file || !(file instanceof File)) {
      throw new Error("No se seleccionó ningún archivo para subir.");
    }

    // Validar propiedad del local
    await verifyStoreOwnership(storeId);

    // Validar tipo MIME
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG, WEBP o GIF.",
      );
    }

    // Validar tamaño (máximo 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error("La imagen supera el límite de 5 MB permitido.");
    }

    const serviceClient = createServiceClient();
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const sanitizedFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const storagePath = `${storeId}/${sanitizedFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await serviceClient.storage
      .from("store-assets")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Error al subir la imagen: ${uploadError.message}`);
    }

    const { data: publicUrlData } = serviceClient.storage
      .from("store-assets")
      .getPublicUrl(storagePath);

    return {
      success: true,
      url: publicUrlData.publicUrl,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { success: false, error: message };
  }
}

/**
 * Obtiene los grupos de opciones e ítems vinculados a un producto.
 */
export async function getProductOptionGroups(storeId: string, productId: string) {
  try {
    await verifyStoreOwnership(storeId);

    const serviceClient = createServiceClient();
    const { data: groups, error: groupsError } = await serviceClient
      .from("product_option_groups")
      .select(`
        id,
        name,
        is_required,
        max_selectable,
        product_id,
        store_id,
        product_option_items (
          id,
          name,
          price,
          is_available,
          group_id
        )
      `)
      .eq("store_id", storeId)
      .eq("product_id", productId);

    if (groupsError) {
      throw new Error(`Error al cargar opciones: ${groupsError.message}`);
    }

    return {
      success: true,
      groups: (groups || []).map((g) => ({
        id: g.id,
        name: g.name,
        is_required: Boolean(g.is_required),
        max_selectable: g.max_selectable,
        product_id: g.product_id,
        store_id: g.store_id,
        items: (g.product_option_items || []).map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price ?? 0,
          is_available: item.is_available ?? true,
          group_id: item.group_id,
        })),
      })),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { success: false, error: message, groups: [] };
  }
}

/**
 * Crea un grupo de opciones (variante) para un producto.
 */
export async function createOptionGroup(payload: {
  storeId: string;
  productId: string;
  name: string;
  isRequired: boolean;
  maxSelectable: number | null;
}) {
  try {
    if (!payload.name.trim()) {
      throw new Error("El nombre del grupo de opciones es obligatorio.");
    }

    const { store } = await verifyStoreOwnership(payload.storeId);

    const serviceClient = createServiceClient();

    // Validar que el producto pertenezca al local
    const { data: product } = await serviceClient
      .from("products")
      .select("id")
      .eq("id", payload.productId)
      .eq("store_id", payload.storeId)
      .maybeSingle();

    if (!product) {
      throw new Error("El producto no pertenece a este comercio.");
    }

    const { data: group, error } = await serviceClient
      .from("product_option_groups")
      .insert({
        store_id: payload.storeId,
        product_id: payload.productId,
        name: payload.name.trim(),
        is_required: payload.isRequired,
        max_selectable: payload.maxSelectable,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear grupo: ${error.message}`);
    }

    revalidatePath("/admin/menu");
    revalidatePath(`/${store.slug}`);

    return { success: true, group };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { success: false, error: message };
  }
}

/**
 * Elimina un grupo de opciones y todos sus ítems relacionados.
 */
export async function deleteOptionGroup(payload: {
  storeId: string;
  groupId: string;
}) {
  try {
    const { store } = await verifyStoreOwnership(payload.storeId);

    const serviceClient = createServiceClient();

    // 1. Eliminar ítems del grupo
    await serviceClient
      .from("product_option_items")
      .delete()
      .eq("group_id", payload.groupId);

    // 2. Eliminar grupo
    const { error } = await serviceClient
      .from("product_option_groups")
      .delete()
      .eq("id", payload.groupId)
      .eq("store_id", payload.storeId);

    if (error) {
      throw new Error(`Error al eliminar grupo: ${error.message}`);
    }

    revalidatePath("/admin/menu");
    revalidatePath(`/${store.slug}`);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { success: false, error: message };
  }
}

/**
 * Crea una opción o adicional dentro de un grupo existente.
 */
export async function createOptionItem(payload: {
  storeId: string;
  groupId: string;
  name: string;
  price: number;
}) {
  try {
    if (!payload.name.trim()) {
      throw new Error("El nombre de la opción es obligatorio.");
    }
    if (isNaN(payload.price) || payload.price < 0) {
      throw new Error("El precio de la opción no puede ser negativo.");
    }

    const { store } = await verifyStoreOwnership(payload.storeId);

    const serviceClient = createServiceClient();

    // Validar que el grupo pertenezca al local
    const { data: group } = await serviceClient
      .from("product_option_groups")
      .select("id")
      .eq("id", payload.groupId)
      .eq("store_id", payload.storeId)
      .maybeSingle();

    if (!group) {
      throw new Error("El grupo no pertenece a este comercio.");
    }

    const { data: item, error } = await serviceClient
      .from("product_option_items")
      .insert({
        group_id: payload.groupId,
        name: payload.name.trim(),
        price: payload.price,
        is_available: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear opción: ${error.message}`);
    }

    revalidatePath("/admin/menu");
    revalidatePath(`/${store.slug}`);

    return { success: true, item };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { success: false, error: message };
  }
}

/**
 * Elimina una opción puntual.
 */
export async function deleteOptionItem(payload: {
  storeId: string;
  itemId: string;
}) {
  try {
    const { store } = await verifyStoreOwnership(payload.storeId);

    const serviceClient = createServiceClient();

    // Validar pertenencia del item a través del grupo
    const { data: item } = await serviceClient
      .from("product_option_items")
      .select("id, group_id, product_option_groups!inner(store_id)")
      .eq("id", payload.itemId)
      .maybeSingle();

    if (!item) {
      throw new Error("La opción no existe.");
    }

    const itemStoreId = (item.product_option_groups as { store_id?: string })?.store_id;
    if (itemStoreId !== payload.storeId) {
      throw new Error("No tenés permiso para eliminar esta opción.");
    }

    const { error } = await serviceClient
      .from("product_option_items")
      .delete()
      .eq("id", payload.itemId);

    if (error) {
      throw new Error(`Error al eliminar opción: ${error.message}`);
    }

    revalidatePath("/admin/menu");
    revalidatePath(`/${store.slug}`);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { success: false, error: message };
  }
}

/**
 * Alterna la disponibilidad de una opción (Disponible / Agotada).
 */
export async function toggleOptionItemAvailability(payload: {
  storeId: string;
  itemId: string;
  newIsAvailable: boolean;
}) {
  try {
    const { store } = await verifyStoreOwnership(payload.storeId);

    const serviceClient = createServiceClient();

    const { error } = await serviceClient
      .from("product_option_items")
      .update({ is_available: payload.newIsAvailable })
      .eq("id", payload.itemId);

    if (error) {
      throw new Error(`Error al actualizar disponibilidad: ${error.message}`);
    }

    revalidatePath("/admin/menu");
    revalidatePath(`/${store.slug}`);

    return { success: true, is_available: payload.newIsAvailable };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { success: false, error: message };
  }
}
