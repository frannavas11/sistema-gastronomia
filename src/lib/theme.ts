export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

/**
 * Script bloqueante que se ejecuta antes del primer pintado: aplica la clase `dark`
 * según la preferencia guardada (o la del sistema operativo si no hay ninguna),
 * evitando el "parpadeo" de tema claro al cargar.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}})();`;

/** Preferencia guardada o, si no hay, la del sistema operativo. */
export function getPreferredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // sin acceso a localStorage
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getCurrentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function setTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Almacenamiento bloqueado (modo privado): el tema sólo dura la sesión actual.
  }
}

/** Suscripción a cambios de la clase del <html> (para useSyncExternalStore). */
export function subscribeToTheme(callback: () => void): () => void {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}
