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
      <main className="max-w-2xl mx-auto px-4 mt-6 space-y-8">
        {totalProducts === 0 ? (
          <div className="text-center py-16 bg-[#FFFCF8] rounded-2xl border border-[#E9DAD2] p-8 shadow-xs">
            <ShoppingBag className="w-10 h-10 mx-auto text-[#A18A81] mb-2" />
            <h2 className="font-serif text-lg text-[#211B19]">
              No hay productos disponibles por el momento
            </h2>
            <p className="text-xs text-[#74645E] mt-1">
              Pronto se publicará el menú actualizado del local.
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

      {/* Barra flotante del carrito en bordó */}
      <FloatingCartBar
        totalItems={totalItems}
        subtotal={subtotal}
        hasHydrated={hasHydrated}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
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
