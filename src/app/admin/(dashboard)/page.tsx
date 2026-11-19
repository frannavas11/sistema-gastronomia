import Link from "next/link";
import { ArrowUpRight, Bike, Store as StoreIcon } from "lucide-react";
import { getOwnerContext } from "@/lib/supabase/owner";
import { StoreStatusToggle } from "@/components/admin/StoreStatusToggle";
import { NoStoreNotice } from "@/components/admin/NoStoreNotice";
import { formatCurrencyARS, formatTimeAR, startOfTodayARIso, STORE_TIME_ZONE } from "@/lib/format";

export const dynamic = "force-dynamic";

function getGreeting() {
  const hour = Number(
    new Intl.DateTimeFormat("es-AR", { hour: "numeric", hourCycle: "h23", timeZone: STORE_TIME_ZONE }).format(
      new Date(),
    ),
  );
  if (hour < 6) return "Buenas noches";
  if (hour < 13) return "Buen día";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

export default async function AdminDashboardPage() {
  const { store, supabase } = await getOwnerContext();
  if (!store) return <NoStoreNotice />;

  const todayIso = startOfTodayARIso();
  const [productsResult, todayOrdersResult, recentOrdersResult] = await Promise.all([
    supabase.from("products").select("id, is_available, is_active").eq("store_id", store.id),
    supabase.from("orders").select("total").eq("store_id", store.id).gte("created_at", todayIso),
    supabase
      .from("orders")
      .select("id, created_at, total, customer_name, delivery_type")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const products = (productsResult.data ?? []).filter((p) => p.is_active !== false);
  const availableProducts = products.filter((p) => p.is_available !== false).length;
  const todayOrders = todayOrdersResult.data ?? [];
  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const recentOrders = recentOrdersResult.data ?? [];

  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: STORE_TIME_ZONE,
  });

  const stats = [
    { label: "Pedidos de hoy", value: String(todayOrders.length), note: "registrados desde las 00:00", href: "/admin/orders" },
    { label: "Facturado hoy", value: formatCurrencyARS(todayRevenue), note: "estimado según pedidos", href: "/admin/orders" },
    {
      label: "Platos disponibles",
      value: `${availableProducts}/${products.length}`,
      note: availableProducts < products.length ? `${products.length - availableProducts} agotados` : "toda la carta activa",
      href: "/admin/menu",
    },
  ];

  return (
    <div className="space-y-10">
      <header className="animate-rise">
        <p className="eyebrow text-brand-fg first-letter:uppercase">{today}</p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl leading-[1.05] text-text-primary tracking-tight">
          {getGreeting()}, <span className="italic text-brand-fg">{store.name}</span>
        </h1>
        <p className="mt-3 text-text-secondary max-w-xl">
          Así viene el servicio. Abrí o cerrá el local, revisá los pedidos y ajustá la carta.
        </p>
      </header>

      <div className="animate-rise" style={{ animationDelay: "80ms" }}>
        <StoreStatusToggle storeId={store.id} initialIsOpen={store.is_open ?? true} />
      </div>

      <section
        className="grid grid-cols-1 sm:grid-cols-3 border-y border-border divide-y sm:divide-y-0 sm:divide-x divide-border animate-rise"
        style={{ animationDelay: "140ms" }}
      >
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group py-6 sm:px-6 first:sm:pl-0 last:sm:pr-0 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="eyebrow text-text-tertiary">{stat.label}</span>
              <ArrowUpRight className="w-4 h-4 text-text-tertiary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
            <p className="mt-3 font-serif text-5xl leading-none text-text-primary tabular-nums tracking-tight">
              {stat.value}
            </p>
            <p className="mt-2 font-serif italic text-sm text-text-secondary">{stat.note}</p>
          </Link>
        ))}
      </section>

      <section className="animate-rise" style={{ animationDelay: "200ms" }}>
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl text-text-primary">Últimas comandas</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-brand-fg hover:underline underline-offset-4">
            Ver todas →
          </Link>
        </div>
        <div className="mt-3 rule-double" />

        {recentOrders.length === 0 ? (
          <p className="py-12 text-center font-serif italic text-lg text-text-secondary">
            Todavía no entró ningún pedido. Compartí el link de tu carta para empezar.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {recentOrders.map((order) => (
              <li key={order.id} className="flex items-center gap-4 py-4">
                <span className="font-serif text-2xl text-text-tertiary tabular-nums w-16 shrink-0">
                  #{order.id}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-primary truncate">{order.customer_name}</p>
                  <p className="text-xs text-text-secondary flex items-center gap-1.5 mt-0.5">
                    {order.delivery_type === "delivery" ? (
                      <Bike className="w-3.5 h-3.5" />
                    ) : (
                      <StoreIcon className="w-3.5 h-3.5" />
                    )}
                    {order.delivery_type === "delivery" ? "Envío" : "Retiro"} · {formatTimeAR(order.created_at)} hs
                  </p>
                </div>
                <span className="leader hidden sm:block" aria-hidden="true" />
                <span className="font-serif text-xl tabular-nums text-text-primary">
                  {formatCurrencyARS(order.total)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
