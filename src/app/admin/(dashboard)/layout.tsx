import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

/**
 * Layout protegido para el panel de administración (/admin, /admin/orders, /admin/menu, etc.).
 * Sistema visual artesanal contemporáneo con fondo crema y sidebar bordó.
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#FBF5EF] text-[#211B19] flex flex-col md:flex-row antialiased selection:bg-[#F4E3E0] selection:text-[#541923]">
      {/* Sidebar de navegación: bordó en desktop y barra adaptada en mobile */}
      <AdminSidebar userEmail={user.email} />

      {/* Área de contenido principal con padding inferior extra en mobile para no tapar la barra inferior */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 md:pb-8">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
