import { getOwnerContext } from "@/lib/supabase/owner";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

/**
 * Layout protegido del panel. La protección real está en `src/proxy.ts` (redirige sin sesión);
 * `getOwnerContext` vuelve a verificar por las dudas y comparte el local con las páginas.
 */
export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, store } = await getOwnerContext();

  return (
    <div className="paper min-h-screen text-text-primary flex flex-col md:flex-row selection:bg-brand-tint selection:text-brand-fg">
      <AdminSidebar
        userEmail={user.email}
        storeName={store?.name ?? null}
        storeSlug={store?.slug ?? null}
      />
      <div className="flex-1 min-w-0 pb-28 md:pb-10">
        <main className="p-4 sm:p-6 lg:p-10 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
