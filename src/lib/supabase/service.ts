import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Crea un cliente de Supabase con la service_role key.
 *
 * ⚠️  SOLO para uso en el backend (Route Handlers / Server Actions).
 *     Este cliente BYPASEA todas las políticas RLS — jamás exponerlo al navegador.
 *
 * Caso de uso principal: el Route Handler POST /api/orders que recalcula
 * totales con precios reales y hace el insert seguro del pedido.
 */
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

