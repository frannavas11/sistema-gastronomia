import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "./server";

/**
 * Usuario autenticado + su local, cacheado por request: el layout del panel y cada página
 * lo comparten sin repetir consultas (antes la misma query estaba copiada en 4 páginas).
 * Redirige al login si no hay sesión.
 */
export const getOwnerContext = cache(async () => {
  const { user } = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const supabase = await createClient();
  const { data: store } = await supabase
    .from("stores")
    .select(
      "id, name, slug, is_open, phone_whatsapp, delivery_cost, min_order_amount, logo_url, banner_url, theme_colors",
    )
    .eq("owner_id", user.id)
    .maybeSingle();

  return { user, store, supabase };
});
