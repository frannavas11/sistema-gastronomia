import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

/**
 * Crea un cliente de Supabase diseñado para el middleware de Next.js.
 *
 * Su único propósito es refrescar la sesión del usuario (token JWT)
 * en cada request, garantizando que la cookie de auth se mantenga vigente.
 * Debe llamarse desde `middleware.ts` en la raíz del proyecto.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refrescar la sesión (si existe) para mantener el token vigente.
  await supabase.auth.getUser();

  return supabaseResponse;
}

