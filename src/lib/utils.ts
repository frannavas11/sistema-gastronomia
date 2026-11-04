import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Determina el color de texto óptimo (#ffffff o #211B19) para garantizar un contraste
 * accesible (mínimo 4.5:1) según WCAG 2.1 sobre cualquier color de fondo hex.
 */
export function getContrastTextColor(hexColor?: string | null): "#ffffff" | "#211B19" {
  if (!hexColor) return "#ffffff";
  const cleanHex = hexColor.replace("#", "").trim();
  const hex =
    cleanHex.length === 3
      ? cleanHex
          .split("")
          .map((c) => c + c)
          .join("")
      : cleanHex;

  if (hex.length !== 6) return "#ffffff";

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  // Fondos claros (L > 0.4) usan texto oscuro; fondos oscuros usan blanco
  return L > 0.4 ? "#211B19" : "#ffffff";
}

