"use client";

import { useState } from "react";
import { UtensilsCrossed } from "lucide-react";
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

export function StoreCatalogView({ store, categories }: StoreCatalogViewProps) {
  const cart = useCart(store.slug);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithOptions | null>(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const hasCartItems = cart.hasHydrated && cart.totalItems > 0;
  const activeCategories = categories.filter((cat) => cat.products.length > 0);

  const addToCart = (payload: ConfiguredItemPayload) => {
    cart.addItem(payload);
    toast.success(`${payload.quantity}× ${payload.product.name}`, {
      description: "Agregado a tu pedido",
    });
  };

  const openProduct = (product: ProductWithOptions) => {
    setSelectedProduct(product);
    setIsVariantModalOpen(true);
  };

  const quickAdd = (product: ProductWithOptions) =>
    addToCart({
      product,
      quantity: 1,
      selected_options: [],
      notes: "",
      unit_price: product.base_price,
      subtotal: product.base_price,
    });

  return (
    <>
      <CategoryPills categories={activeCategories.map(({ id, name }) => ({ id, name }))} />

      <main
        className={`max-w-2xl mx-auto px-5 pt-10 space-y-14 transition-[padding] duration-300 ${
          hasCartItems ? "pb-36" : "pb-16"
        }`}
      >
        {activeCategories.length === 0 ? (
          <div className="text-center py-16 px-6 max-w-md mx-auto animate-rise">
            <div className="w-16 h-16 rounded-full bg-brand-light mx-auto flex items-center justify-center text-brand-fg mb-5">
              <UtensilsCrossed className="w-7 h-7" />
            </div>
            <p className="eyebrow text-brand-fg">En la cocina</p>
            <h2 className="mt-2 font-serif text-3xl text-text-primary">La carta se está actualizando</h2>
            <p className="mt-2 font-serif italic text-text-secondary leading-relaxed">
              El local está renovando sus platos y precios. Volvé en unos minutos.
            </p>
          </div>
        ) : (
          activeCategories.map((category, index) => (
            <section
              key={category.id}
              id={`cat-${category.id}`}
              className="scroll-mt-20 animate-rise"
              style={{ animationDelay: `${Math.min(index, 4) * 70}ms` }}
            >
              <header className="mb-2">
                <div className="flex items-end gap-3">
                  <span className="font-serif italic text-2xl text-brand-fg leading-none tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl leading-none text-text-primary tracking-tight">
                    {category.name}
                  </h2>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="rule-double flex-1" />
                  <span className="eyebrow text-text-tertiary">
                    {category.products.length} {category.products.length === 1 ? "plato" : "platos"}
                  </span>
                </div>
              </header>

              <div className="divide-y divide-border/70">
                {category.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={openProduct}
                    onQuickAdd={quickAdd}
                  />
                ))}
              </div>
            </section>
          ))
        )}

        {activeCategories.length > 0 && (
          <footer className="pt-4 text-center text-text-tertiary">
            <p className="font-serif italic text-lg">✦ Buen provecho ✦</p>
            <p className="eyebrow mt-2">{store.name}</p>
          </footer>
        )}
      </main>

      {selectedProduct && (
        <VariantModal
          key={selectedProduct.id}
          product={selectedProduct}
          isOpen={isVariantModalOpen}
          onClose={() => setIsVariantModalOpen(false)}
          onConfirm={addToCart}
        />
      )}

      <FloatingCartBar
        totalItems={cart.totalItems}
        subtotal={cart.subtotal}
        isVisible={hasCartItems && !isCheckoutOpen}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        store={store}
        items={cart.items}
        subtotal={cart.subtotal}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onUpdateQuantity={cart.updateQuantity}
        onRemoveItem={cart.removeItem}
        onOrderPlaced={cart.clearCart}
      />
    </>
  );
}
