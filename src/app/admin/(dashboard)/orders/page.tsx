import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { AdminOrdersClient } from "@/components/admin/AdminOrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const { user } = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select("id, name, slug")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!store) {
    return (
      <div className="p-8 text-center text-slate-500">
        No se encontró ningún local vinculado a tu usuario.
      </div>
    );
  }

  const { data: rawOrders } = await supabase
    .from("orders")
    .select(
      `
      id,
      created_at,
      customer_name,
      customer_phone,
      delivery_type,
      delivery_address,
      delivery_fee,
      payment_method,
      notes,
      status,
      subtotal,
      total,
      order_items (
        id,
        product_name,
        quantity,
        unit_price,
        subtotal,
        selected_options
      )
    `,
    )
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  const orders = rawOrders ?? [];

  return <AdminOrdersClient store={store} orders={orders} />;
}
