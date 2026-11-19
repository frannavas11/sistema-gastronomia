import { getOwnerContext } from "@/lib/supabase/owner";
import { AdminOrdersClient } from "@/components/admin/AdminOrdersClient";
import { NoStoreNotice } from "@/components/admin/NoStoreNotice";

export const dynamic = "force-dynamic";

/** Cantidad de pedidos que se cargan (antes se traían todos los pedidos históricos sin límite). */
const ORDERS_LIMIT = 100;

export default async function AdminOrdersPage() {
  const { store, supabase } = await getOwnerContext();
  if (!store) return <NoStoreNotice />;

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `id, created_at, customer_name, customer_phone, delivery_type, delivery_address,
       delivery_fee, payment_method, notes, subtotal, total,
       order_items (id, product_name, quantity, unit_price, subtotal, selected_options)`,
    )
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })
    .limit(ORDERS_LIMIT);

  return <AdminOrdersClient storeId={store.id} orders={orders ?? []} limit={ORDERS_LIMIT} />;
}
