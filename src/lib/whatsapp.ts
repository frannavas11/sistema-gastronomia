import type { DeliveryType, PaymentMethod, Store, CartItem } from "@/types/store";

export interface WhatsAppOrderParams {
  orderId: number | string;
  store: Pick<Store, "name" | "phone_whatsapp">;
  customer_name: string;
  customer_phone: string;
  delivery_type: DeliveryType;
  delivery_address?: string | null;
  payment_method: PaymentMethod | string;
  notes?: string | null;
  items: CartItem[] | Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal?: number;
    selected_options?: Array<{
      name: string;
      price?: number;
      group_name?: string;
    }>;
    notes?: string | null;
  }>;
  subtotal: number;
  delivery_fee: number;
  total: number;
}

/**
 * Formatea un número como moneda en pesos argentinos (ARS).
 */
export function formatCurrencyARS(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Normaliza y limpia el número de teléfono para enlaces de WhatsApp.
 * Si tiene 10 dígitos (número estándar en Argentina sin código de país, ej. 1123456789),
 * le antepone 549 para que funcione internacionalmente en la API de WhatsApp.
 */
export function cleanWhatsAppNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }

  if (cleaned.length === 10) {
    return `549${cleaned}`;
  }

  return cleaned;
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Efectivo",
  transfer: "Transferencia bancaria",
  mercadopago: "Mercado Pago",
};

/**
 * Genera el cuerpo de texto estructurado y formateado para el mensaje de WhatsApp.
 */
export function formatWhatsAppOrderMessage(params: WhatsAppOrderParams): string {
  const {
    orderId,
    store,
    customer_name,
    customer_phone,
    delivery_type,
    delivery_address,
    payment_method,
    notes,
    items,
    subtotal,
    delivery_fee,
    total,
  } = params;

  const isDelivery = delivery_type === "delivery";
  const deliveryLabel =
    delivery_type === "delivery"
      ? "Envío a domicilio 🛵"
      : "Retiro en el local (Take Away) 🏬";
  const paymentLabel = PAYMENT_LABELS[payment_method] || payment_method;

  const lines: string[] = [];

  // Saludo e identificación
  lines.push(`¡Hola *${store.name}*! 👋`);
  lines.push(`Quiero confirmar el siguiente pedido:`);
  lines.push("");
  lines.push(`📋 *PEDIDO #${orderId}*`);
  lines.push("────────────────────────");

  // Datos del cliente
  lines.push(`👤 *Cliente:* ${customer_name}`);
  lines.push(`📱 *Teléfono:* ${customer_phone}`);
  lines.push(`🛵 *Modalidad:* ${deliveryLabel}`);

  if (isDelivery && delivery_address) {
    lines.push(`📍 *Dirección:* ${delivery_address}`);
  }

  lines.push("");
  lines.push("🛒 *DETALLE DEL PEDIDO:*");

  // Detalle de productos
  for (const item of items) {
    const itemSubtotal = item.subtotal ?? item.unit_price * item.quantity;
    lines.push(`• *${item.quantity}x ${item.product_name}* (${formatCurrencyARS(itemSubtotal)})`);

    if (item.selected_options && item.selected_options.length > 0) {
      for (const opt of item.selected_options) {
        const optPrice = opt.price && opt.price > 0 ? ` (+${formatCurrencyARS(opt.price)})` : "";
        lines.push(`   + ${opt.name}${optPrice}`);
      }
    }

    if (item.notes && item.notes.trim()) {
      lines.push(`   _Aclaración: ${item.notes.trim()}_`);
    }
  }

  lines.push("");
  lines.push("────────────────────────");

  // Resumen de importes
  lines.push(`💵 *Subtotal:* ${formatCurrencyARS(subtotal)}`);
  lines.push(
    `🛵 *Costo de envío:* ${
      delivery_fee > 0
        ? formatCurrencyARS(delivery_fee)
        : isDelivery
        ? "A coordinar"
        : "Gratis"
    }`
  );
  lines.push(`💰 *TOTAL:* ${formatCurrencyARS(total)}`);
  lines.push("");

  // Método de pago y notas
  lines.push(`💳 *Forma de pago:* ${paymentLabel}`);

  if (notes && notes.trim()) {
    lines.push(`📝 *Aclaraciones generales:* ${notes.trim()}`);
  }

  lines.push("────────────────────────");
  lines.push("Aguardando su confirmación. ¡Muchas gracias! 🙌");

  return lines.join("\n");
}

/**
 * Genera el enlace completo https://wa.me/... con el texto codificado por URL.
 */
export function buildWhatsAppUrl(params: WhatsAppOrderParams): string {
  const cleanPhone = cleanWhatsAppNumber(params.store.phone_whatsapp);
  const message = formatWhatsAppOrderMessage(params);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

