import { getOwnerContext } from "@/lib/supabase/owner";
import { StoreSettingsForm } from "@/components/admin/StoreSettingsForm";
import { NoStoreNotice } from "@/components/admin/NoStoreNotice";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const { store, user } = await getOwnerContext();
  if (!store) return <NoStoreNotice />;

  return (
    <div className="space-y-8 max-w-4xl">
      <header className="animate-rise">
        <p className="eyebrow text-brand-fg">La casa</p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl text-text-primary tracking-tight">Ajustes</h1>
        <p className="mt-2 text-text-secondary">
          WhatsApp que recibe los pedidos, costos de envío, imágenes y el color de tu carta.
        </p>
      </header>

      <StoreSettingsForm store={store} />

      {/* En mobile el sidebar no tiene "cerrar sesión": queda acá, accesible en todas las pantallas */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border pt-6">
        <div>
          <p className="eyebrow text-text-tertiary">Sesión</p>
          <p className="mt-1 text-sm text-text-secondary">{user.email}</p>
        </div>
        <LogoutButton variant="danger" />
      </section>
    </div>
  );
}
