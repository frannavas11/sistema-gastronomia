import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

/**
 * Crea un cliente de Supabase para uso en el servidor (Server Components,
 * Route Handlers, Server Actions).
 *
 * Usa la anon key pública y delega la sesión al cookie store de Next.js,
 * por lo que las queries respetan las políticas RLS del usuario autenticado.
 *
 * ⚠️  Solo puede llamarse dentro de contextos donde `cookies()` esté disponible
 *     (Server Components, Route Handlers, Server Actions).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll puede fallar en Server Components (son read-only).
            // Es seguro ignorar: el middleware o un Route Handler se
            // encarga de refrescar la sesión.
          }
        },
      },
    },
  );
}

