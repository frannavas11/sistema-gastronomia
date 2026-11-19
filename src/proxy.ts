import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Proxy de Next.js (antes "middleware"): intercepta las rutas bajo /admin para refrescar
 * la sesión de Supabase Auth y redirigir al login si falta autenticación.
 *
 * Debe vivir en `src/` (al mismo nivel que `app/`): un archivo en la raíz del proyecto
 * es ignorado cuando la app usa la carpeta `src`.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
