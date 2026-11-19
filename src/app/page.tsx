import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  UtensilsCrossed,
  ArrowRight,
  MessageCircle,
  CircleDollarSign,
  Smartphone,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const contactWhatsapp = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP?.trim();
  const cleanPhone = contactWhatsapp ? contactWhatsapp.replace(/\D/g, "") : "";
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        "Hola, vi Carta Directa y quiero más información",
      )}`
    : null;

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans selection:bg-brand-tint selection:text-brand-fg">
      {/* 1. Header sticky con fondo sólido (blur suave) y borde fino */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Marca */}
          <Link
            href="/"
            className="flex items-center gap-2.5 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-brand text-white flex items-center justify-center shadow-xs">
              <UtensilsCrossed className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="font-serif text-lg sm:text-xl font-normal text-text-primary tracking-tight">
              Carta Directa
            </span>
          </Link>

          {/* Enlaces y Acciones */}
          <div className="flex items-center gap-1 sm:gap-3">
            <ThemeToggle />

            <Link
              href="/admin/login"
              className="min-h-[44px] px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              Ingresar
            </Link>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex min-h-[44px] items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-brand text-white hover:bg-brand-dark shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Hablemos por WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero en dos columnas (escritorio) y apilado (móvil) */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28">
        {/* Formas decorativas suaves en SVG detrás */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden -z-10"
          aria-hidden="true"
        >
          <svg
            className="absolute top-0 right-1/4 w-[600px] h-[600px] text-surface-2/60 blur-2xl"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <circle cx="50" cy="50" r="45" />
          </svg>
          <svg
            className="absolute -top-20 -right-20 w-[450px] h-[450px] text-brand-tint/40 blur-3xl"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <circle cx="50" cy="50" r="40" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Columna Izquierda: Mensaje y Acciones */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-brand-tint text-brand-fg border border-border shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cartas digitales para locales gastronómicos</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-5xl font-normal text-text-primary tracking-tight leading-[1.15] sm:leading-[1.15]">
                Tu carta digital, con pedidos directo a tu WhatsApp. Sin comisiones.
              </h1>

              <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Tus clientes recorren el menú, eligen opciones y te envían el pedido ordenado y listo para preparar. Vos cobrás el 100% de tus ventas y cambiás precios desde el celular.
              </p>

              {/* Botones de acción */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 w-full max-w-md mx-auto lg:mx-0">
                <Link
                  href="/demo"
                  className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <span>Ver demo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-xl bg-surface hover:bg-surface-2 text-text-primary border border-border font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <MessageCircle className="w-4 h-4 text-success" />
                    <span>Hablemos por WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

            {/* Columna Derecha: Marco de Celular en CSS con la carta */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative">
                {/* Halo decorativo */}
                <div
                  className="absolute -inset-4 bg-gradient-to-tr from-brand/10 via-surface-2 to-transparent rounded-[44px] filter blur-xl -z-10"
                  aria-hidden="true"
                />

                {/* Marco de celular en CSS */}
                <div className="relative w-[280px] sm:w-[300px] rounded-[38px] p-3 bg-[#211B19] shadow-2xl shadow-black/20 border-4 border-[#3D332E]">
                  {/* Isla dinámica / bocina superior */}
                  <div className="absolute top-4 inset-x-0 mx-auto w-20 h-4 bg-[#211B19] rounded-full z-20 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#151110] mr-1.5" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3D332E]" />
                  </div>

                  {/* Pantalla interior */}
                  <div className="relative w-full aspect-[264/572] rounded-[28px] overflow-hidden bg-background">
                    <Image
                      src="/landing/carta.webp"
                      alt="Demostración de carta digital en celular"
                      width={264}
                      height={572}
                      priority
                      className="w-full h-full object-cover"
                      sizes="(max-width: 640px) 260px, 280px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Onda divisoria SVG hacia sección comparativa */}
      <div className="w-full overflow-hidden leading-none text-surface -mb-px" aria-hidden="true">
        <svg
          className="relative block w-full h-8 sm:h-12"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
        >
          <path fill="currentColor" d="M0,32 C360,60 1080,0 1440,32 L1440,60 L0,60 Z" />
        </svg>
      </div>

      {/* 3. Banda "Por qué conviene": Comparación sencilla */}
      <section className="bg-surface py-14 sm:py-20 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="font-serif text-2xl sm:text-4xl font-normal text-text-primary tracking-tight">
              Por qué te conviene tener tu propia carta
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-2 leading-relaxed">
              La diferencia entre depender de intermediarios o tomar el control directo de tu negocio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {/* Tarjeta Apps de Delivery */}
            <div className="bg-background border border-error-border/60 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <div className="w-8 h-8 rounded-lg bg-error-soft text-error flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-normal text-text-primary">
                    Apps de delivery tradicionales
                  </h3>
                  <span className="text-xs text-text-secondary">Comisiones y dependencia</span>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-text-secondary">
                <li className="flex items-start gap-2.5">
                  <span className="text-error font-bold text-base leading-none">✕</span>
                  <span>Comisión sobre cada plato vendido que reduce tu ganancia.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-error font-bold text-base leading-none">✕</span>
                  <span>El dinero tarda días o semanas en acreditarse en tu cuenta.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-error font-bold text-base leading-none">✕</span>
                  <span>No conocés los datos ni el teléfono de tus comensales habituales.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-error font-bold text-base leading-none">✕</span>
                  <span>Modificaciones de precios y platos lentas y sujetas a demoras.</span>
                </li>
              </ul>
            </div>

            {/* Tarjeta Carta Directa */}
            <div className="bg-surface border-2 border-brand rounded-2xl p-6 sm:p-7 shadow-md space-y-4 relative">
              <div className="absolute -top-3 right-6 bg-brand text-white text-[11px] font-semibold px-3 py-0.5 rounded-full shadow-xs">
                Tu propio canal
              </div>

              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <div className="w-8 h-8 rounded-lg bg-success-soft text-success flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-normal text-text-primary">
                    Carta Directa
                  </h3>
                  <span className="text-xs text-success font-medium">Abono fijo mensual</span>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-text-primary">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span>
                    <strong>Cero comisiones:</strong> cobrás el 100% del valor de cada plato.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span>
                    <strong>Cobro directo:</strong> tus clientes te abonan a vos en efectivo, transferencia o con tus medios habituales.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span>
                    <strong>El pedido llega ordenado a tu WhatsApp:</strong> con cantidades, sabores, dirección y total listo para confirmar.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span>
                    <strong>Control instantáneo:</strong> cambiás precios o marcás productos agotados desde tu propio celular.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Beneficios en grilla de 3 columnas */}
      <section className="py-14 sm:py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="font-serif text-2xl sm:text-4xl font-normal text-text-primary tracking-tight">
              Diseñado para el ritmo de tu cocina
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-2 leading-relaxed">
              Herramientas pensadas para que no pierdas tiempo ni cometas errores en el despacho.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Beneficio 1 */}
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand-tint text-brand-fg flex items-center justify-center">
                <CircleDollarSign className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-serif text-lg font-normal text-text-primary">
                Sin comisiones por venta
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                No pagás porcentajes sobre cada plato ni cargos variables según tus ventas. Lo que facturás en tu local te queda íntegro a vos.
              </p>
            </div>

            {/* Beneficio 2 */}
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-success-soft text-success flex items-center justify-center">
                <MessageCircle className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-serif text-lg font-normal text-text-primary">
                El pedido llega ordenado a tu WhatsApp
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Se terminaron los audios interminables y las dudas. El comensal confirma y a tu WhatsApp llega un texto estructurado con cada detalle.
              </p>
            </div>

            {/* Beneficio 3 */}
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-surface-2 text-brand-fg flex items-center justify-center">
                <Smartphone className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-serif text-lg font-normal text-text-primary">
                Cambiás precios y marcás agotados desde el celular
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                ¿Se terminó la masa o querés ajustar un precio? Entrás desde el teléfono a tu panel y en un segundo el cambio se refleja en la carta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Onda divisoria hacia Cómo Funciona */}
      <div className="w-full overflow-hidden leading-none text-surface -mb-px" aria-hidden="true">
        <svg
          className="relative block w-full h-8 sm:h-12"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
        >
          <path fill="currentColor" d="M0,0 C480,50 960,50 1440,0 L1440,60 L0,60 Z" />
        </svg>
      </div>

      {/* 5. "Cómo funciona" en 3 pasos (timeline horizontal en escritorio y vertical en móvil) */}
      <section className="bg-surface py-14 sm:py-20 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="font-serif text-2xl sm:text-4xl font-normal text-text-primary tracking-tight">
              Cómo funciona en 3 simples pasos
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-2 leading-relaxed">
              No tenés que configurar nada difícil; nosotros nos ocupamos de la puesta en marcha.
            </p>
          </div>

          {/* Timeline de 3 pasos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Línea horizontal en escritorio */}
            <div
              className="hidden md:block absolute top-7 left-1/6 right-1/6 h-0.5 bg-border -z-0"
              aria-hidden="true"
            />

            {/* Paso 1 */}
            <div className="relative text-center md:text-left flex flex-col items-center md:items-start space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-brand text-white flex items-center justify-center font-serif text-xl font-bold shadow-xs z-10">
                1
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-normal text-text-primary">
                Nos pasás tu menú
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Nos compartís tu lista de productos, precios actuales, fotos (si tenés) y opciones como salsas o tamaños.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="relative text-center md:text-left flex flex-col items-center md:items-start space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-brand text-white flex items-center justify-center font-serif text-xl font-bold shadow-xs z-10">
                2
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-normal text-text-primary">
                Lo dejamos funcionando
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Cargamos tu carta, adaptamos los colores a tu local, configuramos el costo de envío y lo conectamos a tu número de WhatsApp.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="relative text-center md:text-left flex flex-col items-center md:items-start space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-success-solid text-white flex items-center justify-center font-serif text-xl font-bold shadow-xs z-10">
                3
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-normal text-text-primary">
                Empezás a recibir pedidos
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Pegás el link en tu perfil de Instagram, en tus estados de WhatsApp o imprimís el código QR para las mesas y mostrador.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Vistazo al producto: celulares y ventana de escritorio */}
      <section className="py-14 sm:py-20 bg-background overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="font-serif text-2xl sm:text-4xl font-normal text-text-primary tracking-tight">
              Un vistazo a lo que ven tus clientes y tu equipo
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-2 leading-relaxed">
              Una experiencia clara para quien pide y un panel rápido para quien gestiona.
            </p>
          </div>

          <div className="space-y-12">
            {/* Ventana de escritorio simulada: Panel de Administración */}
            <div className="bg-surface rounded-2xl sm:rounded-3xl border border-border shadow-xl overflow-hidden max-w-4xl mx-auto">
              {/* Barra superior de ventana */}
              <div className="bg-surface-2 px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-error-border" />
                  <div className="w-3 h-3 rounded-full bg-warning-border" />
                  <div className="w-3 h-3 rounded-full bg-success-border" />
                  <span className="text-xs text-text-secondary ml-2 font-mono">
                    panel.tudominio.com/admin
                  </span>
                </div>
                <span className="text-xs text-text-secondary hidden sm:inline">
                  Panel de Administración
                </span>
              </div>

              {/* Captura de pantalla del Admin */}
              <div className="relative aspect-[668/440] sm:aspect-[668/400] w-full bg-text-primary/5">
                <Image
                  src="/landing/admin.webp"
                  alt="Panel de administración de Carta Directa"
                  width={668}
                  height={572}
                  loading="lazy"
                  className="w-full h-full object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 896px"
                />
              </div>
            </div>

            {/* Dos celulares lado a lado: Carta y Modal de Opciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto items-center">
              {/* Celular 1: Carta Pública */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold text-text-secondary mb-3">
                  1. Tu cliente recorre la carta
                </span>
                <div className="w-[260px] rounded-[34px] p-2.5 bg-[#211B19] shadow-xl border-3 border-[#3D332E]">
                  <div className="relative aspect-[264/572] rounded-[24px] overflow-hidden bg-background">
                    <Image
                      src="/landing/carta.webp"
                      alt="Carta digital vista en teléfono"
                      width={264}
                      height={572}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      sizes="260px"
                    />
                  </div>
                </div>
              </div>

              {/* Celular 2: Modal de Variantes y Opciones */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold text-text-secondary mb-3">
                  2. Elige variantes y agregados
                </span>
                <div className="w-[260px] rounded-[34px] p-2.5 bg-[#211B19] shadow-xl border-3 border-[#3D332E]">
                  <div className="relative aspect-[400/700] rounded-[24px] overflow-hidden bg-background">
                    <Image
                      src="/landing/modal.webp"
                      alt="Modal de opciones y adicionales"
                      width={400}
                      height={700}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      sizes="260px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Onda divisoria hacia Preguntas Frecuentes */}
      <div className="w-full overflow-hidden leading-none text-surface -mb-px" aria-hidden="true">
        <svg
          className="relative block w-full h-8 sm:h-12"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
        >
          <path fill="currentColor" d="M0,45 C480,10 960,60 1440,20 L1440,60 L0,60 Z" />
        </svg>
      </div>

      {/* 7. Preguntas Frecuentes con <details>/<summary> nativos */}
      <section className="bg-surface py-14 sm:py-20 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
            <h2 className="font-serif text-2xl sm:text-4xl font-normal text-text-primary tracking-tight">
              Preguntas frecuentes
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-2 leading-relaxed">
              Respuestas claras a las dudas más comunes de los locales.
            </p>
          </div>

          <div className="space-y-3.5">
            {/* FAQ 1 */}
            <details className="group bg-background border border-border rounded-2xl p-4 sm:p-5 transition-all">
              <summary className="flex items-center justify-between font-serif text-base sm:text-lg font-normal text-text-primary cursor-pointer list-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg">
                <span>¿Necesito instalar algo?</span>
                <ChevronDown className="w-5 h-5 text-text-secondary group-open:rotate-180 transition-transform shrink-0 ml-2" />
              </summary>
              <p className="text-xs sm:text-sm text-text-secondary mt-3 leading-relaxed pt-2 border-t border-border/60">
                No. Ni vos ni tus clientes necesitan descargar ninguna aplicación. La carta abre al instante en el navegador desde cualquier celular o computadora con un simple enlace.
              </p>
            </details>

            {/* FAQ 2 */}
            <details className="group bg-background border border-border rounded-2xl p-4 sm:p-5 transition-all">
              <summary className="flex items-center justify-between font-serif text-base sm:text-lg font-normal text-text-primary cursor-pointer list-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg">
                <span>¿Cómo recibo los pedidos?</span>
                <ChevronDown className="w-5 h-5 text-text-secondary group-open:rotate-180 transition-transform shrink-0 ml-2" />
              </summary>
              <p className="text-xs sm:text-sm text-text-secondary mt-3 leading-relaxed pt-2 border-t border-border/60">
                El cliente arma su pedido en la carta y, al confirmar, se le abre automáticamente una conversación en tu WhatsApp con el mensaje ya escrito y ordenado: ítems, variantes, aclaraciones, modalidad de entrega y total calculado.
              </p>
            </details>

            {/* FAQ 3 */}
            <details className="group bg-background border border-border rounded-2xl p-4 sm:p-5 transition-all">
              <summary className="flex items-center justify-between font-serif text-base sm:text-lg font-normal text-text-primary cursor-pointer list-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg">
                <span>¿Puedo cambiar precios y marcar agotados yo?</span>
                <ChevronDown className="w-5 h-5 text-text-secondary group-open:rotate-180 transition-transform shrink-0 ml-2" />
              </summary>
              <p className="text-xs sm:text-sm text-text-secondary mt-3 leading-relaxed pt-2 border-t border-border/60">
                Sí. Tenés tu propio panel de administración protegido para entrar desde tu teléfono, cambiar cualquier precio en un segundo y marcar platos como agotados cuando se te termine el stock.
              </p>
            </details>

            {/* FAQ 4 */}
            <details className="group bg-background border border-border rounded-2xl p-4 sm:p-5 transition-all">
              <summary className="flex items-center justify-between font-serif text-base sm:text-lg font-normal text-text-primary cursor-pointer list-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg">
                <span>¿Y si no tengo fotos de mis platos?</span>
                <ChevronDown className="w-5 h-5 text-text-secondary group-open:rotate-180 transition-transform shrink-0 ml-2" />
              </summary>
              <p className="text-xs sm:text-sm text-text-secondary mt-3 leading-relaxed pt-2 border-t border-border/60">
                No hay problema. La carta se adapta con elegancia para mostrar los platos solo con nombre, descripción y precio, o con un recuadro sobrio. Queda impecable con o sin fotos.
              </p>
            </details>

            {/* FAQ 5 */}
            <details className="group bg-background border border-border rounded-2xl p-4 sm:p-5 transition-all">
              <summary className="flex items-center justify-between font-serif text-base sm:text-lg font-normal text-text-primary cursor-pointer list-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg">
                <span>¿Cuánto cuesta?</span>
                <ChevronDown className="w-5 h-5 text-text-secondary group-open:rotate-180 transition-transform shrink-0 ml-2" />
              </summary>
              <p className="text-xs sm:text-sm text-text-secondary mt-3 leading-relaxed pt-2 border-t border-border/60">
                Consultanos, depende del tamaño de tu carta.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* 8. Cierre con fondo bordó #78232F y Footer Simple */}
      <section className="bg-brand text-white py-16 sm:py-24 relative overflow-hidden">
        {/* Adorno sutil */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center"
          aria-hidden="true"
        >
          <UtensilsCrossed className="w-[500px] h-[500px]" />
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
          <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-white leading-tight">
            Empezá a recibir pedidos en tu WhatsApp sin comisiones
          </h2>

          <p className="text-sm sm:text-base text-white/80 max-w-lg mx-auto leading-relaxed">
            Sumá tu carta digital hoy y recuperá el control directo de tus ventas.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-xl bg-white text-brand hover:bg-white/90 font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <MessageCircle className="w-4 h-4 text-success" />
                <span>Hablemos por WhatsApp</span>
              </a>
            ) : (
              <Link
                href="/demo"
                className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-xl bg-white text-brand hover:bg-white/90 font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span>Ver carta demo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              href="/demo"
              className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>Probar la carta demo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Simple */}
      <footer className="bg-sidebar text-white/70 py-8 border-t border-sidebar-border text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <span>Carta Directa • Tu carta digital con pedidos a WhatsApp</span>

          <div className="flex items-center gap-6">
            <Link
              href="/demo"
              className="hover:text-white transition-colors underline underline-offset-4"
            >
              Carta demo
            </Link>
            <Link
              href="/admin/login"
              className="hover:text-white transition-colors underline underline-offset-4"
            >
              Acceso para locales
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
