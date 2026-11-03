import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

/**
 * Crea un cliente de Supabase para uso en el navegador (Client Components).
 *
 * Usa la anon key pública → las queries respetan las políticas RLS.
 * Es seguro importar este módulo desde cualquier componente con "use client".
 *
 * Se recomienda llamar a esta función dentro del componente (no como singleton
 * de módulo) para que @supabase/ssr pueda manejar cookies correctamente.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

