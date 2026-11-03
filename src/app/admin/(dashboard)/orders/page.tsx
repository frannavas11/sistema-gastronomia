import { redirect } from "next/navigation";
import {
  ShoppingBag,
  Sparkles,
  Bike,
  Store as StoreIcon,
  Phone,
  MapPin,
  Clock,
  Inbox,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Obtener comercio del usuario
  const { data: store } = await supabase
    .from("stores")
    .select("id, name, slug")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!store) {
    return (
      <div className="p-8 text-center text-zinc-400">
        No se encontró ningún local vinculado a tu usuario.
      </div>
    );
  }

  // Consultar pedidos ordenados por fecha más reciente, incluyendo los ítems
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Gestión Operativa
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            Historial de Pedidos
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Revisá los pedidos recibidos por la web que fueron dirigidos a WhatsApp.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 inline-flex items-center gap-2 self-start sm:self-auto">
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <span>{orders.length} pedidos registrados</span>
        </div>
      </div>

      {/* Lista de Pedidos */}
      {orders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-zinc-900 border border-zinc-800">
          <div className="w-16 h-16 rounded-3xl bg-zinc-800/80 mx-auto flex items-center justify-center text-zinc-500 mb-4">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-200">
            Todavía no hay pedidos registrados
          </h3>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto mt-1">
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
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 hover:border-zinc-700/80 transition-colors"
              >
                {/* Cabecera del pedido */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-bold text-rose-400">
                      #{order.id}
                    </span>
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      {formatDate(order.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isDelivery
                          ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                          : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      }`}
                    >
                      {isDelivery ? (
                        <>
                          <Bike className="w-3.5 h-3.5" />
                          <span>Envío a Domicilio</span>
                        </>
                      ) : (
                        <>
                          <StoreIcon className="w-3.5 h-3.5" />
                          <span>Retiro en Local</span>
                        </>
                      )}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-mono">
                      {order.status || "Pendiente"}
                    </span>
                  </div>
                </div>

                {/* Datos del Cliente y Entrega */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/60">
                  <div>
                    <span className="text-zinc-500 uppercase tracking-wider block text-[10px] font-semibold mb-0.5">
                      Cliente
                    </span>
                    <span className="text-zinc-200 font-semibold block">
                      {order.customer_name}
                    </span>
                    <span className="text-zinc-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      +{order.customer_phone}
                    </span>
                  </div>

                  {isDelivery && order.delivery_address && (
                    <div className="sm:col-span-2">
                      <span className="text-zinc-500 uppercase tracking-wider block text-[10px] font-semibold mb-0.5">
                        Dirección de Entrega
                      </span>
                      <span className="text-zinc-300 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                        {order.delivery_address}
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-zinc-500 uppercase tracking-wider block text-[10px] font-semibold mb-0.5">
                      Método de Pago
                    </span>
                    <span className="text-zinc-300 font-medium capitalize">
                      {order.payment_method === "cash"
                        ? "Efectivo"
                        : order.payment_method === "transfer"
                        ? "Transferencia"
                        : "Mercado Pago"}
                    </span>
                  </div>
                </div>

                {/* Detalle de ítems */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">
                    Ítems del Pedido
                  </span>
                  <div className="divide-y divide-zinc-800/50">
                    {order.order_items?.map((item) => (
                      <div
                        key={item.id}
                        className="py-1.5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-[11px]">
                            {item.quantity}x
                          </span>
                          <span className="text-zinc-200 font-medium">
                            {item.product_name}
                          </span>
                        </div>
                        <span className="font-semibold text-zinc-300">
                          {formatPrice(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Aclaraciones / Notas si existen */}
                {order.notes && (
                  <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-amber-300/90">
                    <span className="font-semibold block text-[10px] uppercase text-amber-400 mb-0.5">
                      Aclaraciones para cocina
                    </span>
                    "{order.notes}"
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                  <span className="text-xs text-zinc-400">Total cobrado</span>
                  <span className="text-base font-extrabold text-emerald-400">
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

