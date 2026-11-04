import Link from "next/link";
import {
  UtensilsCrossed,
  ArrowRight,
  MessageCircle,
  CircleDollarSign,
  Smartphone,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const contactWhatsapp = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP?.trim();
  const cleanPhone = contactWhatsapp ? contactWhatsapp.replace(/\D/g, "") : "";
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        "Hola, me interesa tener la carta digital para mi local.",
      )}`
    : null;

  return (
    <div className="min-h-screen bg-[#FBF5EF] text-[#211B19] flex flex-col selection:bg-[#F4E3E0] selection:text-[#78232F]">
      {/* 1. Header */}
      <header className="border-b border-[#E9DAD2] bg-[#FFFCF8]/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#78232F] text-white flex items-center justify-center shadow-xs">
              <UtensilsCrossed className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="font-serif text-lg sm:text-xl font-normal text-[#211B19] tracking-tight">
              Carta Directa
            </span>
          </div>

          <Link
            href="/admin/login"
            className="text-xs sm:text-sm font-medium text-[#74645E] hover:text-[#211B19] hover:bg-[#F6EBE4] px-3.5 py-2 rounded-xl transition-colors min-h-[44px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78232F]"
          >
            Ingresar
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="px-4 sm:px-6 pt-12 pb-14 sm:pt-20 sm:pb-20 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#F4E3E0] text-[#78232F] border border-[#E9DAD2] mb-6 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Cartas digitales para locales gastronómicos</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#211B19] tracking-tight leading-tight sm:leading-tight">
          Tu carta digital, con pedidos directo a tu WhatsApp. Sin comisiones.
        </h1>

        <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[#74645E] max-w-xl mx-auto leading-relaxed">
          Tus clientes recorren el menú, eligen opciones y te envían el pedido ordenado y listo para preparar. Vos cobrás el 100% de tus ventas.
        </p>

        {/* Acciones principales */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto">
          <Link
            href="/demo"
            className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-[#78232F] hover:bg-[#541923] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78232F] focus-visible:ring-offset-2"
          >
            <span>Ver demo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-[#FFFCF8] hover:bg-[#F6EBE4] text-[#211B19] border border-[#E9DAD2] font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78232F]"
            >
              <MessageCircle className="w-4 h-4 text-[#249653]" />
              <span>Hablemos por WhatsApp</span>
            </a>
          )}
        </div>
      </section>

      {/* 3. Tres Beneficios Clave */}
      <section className="py-12 sm:py-16 border-t border-[#E9DAD2] bg-[#FFFCF8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#211B19] tracking-tight">
              Pensada para el trabajo real de tu cocina
            </h2>
            <p className="text-xs sm:text-sm text-[#74645E] mt-2 leading-relaxed">
              Sin intermediarios ni complicaciones operativas en los momentos de más movimiento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Beneficio 1 */}
            <div className="bg-[#FBF5EF] border border-[#E9DAD2] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-3">
              <div className="w-11 h-11 rounded-xl bg-[#F4E3E0] text-[#78232F] flex items-center justify-center">
                <CircleDollarSign className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-serif text-lg font-normal text-[#211B19]">
                Sin comisiones por venta
              </h3>
              <p className="text-xs sm:text-sm text-[#74645E] leading-relaxed">
                Cobrás el 100% de lo que vendés. No hay porcentajes por pedido ni cargos ocultos sobre tus platos.
              </p>
            </div>

            {/* Beneficio 2 */}
            <div className="bg-[#FBF5EF] border border-[#E9DAD2] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-3">
              <div className="w-11 h-11 rounded-xl bg-[#E5F4E7] text-[#249653] flex items-center justify-center">
                <MessageCircle className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-serif text-lg font-normal text-[#211B19]">
                El pedido llega ordenado a tu WhatsApp
              </h3>
              <p className="text-xs sm:text-sm text-[#74645E] leading-relaxed">
                Recibís cada ítem con sus variantes, sabores, dirección de entrega y total calculado. Sin audios confusos ni demoras.
              </p>
            </div>

            {/* Beneficio 3 */}
            <div className="bg-[#FBF5EF] border border-[#E9DAD2] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-3">
              <div className="w-11 h-11 rounded-xl bg-[#F6EBE4] text-[#78232F] flex items-center justify-center">
                <Smartphone className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-serif text-lg font-normal text-[#211B19]">
                Cambiás precios y marcás agotados desde el celular
              </h3>
              <p className="text-xs sm:text-sm text-[#74645E] leading-relaxed">
                Accedé a tu panel desde el teléfono para actualizar un precio en segundos, pausar un producto sin stock o cerrar el local al terminar el turno.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Cómo funciona en 3 pasos */}
      <section className="py-12 sm:py-16 border-t border-[#E9DAD2]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#211B19] tracking-tight">
              Cómo funciona en 3 simples pasos
            </h2>
            <p className="text-xs sm:text-sm text-[#74645E] mt-2 leading-relaxed">
              Empezar es fácil y no tenés que cargar nada complicado por tu cuenta.
            </p>
          </div>

          <div className="space-y-4">
            {/* Paso 1 */}
            <div className="bg-[#FFFCF8] border border-[#E9DAD2] rounded-2xl p-5 sm:p-6 flex items-start gap-4 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-[#78232F] text-white flex items-center justify-center font-bold text-sm shrink-0">
                1
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base sm:text-lg font-normal text-[#211B19]">
                  Nos pasás tu menú
                </h3>
                <p className="text-xs sm:text-sm text-[#74645E] leading-relaxed">
                  Nos compartís tu lista de productos, precios actuales, fotos y opciones. Nosotros nos encargamos de dejar todo cargado.
                </p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="bg-[#FFFCF8] border border-[#E9DAD2] rounded-2xl p-5 sm:p-6 flex items-start gap-4 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-[#78232F] text-white flex items-center justify-center font-bold text-sm shrink-0">
                2
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base sm:text-lg font-normal text-[#211B19]">
                  Lo dejamos funcionando
                </h3>
                <p className="text-xs sm:text-sm text-[#74645E] leading-relaxed">
                  Configuramos el logo, los colores de tu marca, el costo de entrega y conectamos los pedidos directamente a tu número de WhatsApp.
                </p>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="bg-[#FFFCF8] border border-[#E9DAD2] rounded-2xl p-5 sm:p-6 flex items-start gap-4 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-[#249653] text-white flex items-center justify-center font-bold text-sm shrink-0">
                3
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base sm:text-lg font-normal text-[#211B19]">
                  Empezás a recibir pedidos
                </h3>
                <p className="text-xs sm:text-sm text-[#74645E] leading-relaxed">
                  Compartís el link de tu carta por Instagram, en tus estados de WhatsApp o mediante un código QR en las mesas y mostrador.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Cierre con llamada a la acción */}
      <section className="py-12 sm:py-16 border-t border-[#E9DAD2] bg-[#FFFCF8]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#211B19] tracking-tight">
            ¿Querés sumar tu local?
          </h2>
          <p className="text-xs sm:text-sm text-[#74645E] max-w-lg mx-auto leading-relaxed">
            Empezá a recibir pedidos más rápido, con menos errores y sin pagar comisiones por cada plato que vendés.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto min-h-[48px] px-7 py-3 rounded-xl bg-[#78232F] hover:bg-[#541923] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78232F] focus-visible:ring-offset-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Hablemos por WhatsApp</span>
              </a>
            ) : (
              <Link
                href="/demo"
                className="w-full sm:w-auto min-h-[48px] px-7 py-3 rounded-xl bg-[#78232F] hover:bg-[#541923] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78232F] focus-visible:ring-offset-2"
              >
                <span>Probar la carta demo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              href="/demo"
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-[#FBF5EF] hover:bg-[#F6EBE4] text-[#211B19] border border-[#E9DAD2] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78232F]"
            >
              <span>Ver cómo queda una carta</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Footer Discreto */}
      <footer className="mt-auto border-t border-[#E9DAD2] bg-[#FBF5EF] py-8 text-center text-xs text-[#74645E]">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Carta Directa • Pedidos gastronómicos sin comisiones</span>
          <Link
            href="/admin/login"
            className="hover:text-[#211B19] underline underline-offset-4 transition-colors"
          >
            Acceso para locales
          </Link>
        </div>
      </footer>
    </div>
  );
}
