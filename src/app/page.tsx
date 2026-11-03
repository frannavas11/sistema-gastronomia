import Link from "next/link";
import { Store, Shield, ArrowRight, UtensilsCrossed, Smartphone, Sparkles, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white">
      {/* Barra de navegación superior */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white shadow-md shadow-rose-600/25">
              <Store className="w-5 h-5" />
            </div>
            <span className="font-bold text-base text-zinc-100 tracking-tight">
              Sistema Gastronómico
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/demo"
              className="text-xs font-semibold px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Ver Carta Demo
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-sm"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Panel Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido Principal / Hero */}
      <main className="max-w-5xl mx-auto px-4 py-16 sm:py-24 flex-1 flex flex-col justify-center items-center text-center relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span>SaaS Gastronómico Sin Comisiones</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-100 max-w-2xl leading-tight">
          Tu Carta Digital conectada directo a WhatsApp
        </h1>

        <p className="mt-4 text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
          Permite a tus clientes explorar el menú, personalizar sus pedidos y enviártelos formateados al WhatsApp de tu local, con control total desde tu panel.
        </p>

        {/* Tarjetas de acceso rápido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 w-full max-w-xl">
          {/* Tarjeta 1: Ver carta */}
          <Link
            href="/demo"
            className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850/60 transition-all text-left group shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                Carta Pública (Cliente)
              </h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Probá la experiencia de un comensal: catálogo mobile-first, carrito interactivo y checkout a WhatsApp.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-amber-400">
              <span>Explorar Pizzería Demo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Tarjeta 2: Panel de Administración */}
          <Link
            href="/admin"
            className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850/60 transition-all text-left group shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100 group-hover:text-rose-400 transition-colors">
                Panel de Control (Dueño)
              </h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Abrí o cerrá el local en 1 clic, pausá productos agotados, editá precios al instante y revisá pedidos.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-rose-400">
              <span>Ingresar al Admin</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Badges de características */}
        <div className="flex items-center justify-center gap-6 mt-12 text-xs text-zinc-400 flex-wrap">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Cero comisiones por venta</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Disparo a WhatsApp directo</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Precios recalculados en servidor</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500">
        Plataforma SaaS para gastronomía • Desarrollado con Next.js y Supabase
      </footer>
    </div>
  );
}
