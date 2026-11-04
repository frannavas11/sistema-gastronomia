import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { Clock, Bike, AlertCircle } from "lucide-react";
import { getStoreCatalog } from "@/lib/supabase/queries";
import { StoreCatalogView } from "@/components/public/StoreCatalogView";
import { getContrastTextColor } from "@/lib/utils";
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
  const primaryColor = theme.primary || "#78232F";
  const contrastTextColor = getContrastTextColor(primaryColor);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStoreInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div
      className="min-h-screen bg-[#FBF5EF] text-[#211B19] pb-48 sm:pb-56 safe-bottom"
      style={
        {
          "--store-primary": primaryColor,
          "--store-primary-contrast": contrastTextColor,
          "--store-primary-dark": `color-mix(in srgb, ${primaryColor} 70%, #000000)`,
          "--store-primary-light": `color-mix(in srgb, ${primaryColor} 14%, #FFFCF8)`,
          "--store-primary-subtle": `color-mix(in srgb, ${primaryColor} 6%, #FFFCF8)`,
        } as React.CSSProperties
      }
    >
      {/* Header estilo Portada */}
      <header className="relative bg-[#FFFCF8] border-b border-[#E9DAD2]">
        {/* Banner horizontal con remate ondulado */}
        <div className="relative w-full h-44 sm:h-56 md:h-64 overflow-hidden bg-[#F6EBE4]">
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
              style={{ backgroundColor: primaryColor }}
            />
          )}

          {/* Borde inferior ondulado artesanal */}
          <div className="absolute -bottom-1 inset-x-0 overflow-hidden leading-none z-10 pointer-events-none">
            <svg
              className="relative block w-full h-4 sm:h-6 md:h-8 text-[#FFFCF8]"
              viewBox="0 0 1440 80"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M0,32 C240,75 480,85 720,50 C960,15 1200,65 1440,32 L1440,80 L0,80 Z"
              />
            </svg>
          </div>
        </div>

        {/* Identidad del local superpuesta y datos */}
        <div className="max-w-2xl mx-auto px-4 pb-5">
          {/* Logo circular superpuesto */}
          <div className="flex justify-center">
            <div className="relative -mt-12 sm:-mt-14 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#FFFCF8] shadow-sm bg-[#FFFCF8] overflow-hidden z-20 flex items-center justify-center shrink-0">
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
                <div
                  className="w-full h-full flex items-center justify-center font-serif text-2xl sm:text-3xl font-bold tracking-wider"
                  style={{
                    backgroundColor: primaryColor,
                    color: contrastTextColor,
                  }}
                >
                  {getStoreInitials(store.name)}
                </div>
              )}
            </div>
          </div>

          {/* Nombre y Estado */}
          <div className="mt-3 text-center">
            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#211B19] tracking-tight">
                {store.name}
              </h1>

              {/* Badge de estado: Abierto / Cerrado */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                  store.is_open
                    ? "bg-[#E5F4E7] text-[#249653] border-[#C2E8C7]"
                    : "bg-[#FDE8E7] text-[#C74742] border-[#FAC5C2]"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    store.is_open ? "bg-[#249653]" : "bg-[#C74742]"
                  }`}
                />
                {store.is_open ? "Abierto" : "Cerrado"}
              </span>
            </div>

            {/* Información operativa: Envío y Mínimo */}
            <div className="flex items-center justify-center gap-4 mt-2.5 text-xs text-[#74645E] flex-wrap">
              <div className="flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-[#74645E]" />
                <span>
                  Envío:{" "}
                  <strong className="text-[#211B19] font-medium tabular-nums">
                    {store.delivery_cost && store.delivery_cost > 0
                      ? formatPrice(store.delivery_cost)
                      : "A convenir"}
                  </strong>
                </span>
              </div>

              {store.min_order_amount && store.min_order_amount > 0 ? (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#74645E]" />
                  <span>
                    Mínimo:{" "}
                    <strong className="text-[#211B19] font-medium tabular-nums">
                      {formatPrice(store.min_order_amount)}
                    </strong>
                  </span>
                </div>
              ) : null}
            </div>

            {!store.is_open && (
              <div className="mt-3.5 flex items-center justify-center gap-2 p-3 rounded-xl bg-[#FEF3E2] border border-[#FAD7A0] text-[#8C5815] text-xs max-w-md mx-auto text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#E99B37]" />
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
