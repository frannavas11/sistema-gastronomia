"use client";

import { useState } from "react";
import { ShoppingBag, CheckCircle2 } from "lucide-react";
import type {
  Store,
  CategoryWithProducts,
  ProductWithOptions,
  ConfiguredItemPayload,
} from "@/types/store";
import { useCart } from "@/lib/store/useCartStore";
import { CategoryPills } from "./CategoryPills";
import { ProductCard } from "./ProductCard";
import { VariantModal } from "./VariantModal";
import { FloatingCartBar } from "./FloatingCartBar";
import { CheckoutModal } from "./CheckoutModal";

interface StoreCatalogViewProps {
  store: Store;
  categories: CategoryWithProducts[];
}

export function StoreCatalogView({
  store,
  categories,
}: StoreCatalogViewProps) {
  // Store de carrito Zustand con persistencia en localStorage por comercio
  const {
    items,
    totalItems,
    subtotal,
    hasHydrated,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart(store.slug);

  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithOptions | null>(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastAddedName, setLastAddedName] = useState<string | null>(null);

  // Apertura del modal de personalización
  const handleSelectProduct = (product: ProductWithOptions) => {
    setSelectedProduct(product);
    setIsVariantModalOpen(true);
  };

  // Añadir al carrito desde el modal de variantes
  const handleConfirmItem = (payload: ConfiguredItemPayload) => {
    addItem(payload);
    setLastAddedName(`${payload.quantity}x ${payload.product.name}`);
    setTimeout(() => {
      setLastAddedName(null);
    }, 2500);
  };

  // Añadido rápido directo desde la tarjeta (para productos sin opciones obligatorias)
  const handleQuickAdd = (product: ProductWithOptions) => {
    addItem({
      product,
      quantity: 1,
      selected_options: [],
      notes: "",
      unit_price: product.base_price,
      subtotal: product.base_price,
    });
    setLastAddedName(`1x ${product.name}`);
    setTimeout(() => {
      setLastAddedName(null);
    }, 2500);
  };

  // Confirmación del pedido en el modal de checkout (Fase 4 completada)
  const handleConfirmOrder = () => {
    // Pedido registrado exitosamente en el backend
  };

  // Filtrar categorías que contengan al menos un producto activo
  const activeCategories = categories.filter((cat) => cat.products.length > 0);

  const totalProducts = activeCategories.reduce(
    (acc, cat) => acc + cat.products.length,
    0,
  );

  return (
    <>
      {/* Barra horizontal táctil pegajosa de categorías */}
      {activeCategories.length > 0 && (
        <CategoryPills
          categories={activeCategories.map((c) => ({
            id: c.id,
            name: c.name,
            productsCount: c.products.length,
          }))}
        />
      )}

      {/* Toast flotante de confirmación de ítem agregado */}
      {lastAddedName && (
        <aside
          aria-live="polite"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>¡{lastAddedName} agregado al carrito!</span>
        </aside>
      )}

      {/* Listado vertical de categorías y productos */}
      <main className="max-w-3xl mx-auto px-4 mt-5 space-y-8">
        {totalProducts === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-8 shadow-sm">
            <ShoppingBag className="w-12 h-12 mx-auto text-zinc-400 mb-3" />
            <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
              No hay productos disponibles por el momento
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Pronto se publicará el menú actualizado del local.
            </p>
          </div>
        ) : (
          activeCategories.map((category) => (
            <section
              key={category.id}
              id={`cat-${category.id}`}
              className="scroll-mt-16 sm:scroll-mt-20"
            >
              {/* Encabezado de la categoría */}
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {category.name}
                </h2>
                <span className="text-xs text-zinc-400 font-medium">
                  {category.products.length}{" "}
                  {category.products.length === 1 ? "ítem" : "ítems"}
                </span>
              </div>

              {/* Grid de productos responsive mobile-first */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {category.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={handleSelectProduct}
                    onQuickAdd={handleQuickAdd}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Modal de personalización y selección de variantes con reinicio declarativo por key={product.id} */}
      {selectedProduct && (
        <VariantModal
          key={selectedProduct.id}
          product={selectedProduct}
          isOpen={isVariantModalOpen}
          onClose={() => setIsVariantModalOpen(false)}
          onConfirm={handleConfirmItem}
        />
      )}

      {/* Barra flotante inferior fija con total y llamada al checkout */}
      <FloatingCartBar
        totalItems={totalItems}
        subtotal={subtotal}
        hasHydrated={hasHydrated}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Modal de checkout y confirmación de pedido */}
      <CheckoutModal
        store={store}
        items={items}
        subtotal={subtotal}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onConfirmOrder={handleConfirmOrder}
        onClearCart={clearCart}
      />
    </>
  );
}
