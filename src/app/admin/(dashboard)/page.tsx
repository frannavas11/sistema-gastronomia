import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Store,
  ExternalLink,
  ShieldCheck,
  Mail,
  UtensilsCrossed,
  ShoppingBag,
  ArrowRight,
  PackageCheck,
  Clock,
  Bike,
  Store as StoreIcon,
} from "lucide-react";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { StoreStatusToggle } from "@/components/admin/StoreStatusToggle";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { user } = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select("id, name, slug, is_open, phone_whatsapp")
    .eq("owner_id", user.id)
    .maybeSingle();

  let totalProducts = 0;
  let availableProducts = 0;
  let ordersTodayCount = 0;
  let recentOrders: Array<{
    id: number;
    created_at: string | null;
    total: number;
    customer_name: string;
    delivery_type: string;
  }> = [];

  if (store) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [productsResult, todayOrdersResult, recentOrdersResult] =
      await Promise.all([
        supabase
          .from("products")
          .select("id, is_available")
          .eq("store_id", store.id),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("store_id", store.id)
          .gte("created_at", startOfDay.toISOString()),
        supabase
          .from("orders")
          .select("id, created_at, total, customer_name, delivery_type")
          .eq("store_id", store.id)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

    const products = productsResult.data ?? [];
    totalProducts = products.length;
    availableProducts = products.filter((p) => p.is_available).length;
    ordersTodayCount = todayOrdersResult.count ?? 0;
    recentOrders = (recentOrdersResult.data ?? []) as typeof recentOrders;
  }

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatTime = (dateString?: string | null) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No disponible";
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Cabecera principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[#E9DAD2]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-[#211B19]">
            {store ? store.name : "Panel de Administración"}
          </h1>
          <p className="text-xs sm:text-sm text-[#74645E] mt-1">
            Gestioná tu carta, pedidos y disponibilidad en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {store && (
            <Link
              href={`/${store.slug}`}
              target="_blank"
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl bg-[#FFFCF8] hover:bg-[#F6EBE4] text-[#211B19] transition-colors border border-[#E9DAD2] shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#74645E]" />
              <span>Ver Carta Digital</span>
            </Link>
          )}

          <LogoutButton
            variant="danger"
            label="Cerrar Sesión"
            className="min-h-[44px] text-xs py-2 px-3.5"
          />
        </div>
      </div>

      {/* 2. Interruptor maestro del local */}
      {store && (
        <StoreStatusToggle
          storeId={store.id}
          initialIsOpen={store.is_open ?? true}
        />
      )}

      {/* 3. Contadores del día con datos reales (sin datos inventados) */}
      {store && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Tarjeta 1: Pedidos recibidos hoy */}
          <Link
            href="/admin/orders"
            className="p-5 rounded-2xl bg-[#FFFCF8] border border-[#E9DAD2] hover:border-[#D5C2B8] hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#74645E]">
                Pedidos recibidos hoy
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#F6EBE4] text-[#78232F] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-serif font-normal text-[#211B19] tabular-nums">
                {ordersTodayCount}
              </span>
              <span className="text-xs text-[#74645E]">órdenes registradas</span>
            </div>
            <div className="mt-3 text-xs text-[#78232F] font-semibold flex items-center gap-1 group-hover:underline">
              <span>Ver historial de pedidos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Tarjeta 2: Productos en Carta */}
          <Link
            href="/admin/menu"
            className="p-5 rounded-2xl bg-[#FFFCF8] border border-[#E9DAD2] hover:border-[#D5C2B8] hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#74645E]">
                Productos en Carta
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#F6EBE4] text-[#74645E] flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-serif font-normal text-[#211B19] tabular-nums">
                {totalProducts}
              </span>
              <span className="text-xs text-[#74645E]">platos activos</span>
            </div>
            <div className="mt-3 text-xs text-[#78232F] font-semibold flex items-center gap-1 group-hover:underline">
              <span>Gestionar menú y precios</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Tarjeta 3: Disponibilidad */}
          <Link
            href="/admin/menu"
            className="p-5 rounded-2xl bg-[#FFFCF8] border border-[#E9DAD2] hover:border-[#D5C2B8] hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#74645E]">
                Disponibilidad
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#E5F4E7] text-[#249653] flex items-center justify-center border border-[#C2E8C7]">
                <PackageCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-serif font-normal text-[#249653] tabular-nums">
                {availableProducts}
              </span>
              <span className="text-xs text-[#74645E] tabular-nums">
                / {totalProducts} disponibles
              </span>
            </div>
            <div className="mt-3 text-xs text-[#249653] font-semibold flex items-center gap-1 group-hover:underline">
              <span>Ajustar stock inmediato</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      )}

      {/* 4. Pedidos recientes con datos reales (número, hora y monto) */}
      {store && (
        <div className="bg-[#FFFCF8] border border-[#E9DAD2] rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#E9DAD2] mb-4">
            <div>
              <h2 className="font-serif text-lg font-normal text-[#211B19]">
                Pedidos recientes
              </h2>
              <p className="text-xs text-[#74645E]">
                Últimas órdenes enviadas al WhatsApp del local.
              </p>
            </div>

            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[#78232F] hover:underline flex items-center gap-1"
            >
              <span>Ver todos los pedidos</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#74645E]">
              No hay pedidos registrados todavía.
            </div>
          ) : (
            <div className="divide-y divide-[#E9DAD2]">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="py-3 flex items-center justify-between gap-3 flex-wrap"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F6EBE4] flex items-center justify-center text-[#78232F] shrink-0">
                      {order.delivery_type === "delivery" ? (
                        <Bike className="w-4 h-4" />
                      ) : (
                        <StoreIcon className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-[#211B19] tabular-nums">
                          Pedido #{order.id}
                        </span>
                        <span className="text-[11px] text-[#74645E]">
                          • {order.customer_name}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#74645E] flex items-center gap-2 mt-0.5">
                        <span className="tabular-nums">
                          {formatTime(order.created_at)} hs
                        </span>
                        <span>•</span>
                        <span>
                          {order.delivery_type === "delivery"
                            ? "Envío a domicilio"
                            : "Retiro en local"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-sm text-[#211B19] tabular-nums block">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Tarjeta de Sesión e Identidad */}
      <div className="bg-[#FFFCF8] border border-[#E9DAD2] rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#E9DAD2] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F6EBE4] flex items-center justify-center text-[#78232F]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-base font-normal text-[#211B19]">
                Información de la Cuenta
              </h2>
              <p className="text-xs text-[#74645E]">
                Sesión autenticada en Supabase Auth
              </p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E5F4E7] text-[#249653] border border-[#C2E8C7] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#249653]" />
            En línea
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#F6EBE4] border border-[#E9DAD2]">
            <div className="flex items-center gap-1.5 text-[#74645E] mb-1">
              <Mail className="w-3.5 h-3.5" />
              <span className="font-medium">Correo Electrónico</span>
            </div>
            <span className="font-semibold text-[#211B19] block truncate">
              {user.email}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#F6EBE4] border border-[#E9DAD2]">
            <div className="flex items-center gap-1.5 text-[#74645E] mb-1">
              <Store className="w-3.5 h-3.5" />
              <span className="font-medium">Comercio</span>
            </div>
            <span className="font-semibold text-[#211B19] block truncate">
              {store ? `${store.name} (/${store.slug})` : "Sin vincular"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#F6EBE4] border border-[#E9DAD2]">
            <div className="flex items-center gap-1.5 text-[#74645E] mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-medium">Último Ingreso</span>
            </div>
            <span className="font-semibold text-[#211B19] block truncate tabular-nums">
              {formatDate(user.last_sign_in_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
