import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { AdminMenuClient } from "@/components/admin/AdminMenuClient";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const { user } = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  const supabase = await createClient();

  // Obtener el comercio del usuario
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

  // Consultar categorías y productos de este comercio
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

  const categories = categoriesResult.data ?? [];
  const products = productsResult.data ?? [];

  return (
    <AdminMenuClient
      store={store}
      categories={categories}
      products={products}
    />
  );
}
