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
  let totalOrders = 0;

  if (store) {
    const [productsResult, ordersResult] = await Promise.all([
      supabase
        .from("products")
        .select("id, is_available")
        .eq("store_id", store.id),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("store_id", store.id),
    ]);

    const products = productsResult.data ?? [];
    totalProducts = products.length;
    availableProducts = products.filter((p) => p.is_available).length;
    totalOrders = ordersResult.count ?? 0;
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {store ? store.name : "Panel de Control"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gestión de menú, pedidos y configuración en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {store && (
            <Link
              href={`/${store.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg bg-white hover:bg-slate-50 text-slate-700 transition-colors border border-slate-300 shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Ver Carta Digital</span>
            </Link>
          )}

          <LogoutButton variant="danger" label="Cerrar Sesión" />
        </div>
      </div>

      {/* 2. Interruptor maestro del local */}
      {store && (
        <StoreStatusToggle
          storeId={store.id}
          initialIsOpen={store.is_open ?? true}
        />
      )}

      {/* 3. Tarjetas de Métricas Rápidas */}
      {store && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/admin/menu"
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Productos en Carta
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tabular-nums">
                {totalProducts}
              </span>
              <span className="text-xs text-slate-500">ítems totales</span>
            </div>
            <div className="mt-2 text-xs text-slate-600 font-medium flex items-center gap-1 group-hover:text-slate-900 transition-colors">
              <span>Gestionar menú y precios</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/admin/menu"
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Disponibilidad
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                <PackageCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-700 tabular-nums">
                {availableProducts}
              </span>
              <span className="text-xs text-slate-500 tabular-nums">
                / {totalProducts} disponibles
              </span>
            </div>
            <div className="mt-2 text-xs text-emerald-700 font-medium flex items-center gap-1 group-hover:underline">
              <span>Modificar disponibilidad</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Pedidos Registrados
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tabular-nums">
                {totalOrders}
              </span>
              <span className="text-xs text-slate-500">enviados a WhatsApp</span>
            </div>
            <div className="mt-2 text-xs text-slate-600 font-medium flex items-center gap-1 group-hover:text-slate-900 transition-colors">
              <span>Ver historial de pedidos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      )}

      {/* 4. Tarjeta de Sesión e Identidad */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                Información de la Cuenta
              </h2>
              <p className="text-xs text-slate-500">
                Sesión autenticada en Supabase Auth
              </p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            En línea
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Mail className="w-3.5 h-3.5" />
              <span className="font-medium">Correo Electrónico</span>
            </div>
            <span className="font-semibold text-slate-900 block truncate">
              {user.email}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Store className="w-3.5 h-3.5" />
              <span className="font-medium">Comercio</span>
            </div>
            <span className="font-semibold text-slate-900 block truncate">
              {store ? `${store.name} (/${store.slug})` : "Sin vincular"}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-medium">Último Ingreso</span>
            </div>
            <span className="font-semibold text-slate-900 block truncate tabular-nums">
              {formatDate(user.last_sign_in_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
