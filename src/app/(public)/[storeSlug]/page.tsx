import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { Clock, Bike, AlertCircle } from "lucide-react";
import { getStoreCatalog } from "@/lib/supabase/queries";
import { StoreCatalogView } from "@/components/public/StoreCatalogView";
import type { StoreThemeColors } from "@/types/store";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    storeSlug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { storeSlug } = await params;
  const catalog = await getStoreCatalog(storeSlug);

  if (!catalog) {
    return {
      title: "Local no encontrado",
    };
  }

  const { store } = catalog;

  return {
    title: `${store.name} | Carta Digital`,
    description: `Consultá la carta y hacé tu pedido online en ${store.name}.`,
    openGraph: {
      title: store.name,
      description: `Carta online de ${store.name}`,
      images: store.banner_url
        ? [store.banner_url]
        : store.logo_url
        ? [store.logo_url]
        : [],
    },
  };
}

export default async function StorePage({ params }: PageProps) {
  const { storeSlug } = await params;
  const catalog = await getStoreCatalog(storeSlug);

  if (!catalog) {
    notFound();
  }

  const { store, categories } = catalog;
  const theme = (store.theme_colors as unknown as StoreThemeColors) || {};
  const primaryColor = theme.primary || "#e11d48"; // Color base por defecto

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-28"
      style={{ "--store-primary": primaryColor } as React.CSSProperties}
    >
      {/* 1. Header con Banner y Datos del Local (Server Rendered) */}
      <header className="relative bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        {/* Banner superior opcional */}
        {store.banner_url ? (
          <div className="relative w-full h-36 sm:h-48 overflow-hidden bg-zinc-200 dark:bg-zinc-800">
            <Image
              src={store.banner_url}
              alt={`Banner de ${store.name}`}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </div>
        ) : (
          <div className="h-16 bg-gradient-to-r from-zinc-800 to-zinc-900" />
        )}

        <div className="max-w-3xl mx-auto px-4 pt-3 pb-4">
          <div className="flex items-start gap-3.5">
            {/* Logo */}
            {store.logo_url ? (
              <div className="relative -mt-8 sm:-mt-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white dark:border-zinc-900 shadow-md bg-white flex-shrink-0">
                <Image
                  src={store.logo_url}
                  alt={store.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            ) : (
              <div className="relative -mt-8 sm:-mt-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-white dark:border-zinc-900 shadow-md bg-zinc-800 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                {store.name.substring(0, 2).toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                  {store.name}
                </h1>

                {/* Badge de estado: Abierto / Cerrado */}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    store.is_open
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      store.is_open ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                  {store.is_open ? "Abierto" : "Cerrado"}
                </span>
              </div>

              {/* Información operativa */}
              <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                <div className="flex items-center gap-1">
                  <Bike className="w-3.5 h-3.5" />
                  <span>
                    Envío:{" "}
                    <strong className="text-zinc-700 dark:text-zinc-300">
                      {store.delivery_cost && store.delivery_cost > 0
                        ? formatPrice(store.delivery_cost)
                        : "A convenir"}
                    </strong>
                  </span>
                </div>

                {store.min_order_amount && store.min_order_amount > 0 ? (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      Mínimo:{" "}
                      <strong className="text-zinc-700 dark:text-zinc-300">
                        {formatPrice(store.min_order_amount)}
                      </strong>
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {!store.is_open && (
            <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                El local se encuentra actualmente cerrado. Podés explorar la
                carta, pero el pedido se confirmará cuando abra.
              </span>
            </div>
          )}
        </div>
      </header>

      {/* 2. Catálogo Interactivo (CategoryPills, ProductCards y VariantModal) */}
      <StoreCatalogView store={store} categories={categories} />
    </div>
  );
}
