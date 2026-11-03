import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware de Next.js — intercepta las rutas bajo /admin para refrescar
 * la sesión de Supabase Auth y redirigir al login si falta autenticación.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
