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
  const primaryColor = theme.primary || "#D62828";

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      className="min-h-screen bg-[#fafafa] text-zinc-900 pb-32"
      style={{ "--store-primary": primaryColor } as React.CSSProperties}
    >
      {/* Header con información del local */}
      <header className="relative bg-white border-b border-zinc-200">
        {/* Banner superior o franja de acento con el color del local */}
        {store.banner_url ? (
          <div className="relative w-full h-36 sm:h-48 overflow-hidden bg-zinc-100">
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
          <div className="h-20 sm:h-24 bg-[var(--store-primary,#D62828)] w-full" />
        )}

        <div className="max-w-3xl mx-auto px-4 pt-3 pb-4">
          <div className="flex items-start gap-4">
            {/* Logo */}
            {store.logo_url ? (
              <div className="relative -mt-8 sm:-mt-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-white shrink-0">
                <Image
                  src={store.logo_url}
                  alt={store.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            ) : (
              <div className="relative -mt-8 sm:-mt-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-white shadow-sm bg-zinc-900 text-white flex items-center justify-center font-bold text-xl shrink-0">
                {store.name.substring(0, 2).toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 truncate">
                  {store.name}
                </h1>

                {/* Badge de estado: Abierto / Cerrado */}
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    store.is_open
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
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
              <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500 flex-wrap">
                <div className="flex items-center gap-1">
                  <Bike className="w-3.5 h-3.5 text-zinc-400" />
                  <span>
                    Envío:{" "}
                    <strong className="text-zinc-800 font-semibold tabular-nums">
                      {store.delivery_cost && store.delivery_cost > 0
                        ? formatPrice(store.delivery_cost)
                        : "A convenir"}
                    </strong>
                  </span>
                </div>

                {store.min_order_amount && store.min_order_amount > 0 ? (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>
                      Mínimo:{" "}
                      <strong className="text-zinc-800 font-semibold tabular-nums">
                        {formatPrice(store.min_order_amount)}
                      </strong>
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {!store.is_open && (
            <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                El local se encuentra cerrado en este momento. Podés recorrer la
                carta y armar tu pedido.
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Catálogo Interactivo */}
      <StoreCatalogView store={store} categories={categories} />
    </div>
  );
}
