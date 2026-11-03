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
}) {
  try {
    const { store } = await verifyStoreOwnership(payload.storeId);

    const serviceClient = createServiceClient();
    const { error } = await serviceClient
      .from("stores")
      .update({
        name: payload.name.trim(),
        phone_whatsapp: payload.phoneWhatsapp.trim().replace(/\D/g, ""),
        delivery_cost: payload.deliveryCost,
        min_order_amount: payload.minOrderAmount,
      })
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

