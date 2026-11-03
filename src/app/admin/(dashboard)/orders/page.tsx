import { redirect } from "next/navigation";
import {
  ShoppingBag,
  Bike,
  Store as StoreIcon,
  Phone,
  MapPin,
  Clock,
  Inbox,
} from "lucide-react";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const { user } = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select("id, name, slug")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!store) {
    return (
      <div className="p-8 text-center text-slate-500">
        No se encontró ningún local vinculado a tu usuario.
      </div>
    );
  }

  const { data: rawOrders } = await supabase
    .from("orders")
    .select(
      `
      id,
      created_at,
      customer_name,
      customer_phone,
      delivery_type,
      delivery_address,
      delivery_fee,
      payment_method,
      notes,
      status,
      subtotal,
      total,
      order_items (
        id,
        product_name,
        quantity,
        unit_price,
        subtotal,
        selected_options
      )
    `,
    )
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  const orders = rawOrders ?? [];

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Historial de Pedidos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pedidos registrados a través de la carta online dirigidos a WhatsApp.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 inline-flex items-center gap-2 self-start sm:self-auto shadow-2xs">
          <ShoppingBag className="w-4 h-4 text-slate-500" />
          <span className="tabular-nums font-semibold">{orders.length} pedidos</span>
        </div>
      </div>

      {/* Lista de Pedidos */}
      {orders.length === 0 ? (
        <div className="p-10 text-center rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 mx-auto flex items-center justify-center text-slate-400 mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            Todavía no hay pedidos registrados
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1">
            Cuando tus clientes completen el carrito en tu carta digital y hagan clic en enviar a WhatsApp, los pedidos aparecerán registrados acá.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isDelivery = order.delivery_type === "delivery";

            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
              >
                {/* Cabecera del pedido */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-900 tabular-nums">
                      Pedido #{order.id}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 tabular-nums">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(order.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {isDelivery ? (
                        <>
                          <Bike className="w-3.5 h-3.5 text-slate-500" />
                          <span>Envío a Domicilio</span>
                        </>
                      ) : (
                        <>
                          <StoreIcon className="w-3.5 h-3.5 text-slate-500" />
                          <span>Retiro en Local</span>
                        </>
                      )}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {order.status || "Pendiente"}
                    </span>
                  </div>
                </div>

                {/* Datos del Cliente y Entrega */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium mb-0.5">
                      Cliente
                    </span>
                    <span className="text-slate-900 font-semibold block">
                      {order.customer_name}
                    </span>
                    <span className="text-slate-500 flex items-center gap-1 mt-0.5 tabular-nums">
                      <Phone className="w-3 h-3" />
                      +{order.customer_phone}
                    </span>
                  </div>

                  {isDelivery && order.delivery_address && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block text-[11px] font-medium mb-0.5">
                        Dirección de Entrega
                      </span>
                      <span className="text-slate-800 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {order.delivery_address}
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium mb-0.5">
                      Método de Pago
                    </span>
                    <span className="text-slate-800 font-medium capitalize">
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
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    Ítems del Pedido
                  </span>
                  <div className="divide-y divide-slate-100">
                    {order.order_items?.map((item) => (
                      <div
                        key={item.id}
                        className="py-1.5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] tabular-nums">
                            {item.quantity}x
                          </span>
                          <span className="text-slate-800 font-medium">
                            {item.product_name}
                          </span>
                        </div>
                        <span className="font-semibold text-slate-700 tabular-nums">
                          {formatPrice(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notas si existen */}
                {order.notes && (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 text-xs text-amber-900">
                    <span className="font-semibold block text-[11px] text-amber-800 mb-0.5">
                      Aclaraciones
                    </span>
                    &ldquo;{order.notes}&rdquo;
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">Total cobrado</span>
                  <span className="text-sm sm:text-base font-bold text-slate-900 tabular-nums">
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
