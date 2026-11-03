import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
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
    .select("id, name, slug, phone_whatsapp, delivery_cost, min_order_amount")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!store) {
    return (
      <div className="p-8 text-center text-zinc-400">
        No se encontró ningún local vinculado a tu usuario.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-rose-400" />
            Preferencias del Local
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
          Configuración General
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Modificá el número de WhatsApp receptor, costos de entrega y datos comerciales.
        </p>
      </div>

      <StoreSettingsForm store={store} />
    </div>
  );
}
