import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Store,
  ExternalLink,
  ShieldCheck,
  Mail,
  UtensilsCrossed,
  ShoppingBag,
  Sparkles,
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

  // Consultar si el usuario ya tiene un comercio asignado
  const { data: store } = await supabase
    .from("stores")
    .select("id, name, slug, is_open, phone_whatsapp")
    .eq("owner_id", user.id)
    .maybeSingle();

  // Consultar métricas básicas si el comercio existe
  let totalProducts = 0;
  let availableProducts = 0;
  let totalOrders = 0;

  if (store) {
    const [productsResult, availableResult, ordersResult] = await Promise.all([
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("store_id", store.id),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("store_id", store.id)
        .eq("is_available", true),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("store_id", store.id),
    ]);

    totalProducts = productsResult.count ?? 0;
    availableProducts = availableResult.count ?? 0;
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
      {/* 1. Cabecera principal de bienvenida */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-rose-400" />
              Panel Administrativo
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            {store ? store.name : "¡Hola de nuevo!"}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Control de disponibilidad, precios y pedidos en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {store && (
            <Link
              href={`/${store.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors border border-zinc-700 shadow-sm"
            >
              <ExternalLink className="w-4 h-4 text-zinc-400" />
              <span>Ver Carta Digital</span>
            </Link>
          )}

          <LogoutButton variant="danger" label="Cerrar Sesión" />
        </div>
      </div>

      {/* 2. Interruptor maestro del local (Abierto / Cerrado) */}
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
            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Productos Activos
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-100">
                {totalProducts}
              </span>
              <span className="text-xs text-zinc-400">en carta</span>
            </div>
            <div className="mt-2 text-xs text-rose-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Gestionar menú y precios</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/admin/menu"
            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Disponibilidad
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PackageCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">
                {availableProducts}
              </span>
              <span className="text-xs text-zinc-400">
                / {totalProducts} para pedir
              </span>
            </div>
            <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Pausar o habilitar ítems</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Pedidos Registrados
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-100">
                {totalOrders}
              </span>
              <span className="text-xs text-zinc-400">enviados a WhatsApp</span>
            </div>
            <div className="mt-2 text-xs text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Ver historial de pedidos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      )}

      {/* 4. Tarjeta de Sesión e Identidad */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                Sesión de Usuario
              </h2>
              <p className="text-xs text-zinc-400">
                Autenticado en Supabase Auth
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            En línea
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Correo
              </span>
            </div>
            <span className="text-sm font-medium text-zinc-200 block truncate">
              {user.email}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80">
            <div className="flex items-center gap-2 mb-1">
              <Store className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Comercio Vinculado
              </span>
            </div>
            <span className="text-sm font-medium text-zinc-200 block truncate">
              {store ? `${store.name} (/${store.slug})` : "Sin vincular"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Último Ingreso
              </span>
            </div>
            <span className="text-xs text-zinc-300 block truncate">
              {formatDate(user.last_sign_in_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
