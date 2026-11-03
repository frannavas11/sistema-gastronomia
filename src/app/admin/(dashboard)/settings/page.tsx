import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { StoreSettingsForm } from "@/components/admin/StoreSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const { user } = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select("id, name, slug, phone_whatsapp, delivery_cost, min_order_amount, logo_url, banner_url")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!store) {
    return (
      <div className="p-8 text-center text-slate-500">
        No se encontró ningún local vinculado a tu usuario.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-5 border-b border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Configuración General
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Modificá el número de WhatsApp receptor, costos de entrega y montos mínimos.
        </p>
      </div>

      <StoreSettingsForm store={store} />
    </div>
  );
}
