import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  CartItem,
  ConfiguredItemPayload,
  SelectedOptionItem,
} from "@/types/store";

export interface CartStoreState {
  items: CartItem[];
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  addItem: (payload: ConfiguredItemPayload) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

/**
 * Genera un ID determinístico para un ítem del carrito basado en
 * el producto, sus opciones seleccionadas y las notas para la cocina.
 * Si dos adiciones son idénticas, se agrupan aumentando la cantidad.
 */
function generateCartItemId(
  productId: string,
  options: SelectedOptionItem[],
  notes: string,
): string {
  const sortedOptionIds = options
    .map((o) => `${o.group_id}:${o.id}`)
    .sort()
    .join("|");
  const cleanNotes = notes.trim().toLowerCase();
  return `${productId}__${sortedOptionIds}__${cleanNotes}`;
}

const storesCache = new Map<
  string,
  ReturnType<typeof createCartStoreInstance>
>();

function createCartStoreInstance(storeKey: string) {
  return create<CartStoreState>()(
    persist(
      (set, get) => ({
        items: [],
        hasHydrated: false,
        setHasHydrated: (val) => set({ hasHydrated: val }),

        addItem: (payload: ConfiguredItemPayload) => {
          const id = generateCartItemId(
            payload.product.id,
            payload.selected_options,
            payload.notes,
          );

          set((state) => {
            const existingIndex = state.items.findIndex(
              (item) => item.id === id,
            );

            if (existingIndex > -1) {
              const updatedItems = [...state.items];
              const existing = updatedItems[existingIndex];
              const newQuantity = existing.quantity + payload.quantity;
              updatedItems[existingIndex] = {
                ...existing,
                quantity: newQuantity,
                subtotal: existing.unit_price * newQuantity,
              };
              return { items: updatedItems };
            }

            const newItem: CartItem = {
              id,
              product_id: payload.product.id,
              product_name: payload.product.name,
              image_url: payload.product.image_url,
              base_price: payload.product.base_price,
              unit_price: payload.unit_price,
              quantity: payload.quantity,
              selected_options: payload.selected_options,
              notes: payload.notes,
              subtotal: payload.subtotal,
            };

            return { items: [...state.items, newItem] };
          });
        },

        removeItem: (itemId: string) => {
          set((state) => ({
            items: state.items.filter((item) => item.id !== itemId),
          }));
        },

        updateQuantity: (itemId: string, quantity: number) => {
          set((state) => {
            if (quantity <= 0) {
              return {
                items: state.items.filter((item) => item.id !== itemId),
              };
            }

            return {
              items: state.items.map((item) => {
                if (item.id === itemId) {
                  return {
                    ...item,
                    quantity,
                    subtotal: item.unit_price * quantity,
                  };
                }
                return item;
              }),
            };
          });
        },

        clearCart: () => {
          set({ items: [] });
        },

        getTotalItems: () => {
          return get().items.reduce((acc, item) => acc + item.quantity, 0);
        },

        getSubtotal: () => {
          return get().items.reduce((acc, item) => acc + item.subtotal, 0);
        },
      }),
      {
        name: `gastro_cart_${storeKey}`,
        storage: createJSONStorage(() => localStorage),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      },
    ),
  );
}

/**
 * Obtiene o crea la instancia del store aislada por comercio (slug o id).
 */
export function getCartStore(storeKey: string) {
  if (!storesCache.has(storeKey)) {
    storesCache.set(storeKey, createCartStoreInstance(storeKey));
  }
  return storesCache.get(storeKey)!;
}

/**
 * Hook para suscribirse al store de un comercio con un selector arbitrario.
 */
export function useCartStore<T>(
  storeKey: string,
  selector: (state: CartStoreState) => T,
): T {
  const store = getCartStore(storeKey);
  return store(selector);
}

/**
 * Hook de alto nivel con todos los métodos y selectores calculados para el carrito.
 */
export function useCart(storeKey: string) {
  const store = getCartStore(storeKey);
  const items = store((s) => s.items);
  const hasHydrated = store((s) => s.hasHydrated);
  const addItem = store((s) => s.addItem);
  const removeItem = store((s) => s.removeItem);
  const updateQuantity = store((s) => s.updateQuantity);
  const clearCart = store((s) => s.clearCart);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);

  return {
    items,
    hasHydrated,
    totalItems,
    subtotal,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}

