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
      className="min-h-screen bg-slate-50 text-slate-900 pb-32"
      style={{ "--store-primary": primaryColor } as React.CSSProperties}
    >
      {/* Header estilo Portada */}
      <header className="relative bg-white border-b border-slate-200">
        {/* Banner de fondo */}
        <div className="relative w-full h-44 sm:h-56 overflow-hidden bg-slate-100">
          {store.banner_url ? (
            <Image
              src={store.banner_url}
              alt={`Portada de ${store.name}`}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, color-mix(in srgb, ${primaryColor} 75%, black) 100%)`,
              }}
            />
          )}
        </div>

        {/* Contenedor relativo para logo superpuesto e info */}
        <div className="max-w-3xl mx-auto px-4 relative">
          {/* Logo superpuesto: circular, con borde blanco grueso, solapa mitad inferior del banner y mitad superior del fondo */}
          <div className="absolute -top-12 sm:-top-14 left-4 sm:left-6 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-md bg-white overflow-hidden z-20 flex items-center justify-center">
            {store.logo_url ? (
              <Image
                src={store.logo_url}
                alt={store.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 640px) 96px, 112px"
              />
            ) : (
              <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center font-bold text-2xl sm:text-3xl">
                {store.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          {/* Información del local: con padding-top para dejar espacio al logo superpuesto */}
          <div className="pt-14 sm:pt-16 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
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
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Bike className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Envío:{" "}
                      <strong className="text-slate-800 font-semibold tabular-nums">
                        {store.delivery_cost && store.delivery_cost > 0
                          ? formatPrice(store.delivery_cost)
                          : "A convenir"}
                      </strong>
                    </span>
                  </div>

                  {store.min_order_amount && store.min_order_amount > 0 ? (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Mínimo:{" "}
                        <strong className="text-slate-800 font-semibold tabular-nums">
                          {formatPrice(store.min_order_amount)}
                        </strong>
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {!store.is_open && (
              <div className="mt-3.5 flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  El local se encuentra cerrado en este momento. Podés recorrer la
                  carta y armar tu pedido.
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Catálogo Interactivo */}
      <StoreCatalogView store={store} categories={categories} />
    </div>
  );
}
