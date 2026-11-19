import { getOwnerContext } from "@/lib/supabase/owner";
import { AdminMenuClient } from "@/components/admin/AdminMenuClient";
import { NoStoreNotice } from "@/components/admin/NoStoreNotice";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const { store, supabase } = await getOwnerContext();
  if (!store) return <NoStoreNotice />;

  const [categoriesResult, productsResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, display_order, is_active")
      .eq("store_id", store.id)
      .order("display_order", { ascending: true }),
    supabase
      .from("products")
      .select("id, name, description, base_price, is_available, is_active, category_id, image_url, display_order")
      .eq("store_id", store.id)
      .order("display_order", { ascending: true }),
  ]);

  return (
    <AdminMenuClient
      storeId={store.id}
      categories={categoriesResult.data ?? []}
      products={productsResult.data ?? []}
    />
  );
}
