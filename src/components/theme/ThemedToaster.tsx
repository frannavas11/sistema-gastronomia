"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { Toaster } from "sonner";
import { getCurrentTheme, getPreferredTheme, subscribeToTheme } from "@/lib/theme";

/**
 * Toaster de sonner que sigue el tema claro/oscuro de la app.
 * Además (montado una sola vez en el layout raíz) re-aplica el tema preferido:
 * en desarrollo, el remontaje de Strict Mode resetea los atributos del <html>.
 */
export function ThemedToaster() {
  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", getPreferredTheme() === "dark");
  }, []);

  const theme = useSyncExternalStore(subscribeToTheme, getCurrentTheme, () => "light" as const);
  return <Toaster position="top-center" richColors closeButton theme={theme} />;
}
