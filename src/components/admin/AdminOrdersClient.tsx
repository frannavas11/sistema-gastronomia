"use client";

import { useState } from "react";
import { Bike, Store as StoreIcon, MapPin, Trash2, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteOrder } from "@/app/admin/actions";
import { cleanWhatsAppNumber } from "@/lib/whatsapp";
import { formatCurrencyARS, formatDateTimeAR, PAYMENT_LABELS } from "@/lib/format";
import type { Json } from "@/types/supabase";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  selected_options: Json;
}

interface Order {
  id: number;
  created_at: string | null;
  customer_name: string;
  customer_phone: string;
  delivery_type: string;
  delivery_address: string | null;
  delivery_fee: number | null;
  payment_method: string;
  notes: string | null;
  subtotal: number;
  total: number;
  order_items: OrderItem[];
}

interface AdminOrdersClientProps {
  storeId: string;
  orders: Order[];
  limit: number;
}

/**
 * `selected_options` se guarda como JSON { options: [{ name, price, group_name }], notes }.
 * Antes el panel no lo mostraba: la cocina no veía adicionales ni aclaraciones por plato.
 */
function parseItemDetails(raw: Json) {
  const value = (raw ?? {}) as { options?: Array<{ name?: string; price?: number }>; notes?: string };
  return {
    options: Array.isArray(value.options) ? value.options.filter((o) => o?.name) : [],
    notes: typeof value.notes === "string" ? value.notes.trim() : "",
  };
}

function OrderTicket({
  order,
  onDelete,
}: {
  order: Order;
  onDelete: (id: number) => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isDelivery = order.delivery_type === "delivery";
  const deliveryFee = Number(order.delivery_fee ?? 0);
  const waLink = `https://wa.me/${cleanWhatsAppNumber(order.customer_phone)}`;

  const handleDelete = async () => {
    // Confirmación en dos pasos dentro de la misma tarjeta (reemplaza el confirm() nativo)
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 4000);
      return;
    }
    setDeleting(true);
    await onDelete(order.id);
    setDeleting(false);
  };

  return (
    <article className="relative rounded-3xl bg-surface border border-border shadow-[0_1px_0_var(--border)] overflow-hidden flex flex-col">
      <header className="px-5 pt-5 pb-4 flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-text-tertiary">{formatDateTimeAR(order.created_at)} hs</p>
          <p className="font-serif text-4xl leading-none mt-1 text-text-primary tabular-nums">#{order.id}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isDelivery ? "bg-brand-light text-brand-fg" : "bg-surface-2 text-text-secondary"
          }`}
        >
          {isDelivery ? <Bike className="w-3.5 h-3.5" /> : <StoreIcon className="w-3.5 h-3.5" />}
          {isDelivery ? "Envío" : "Retiro"}
        </span>
      </header>

      <div className="px-5">
        <p className="font-medium text-text-primary">{order.customer_name}</p>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-success transition-colors tabular-nums"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {order.customer_phone}
        </a>
        {isDelivery && order.delivery_address && (
          <p className="mt-1 flex items-start gap-1.5 text-sm text-text-secondary">
            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            {order.delivery_address}
          </p>
        )}
      </div>

      <div className="perforation mx-5 my-4" />

      <ul className="px-5 space-y-3 flex-1">
        {order.order_items.map((item) => {
          const { options, notes } = parseItemDetails(item.selected_options);
          return (
            <li key={item.id}>
              <div className="flex items-baseline gap-2 text-sm">
                <span className="font-semibold tabular-nums text-brand-fg">{item.quantity}×</span>
                <span className="text-text-primary">{item.product_name}</span>
                <span className="leader" aria-hidden="true" />
                <span className="tabular-nums text-text-primary">{formatCurrencyARS(item.subtotal)}</span>
              </div>
              {options.length > 0 && (
                <p className="ml-6 text-xs text-text-secondary">{options.map((o) => o.name).join(" · ")}</p>
              )}
              {notes && <p className="ml-6 text-xs font-serif italic text-warning-fg">“{notes}”</p>}
            </li>
          );
        })}
      </ul>

      {order.notes && (
        <p className="mx-5 mt-4 p-3 rounded-2xl bg-warning-soft border border-warning-border text-sm font-serif italic text-warning-fg">
          “{order.notes}”
        </p>
      )}

      <div className="perforation mx-5 my-4" />

      <dl className="px-5 space-y-1 text-sm">
        {isDelivery && (
          <div className="flex justify-between text-text-secondary">
            <dt>Envío</dt>
            <dd className="tabular-nums">{deliveryFee > 0 ? formatCurrencyARS(deliveryFee) : "A convenir"}</dd>
          </div>
        )}
        <div className="flex justify-between text-text-secondary">
          <dt>Pago</dt>
          <dd>{PAYMENT_LABELS[order.payment_method] ?? order.payment_method}</dd>
        </div>
        <div className="flex items-baseline justify-between pt-1">
          <dt className="eyebrow text-text-primary">Total</dt>
          <dd className="font-serif text-3xl tabular-nums text-text-primary">{formatCurrencyARS(order.total)}</dd>
        </div>
      </dl>

      <footer className="mt-4 px-3 pb-3 flex justify-end">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className={`min-h-[40px] px-3.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
            confirming
              ? "bg-error-solid text-white"
              : "text-text-tertiary hover:text-error hover:bg-error-soft"
          }`}
        >
          {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          {confirming ? "¿Eliminar? Tocá de nuevo" : "Eliminar"}
        </button>
      </footer>
    </article>
  );
}

export function AdminOrdersClient({ storeId, orders: initialOrders, limit }: AdminOrdersClientProps) {
  const [orders, setOrders] = useState(initialOrders);

  const handleDelete = async (orderId: number) => {
    const res = await deleteOrder(storeId, orderId);
    if (res.success) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast.success(`Pedido #${orderId} eliminado.`);
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 animate-rise">
        <div>
          <p className="eyebrow text-brand-fg">Comandas</p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl text-text-primary tracking-tight">Pedidos</h1>
          <p className="mt-2 text-text-secondary">Cada pedido que entra desde la carta, con su detalle completo.</p>
        </div>
        <p className="font-serif italic text-text-secondary">
          {orders.length} {orders.length === 1 ? "pedido" : "pedidos"}
          {initialOrders.length >= limit && ` (últimos ${limit})`}
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="py-20 text-center border-y border-border">
          <p className="font-serif text-3xl text-text-primary">La cocina está tranquila</p>
          <p className="mt-2 font-serif italic text-text-secondary">
            Cuando un cliente envíe su pedido desde la carta, va a aparecer acá.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 items-start">
          {orders.map((order) => (
            <OrderTicket key={order.id} order={order} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
