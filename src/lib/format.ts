/**
 * Formateadores compartidos. Las fechas usan SIEMPRE la zona horaria de Argentina:
 * el servidor (Vercel) corre en UTC, y sin `timeZone` los horarios salían 3 h corridos
 * y además no coincidían con el render del navegador (error de hidratación).
 */
export const STORE_TIME_ZONE = "America/Argentina/Buenos_Aires";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatCurrencyARS(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatTimeAR(date?: string | null): string {
  if (!date) return "--:--";
  return new Date(date).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: STORE_TIME_ZONE,
  });
}

export function formatDateTimeAR(
  date?: string | null,
  options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" },
): string {
  if (!date) return "Sin fecha";
  return new Date(date).toLocaleString("es-AR", {
    ...options,
    hour: "2-digit",
    minute: "2-digit",
    timeZone: STORE_TIME_ZONE,
  });
}

/** Inicio del día de hoy en Argentina (UTC-3, sin horario de verano), como ISO. */
export function startOfTodayARIso(): string {
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: STORE_TIME_ZONE }).format(new Date());
  return new Date(`${ymd}T00:00:00-03:00`).toISOString();
}

export const PAYMENT_LABELS: Record<string, string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
  mercadopago: "Mercado Pago",
};
