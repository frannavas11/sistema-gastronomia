import type { Tables } from "./supabase";

export type Store = Pick<
  Tables<"stores">,
  | "id"
  | "name"
  | "slug"
  | "phone_whatsapp"
  | "is_open"
  | "delivery_cost"
  | "min_order_amount"
  | "theme_colors"
  | "logo_url"
  | "banner_url"
>;
export type Category = Tables<"categories">;
export type Product = Tables<"products">;
export type ProductOptionGroup = Tables<"product_option_groups">;
export type ProductOptionItem = Tables<"product_option_items">;

export type ProductOptionGroupWithItems = ProductOptionGroup & {
  items: ProductOptionItem[];
};

export type ProductWithOptions = Product & {
  option_groups: ProductOptionGroupWithItems[];
};

export type CategoryWithProducts = Category & {
  products: ProductWithOptions[];
};

export interface StoreThemeColors {
  primary?: string;
  secondary?: string;
  accent?: string;
}

export interface CatalogData {
  store: Store;
  categories: CategoryWithProducts[];
}

export interface SelectedOptionItem {
  id: string;
  name: string;
  price: number;
  group_id: string;
  group_name: string;
}

export interface ConfiguredItemPayload {
  product: ProductWithOptions;
  quantity: number;
  selected_options: SelectedOptionItem[];
  notes: string;
  unit_price: number;
  subtotal: number;
}

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  image_url: string | null;
  base_price: number;
  unit_price: number;
  quantity: number;
  selected_options: SelectedOptionItem[];
  notes: string;
  subtotal: number;
}

export type DeliveryType = "delivery" | "take_away";
export type PaymentMethod = "cash" | "transfer" | "mercadopago";

export interface CheckoutFormData {
  customer_name: string;
  customer_phone: string;
  delivery_type: DeliveryType;
  delivery_address: string;
  payment_method: PaymentMethod;
  notes: string;
}

export interface CheckoutPayload extends CheckoutFormData {
  store_id: string;
  store_slug: string;
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
}
