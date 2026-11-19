import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { Clock, Bike, AlertCircle } from "lucide-react";
import { getStoreCatalog } from "@/lib/supabase/queries";
import { StoreCatalogView } from "@/components/public/StoreCatalogView";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { formatCurrencyARS } from "@/lib/format";
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
    return { title: "Local no encontrado" };
  }

  const { store } = catalog;
  const cover = store.banner_url ?? store.logo_url;

  return {
    title: `${store.name} | Carta Digital`,
    description: `Consultá la carta y hacé tu pedido online en ${store.name}.`,
    openGraph: {
      title: store.name,
      description: `Carta online de ${store.name}`,
      images: cover ? [cover] : [],
    },
  };
}

function getStoreInitials(name: string) {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default async function StorePage({ params }: PageProps) {
  const { storeSlug } = await params;
  const catalog = await getStoreCatalog(storeSlug);

  if (!catalog) {
    notFound();
  }

  const { store, categories } = catalog;
  const theme = (store.theme_colors as StoreThemeColors | null) ?? {};
  const primaryColor = theme.primary || "#78232F";
  const contrastTextColor = getContrastTextColor(primaryColor);
  const isOpen = store.is_open !== false;
  const hasDeliveryCost = (store.delivery_cost ?? 0) > 0;
  const hasMinOrder = (store.min_order_amount ?? 0) > 0;

  return (
    <div className="paper min-h-screen text-text-primary">
      {/* Sólo se inyecta el color del local: las variantes (dark/light/subtle/fg)
          se derivan en globals.css según el tema claro u oscuro activo. */}
      <style>{`
        :root {
          --store-primary: ${primaryColor};
          --store-primary-contrast: ${contrastTextColor};
        }
      `}</style>

      {/* ── Portada editorial ─────────────────────────────────────────────── */}
      <header className="relative isolate overflow-hidden bg-brand">
        <div className="relative h-[46vh] min-h-[320px] max-h-[480px]">
          {store.banner_url ? (
            <Image
              src={store.banner_url}
              alt={`Portada de ${store.name}`}
              fill
              priority
              className="object-cover scale-[1.02]"
              sizes="100vw"
            />
          ) : (
            // Sin foto: color del local con un halo de luz y la textura de papel
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(120% 90% at 85% 0%, rgba(255,255,255,0.22), transparent 55%), var(--paper-grain)",
              }}
            />
          )}

          {/* Velo para que el texto blanco se lea sobre cualquier foto */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

          <div className="absolute top-3 right-3 z-20">
            <ThemeToggle variant="floating" />
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10">
            <div className="max-w-2xl mx-auto px-5 pb-7 sm:pb-9">
              <div className="flex items-center gap-3 animate-rise">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden ring-2 ring-white/70 shadow-lg shrink-0 bg-surface">
                  {store.logo_url ? (
                    <Image
                      src={store.logo_url}
                      alt={store.name}
                      fill
                      priority
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center font-serif text-xl"
                      style={{ backgroundColor: primaryColor, color: contrastTextColor }}
                    >
                      {getStoreInitials(store.name)}
                    </div>
                  )}
                </div>
                <div className="text-white/85">
                  <p className="eyebrow">Carta digital</p>
                  <p className="font-serif italic text-sm text-white/75">
                    Pedí online, confirmá por WhatsApp
                  </p>
                </div>
              </div>

              <h1
                className="mt-4 font-serif text-[2.6rem] leading-[0.95] sm:text-6xl text-white tracking-tight text-balance animate-rise"
                style={{ animationDelay: "80ms" }}
              >
                {store.name}
              </h1>

              <div
                className="mt-4 flex flex-wrap items-center gap-2 text-xs animate-rise"
                style={{ animationDelay: "160ms" }}
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold bg-black/35 text-white border border-white/20 backdrop-blur-md">
                  <span className="relative flex w-2 h-2">
                    {isOpen && (
                      <span className="absolute inline-flex h-full w-full rounded-full bg-success-solid opacity-60 animate-ping" />
                    )}
                    <span
                      className={`relative inline-flex w-2 h-2 rounded-full ${
                        isOpen ? "bg-success-solid" : "bg-error-solid"
                      }`}
                    />
                  </span>
                  {isOpen ? "Abierto ahora" : "Cerrado"}
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 text-white border border-white/20 backdrop-blur-md">
                  <Bike className="w-3.5 h-3.5" />
                  Envío{" "}
                  <strong className="font-semibold tabular-nums">
                    {hasDeliveryCost ? formatCurrencyARS(store.delivery_cost!) : "a convenir"}
                  </strong>
                </span>

                {hasMinOrder && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 text-white border border-white/20 backdrop-blur-md">
                    <Clock className="w-3.5 h-3.5" />
                    Mínimo{" "}
                    <strong className="font-semibold tabular-nums">
                      {formatCurrencyARS(store.min_order_amount!)}
                    </strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {!isOpen && (
        <div className="max-w-2xl mx-auto px-5 mt-5">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-warning-soft border border-warning-border text-warning-fg text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-warning mt-0.5" />
            <p>
              <span className="font-semibold">El local está cerrado en este momento.</span>{" "}
              Podés recorrer la carta; los pedidos se habilitan cuando vuelva a abrir.
            </p>
          </div>
        </div>
      )}

      <StoreCatalogView store={store} categories={categories} />
    </div>
  );
}
