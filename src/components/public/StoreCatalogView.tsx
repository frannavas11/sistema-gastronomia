"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
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
  const [cartBarHeight, setCartBarHeight] = useState<number>(0);

  const hasCartItems = hasHydrated && totalItems > 0;

  const handleSelectProduct = (product: ProductWithOptions) => {
    setSelectedProduct(product);
    setIsVariantModalOpen(true);
  };

  const handleConfirmItem = (payload: ConfiguredItemPayload) => {
    addItem(payload);
    toast.success(`${payload.quantity}x ${payload.product.name}`, {
      description: "Agregado a tu pedido",
    });
  };

  const handleQuickAdd = (product: ProductWithOptions) => {
    addItem({
      product,
      quantity: 1,
      selected_options: [],
      notes: "",
      unit_price: product.base_price,
      subtotal: product.base_price,
    });
    toast.success(`1x ${product.name}`, {
      description: "Agregado a tu pedido",
    });
  };

  const handleConfirmOrder = () => {
    // Pedido registrado exitosamente en el backend
  };

  const activeCategories = categories.filter((cat) => cat.products.length > 0);

  const totalProducts = activeCategories.reduce(
    (acc, cat) => acc + cat.products.length,
    0,
  );

  return (
    <>
      {/* Barra pegajosa de categorías */}
      {activeCategories.length > 0 && (
        <CategoryPills
          categories={activeCategories.map((c) => ({
            id: c.id,
            name: c.name,
            productsCount: c.products.length,
          }))}
        />
      )}

      {/* Listado de categorías y productos con tarjetas horizontales */}
      <main
        className="max-w-2xl mx-auto px-4 mt-6 space-y-8 transition-[padding-bottom] duration-200 ease-out"
        style={{
          paddingBottom: hasCartItems
            ? `calc(var(--cart-bar-height, ${cartBarHeight || 80}px) + env(safe-area-inset-bottom, 0px) + 24px)`
            : "2rem",
        }}
      >
        {totalProducts === 0 ? (
          <div className="text-center py-16 px-6 bg-[#FFFCF8] rounded-2xl border border-[#E9DAD2] shadow-xs max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[var(--store-primary-light)] border border-[var(--store-primary-subtle)] mx-auto flex items-center justify-center text-[var(--store-primary)] mb-3">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#211B19]">
              La carta se está actualizando
            </h2>
            <p className="text-xs sm:text-sm text-[#74645E] mt-1.5 leading-relaxed">
              El local está renovando sus platos y precios. ¡Volvé a visitarnos en unos momentos!
            </p>
          </div>
        ) : (
          activeCategories.map((category) => (
            <section
              key={category.id}
              id={`cat-${category.id}`}
              className="scroll-mt-20"
            >
              {/* Encabezado de la sección de categoría con fuente serif */}
              <div className="flex items-baseline justify-between pb-2 mb-3.5 border-b border-[#E9DAD2]">
                <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#211B19] tracking-tight">
                  {category.name}
                </h2>
                <span className="text-xs text-[#74645E] font-medium tabular-nums">
                  {category.products.length}{" "}
                  {category.products.length === 1 ? "ítem" : "ítems"}
                </span>
              </div>

              {/* Lista vertical de productos */}
              <div className="flex flex-col gap-3 sm:gap-3.5">
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

      {/* Modal de producto usando Vaul / Bottom Sheet */}
      {selectedProduct && (
        <VariantModal
          key={selectedProduct.id}
          product={selectedProduct}
          isOpen={isVariantModalOpen}
          onClose={() => setIsVariantModalOpen(false)}
          onConfirm={handleConfirmItem}
        />
      )}

      {/* Barra flotante del carrito */}
      <FloatingCartBar
        totalItems={totalItems}
        subtotal={subtotal}
        hasHydrated={hasHydrated}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onHeightChange={setCartBarHeight}
      />

      {/* Modal de checkout usando Vaul / Bottom Sheet */}
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
