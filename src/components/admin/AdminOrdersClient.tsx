"use client";

import { useState } from "react";
import {
  ShoppingBag,
  Bike,
  Store as StoreIcon,
  Phone,
  MapPin,
  Clock,
  Inbox,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { deleteOrder } from "@/app/admin/actions";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  selected_options: unknown;
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
  status: string | null;
  subtotal: number;
  total: number;
  order_items: OrderItem[];
}

interface AdminOrdersClientProps {
  store: {
    id: string;
    name: string;
    slug: string;
  };
  orders: Order[];
}

export function AdminOrdersClient({ store, orders: initialOrders }: AdminOrdersClientProps) {
  const [orderList, setOrderList] = useState<Order[]>(initialOrders);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Fecha no registrada";
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async (orderId: number) => {
    if (!confirm(`¿Estás seguro de que querés eliminar el pedido #${orderId}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setDeletingId(orderId);
    // Actualización optimista inmediata
    const previousOrders = [...orderList];
    setOrderList((prev) => prev.filter((o) => o.id !== orderId));

    try {
      const res = await deleteOrder(store.id, orderId);
      if (res.success) {
        toast.success(`Pedido #${orderId} eliminado con éxito.`);
      } else {
        // Rollback
        setOrderList(previousOrders);
        toast.error(res.error || "No se pudo eliminar el pedido.");
      }
    } catch {
      setOrderList(previousOrders);
      toast.error("Error al procesar la eliminación del pedido.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[#E9DAD2]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-[#211B19]">
            Historial de Pedidos
          </h1>
          <p className="text-xs sm:text-sm text-[#74645E] mt-1">
            Pedidos registrados a través de la carta online dirigidos a WhatsApp.
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-[#FFFCF8] border border-[#E9DAD2] text-xs font-semibold text-[#211B19] inline-flex items-center gap-2 self-start sm:self-auto shadow-xs">
          <ShoppingBag className="w-4 h-4 text-[#78232F]" />
          <span className="tabular-nums">{orderList.length} pedidos</span>
        </div>
      </div>

      {/* Lista de Pedidos */}
      {orderList.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-[#FFFCF8] border border-[#E9DAD2] shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-[#F6EBE4] mx-auto flex items-center justify-center text-[#A18A81] mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg text-[#211B19]">
            Todavía no hay pedidos registrados
          </h3>
          <p className="text-xs sm:text-sm text-[#74645E] max-w-sm mx-auto mt-1">
            Cuando tus clientes completen el carrito en tu carta digital y hagan clic en enviar a WhatsApp, los pedidos aparecerán registrados acá.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orderList.map((order) => {
            const isDelivery = order.delivery_type === "delivery";

            return (
              <div
                key={order.id}
                className="bg-[#FFFCF8] border border-[#E9DAD2] rounded-2xl p-5 shadow-xs space-y-3 hover:border-[#D5C2B8] transition-colors relative"
              >
                {/* Cabecera del pedido */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E9DAD2]">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-[#211B19] tabular-nums">
                      Pedido #{order.id}
                    </span>
                    <span className="text-xs text-[#74645E] flex items-center gap-1 tabular-nums">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(order.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F6EBE4] text-[#74645E] border border-[#E9DAD2]">
                      {isDelivery ? (
                        <>
                          <Bike className="w-3.5 h-3.5 text-[#74645E]" />
                          <span>Envío a Domicilio</span>
                        </>
                      ) : (
                        <>
                          <StoreIcon className="w-3.5 h-3.5 text-[#74645E]" />
                          <span>Retiro en Local</span>
                        </>
                      )}
                    </span>

                    {/* Botón de papelera para eliminar pedido */}
                    <button
                      type="button"
                      onClick={() => handleDelete(order.id)}
                      disabled={deletingId === order.id}
                      title="Eliminar pedido"
                      className="p-1.5 rounded-lg text-[#C74742] hover:bg-[#FDE8E7] transition-colors disabled:opacity-50 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Datos del Cliente y Entrega */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#F6EBE4] p-3 rounded-xl border border-[#E9DAD2]">
                  <div>
                    <span className="text-[#74645E] block text-[11px] font-medium mb-0.5">
                      Cliente
                    </span>
                    <span className="text-[#211B19] font-semibold block">
                      {order.customer_name}
                    </span>
                    <span className="text-[#74645E] flex items-center gap-1 mt-0.5 tabular-nums">
                      <Phone className="w-3 h-3" />
                      +{order.customer_phone}
                    </span>
                  </div>

                  {isDelivery && order.delivery_address && (
                    <div className="sm:col-span-2">
                      <span className="text-[#74645E] block text-[11px] font-medium mb-0.5">
                        Dirección de Entrega
                      </span>
                      <span className="text-[#211B19] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#A18A81] shrink-0" />
                        {order.delivery_address}
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-[#74645E] block text-[11px] font-medium mb-0.5">
                      Método de Pago
                    </span>
                    <span className="text-[#211B19] font-medium capitalize">
                      {order.payment_method === "cash"
                        ? "Efectivo"
                        : order.payment_method === "transfer"
                        ? "Transferencia"
                        : "Mercado Pago"}
                    </span>
                  </div>
                </div>

                {/* Detalle de ítems */}
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-semibold text-[#74645E] block">
                    Ítems del Pedido
                  </span>
                  <div className="divide-y divide-[#E9DAD2]/60">
                    {order.order_items?.map((item) => (
                      <div
                        key={item.id}
                        className="py-1.5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-[#F6EBE4] text-[#211B19] font-bold flex items-center justify-center text-[10px] tabular-nums">
                            {item.quantity}x
                          </span>
                          <span className="text-[#211B19] font-medium">
                            {item.product_name}
                          </span>
                        </div>
                        <span className="font-semibold text-[#211B19] tabular-nums">
                          {formatPrice(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notas si existen */}
                {order.notes && (
                  <div className="p-2.5 rounded-xl bg-[#FEF3E2] border border-[#FAD7A0] text-xs text-[#8C5815]">
                    <span className="font-semibold block text-[11px] mb-0.5">
                      Aclaraciones
                    </span>
                    &ldquo;{order.notes}&rdquo;
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between pt-2 border-t border-[#E9DAD2] text-xs">
                  <span className="text-[#74645E]">Total pedido</span>
                  <span className="text-sm sm:text-base font-bold text-[#211B19] tabular-nums">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
