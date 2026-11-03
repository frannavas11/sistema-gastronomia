"use client";

import { useState, useId } from "react";
import Image from "next/image";
import {
  X,
  Minus,
  Plus,
  Trash2,
  Bike,
  Store as StoreIcon,
  Banknote,
  Landmark,
  CreditCard,
  AlertCircle,
  FileText,
  User,
  Phone,
  MapPin,
  Loader2,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import type {
  Store,
  CartItem,
  DeliveryType,
  PaymentMethod,
  CheckoutPayload,
} from "@/types/store";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

interface CheckoutModalProps {
  store: Store;
  items: CartItem[];
  subtotal: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onConfirmOrder?: (payload: CheckoutPayload) => void;
  onClearCart?: () => void;
}

interface SuccessOrderData {
  orderId: number;
  whatsappUrl: string;
  total: number;
  deliveryType: DeliveryType;
  deliveryAddress: string;
}

export function CheckoutModal({
  store,
  items,
  subtotal,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onConfirmOrder,
  onClearCart,
}: CheckoutModalProps) {
  const nameInputId = useId();
  const phoneInputId = useId();
  const addressInputId = useId();
  const notesInputId = useId();

  // Estados del formulario de checkout
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("delivery");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [generalNotes, setGeneralNotes] = useState("");

  // Estado de validación, envío y éxito
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<SuccessOrderData | null>(null);

  if (!isOpen) return null;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const deliveryFee =
    deliveryType === "delivery" ? store.delivery_cost ?? 0 : 0;
  const total = subtotal + deliveryFee;

  const isBelowMinOrder =
    Boolean(store.min_order_amount && store.min_order_amount > 0) &&
    subtotal < (store.min_order_amount ?? 0);

  // Cerrar y limpiar estados de confirmación
  const handleClose = () => {
    setSuccessOrder(null);
    setSubmitError(null);
    onClose();
  };

  // Validación del formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (store.is_open === false) {
      setSubmitError("El local se encuentra cerrado y no recibe pedidos en este momento.");
      return false;
    }

    if (!customerName.trim()) {
      newErrors.customerName = "Por favor ingresá tu nombre completo.";
    } else if (customerName.trim().length < 3) {
      newErrors.customerName = "El nombre debe tener al menos 3 caracteres.";
    }

    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (!customerPhone.trim()) {
      newErrors.customerPhone = "Por favor ingresá tu número de teléfono.";
    } else if (cleanPhone.length < 6) {
      newErrors.customerPhone = "Ingresá un número de teléfono válido.";
    }

    if (deliveryType === "delivery" && !deliveryAddress.trim()) {
      newErrors.deliveryAddress =
        "Por favor ingresá tu dirección para el envío.";
    }

    if (isBelowMinOrder) {
      newErrors.minOrder = `El monto mínimo de compra es de ${formatPrice(
        store.min_order_amount ?? 0,
      )}.`;
    }

    if (items.length === 0) {
      newErrors.items = "Tu carrito está vacío.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Invocar Route Handler con seguridad estricta y recálculo en servidor
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          store_id: store.id,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          delivery_type: deliveryType,
          delivery_address:
            deliveryType === "delivery" ? deliveryAddress.trim() : null,
          payment_method: paymentMethod,
          notes: generalNotes.trim() || null,
          items: items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            selected_options: item.selected_options.map((opt) => ({
              id: opt.id,
              group_id: opt.group_id,
            })),
            notes: item.notes || null,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg =
          errorData?.error ||
          "No pudimos registrar tu pedido. Por favor, verificá tus datos e intentá de nuevo.";
        setSubmitError(errorMsg);
        setIsSubmitting(false);
        return;
      }

      const result: {
        success: boolean;
        orderId: number;
        subtotal: number;
        deliveryFee: number;
        total: number;
      } = await response.json();

      const finalSubtotal = result.subtotal ?? subtotal;
      const finalDeliveryFee = result.deliveryFee ?? deliveryFee;
      const finalTotal = result.total ?? total;

      // 2. Generar el enlace estructurado de WhatsApp
      const whatsappUrl = buildWhatsAppUrl({
        orderId: result.orderId,
        store: {
          name: store.name,
          phone_whatsapp: store.phone_whatsapp,
        },
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        delivery_type: deliveryType,
        delivery_address:
          deliveryType === "delivery" ? deliveryAddress.trim() : null,
        payment_method: paymentMethod,
        notes: generalNotes.trim() || null,
        items,
        subtotal: finalSubtotal,
        delivery_fee: finalDeliveryFee,
        total: finalTotal,
      });

      // 3. Abrir WhatsApp en una pestaña nueva
      try {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      } catch (e) {
        // En caso de que el navegador bloquee popups, la pantalla de confirmación contiene el enlace directo
        console.warn("No se pudo abrir la ventana de WhatsApp automáticamente:", e);
      }

      // 4. Limpiar el carrito en Zustand
      onClearCart?.();

      // 5. Notificar confirmación opcional a componentes superiores
      if (onConfirmOrder) {
        onConfirmOrder({
          store_id: store.id,
          store_slug: store.slug,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          delivery_type: deliveryType,
          delivery_address:
            deliveryType === "delivery" ? deliveryAddress.trim() : "",
          payment_method: paymentMethod,
          notes: generalNotes.trim(),
          items,
          subtotal: finalSubtotal,
          delivery_fee: finalDeliveryFee,
          total: finalTotal,
        });
      }

      // 6. Activar la pantalla de éxito
      setSuccessOrder({
        orderId: result.orderId,
        whatsappUrl,
        total: finalTotal,
        deliveryType,
        deliveryAddress: deliveryAddress.trim(),
      });
    } catch (err) {
      console.error("Error de red al registrar el pedido:", err);
      setSubmitError(
        "Error de conexión con el servidor. Por favor, verificá tu conexión a internet e intentá nuevamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal / Bottom Sheet */}
      <div className="relative w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 z-10 border border-zinc-200 dark:border-zinc-800">
        {/* Barra superior en mobile */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2
              id="checkout-modal-title"
              className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100"
            >
              {successOrder ? "¡Pedido Confirmado!" : "Confirmar Pedido"}
            </h2>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {store.name}
            </span>
          </div>
          <button
            onClick={handleClose}
            type="button"
            aria-label="Cerrar checkout"
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Si el pedido fue exitoso: Pantalla limpia de confirmación */}
        {successOrder ? (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in duration-300">
            {/* Ícono de confirmación */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>
            </div>

            {/* Número de pedido */}
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Pedido #{successOrder.orderId}
              </span>
              <h3 className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                ¡Pedido recibido en el local!
              </h3>
            </div>

            {/* Mensaje de confirmación requerido por arquitectura */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm leading-relaxed max-w-md">
              <p className="font-bold">
                ¡Pedido enviado a WhatsApp! Aguardá que el local confirme tu pedido para coordinar la demora.
              </p>
              <p className="mt-1 text-emerald-700/80 dark:text-emerald-400/80 text-[11px] sm:text-xs">
                Tu orden quedó registrada con seguridad en la base de datos.
                La cocina y los tiempos de entrega se coordinan directamente a través de WhatsApp.
              </p>
            </div>

            {/* Resumen del pedido confirmado */}
            <div className="w-full max-w-md p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-2 text-xs text-left">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Modalidad:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {successOrder.deliveryType === "delivery"
                    ? "Envío a domicilio"
                    : "Retiro en local"}
                </span>
              </div>
              {successOrder.deliveryType === "delivery" &&
                successOrder.deliveryAddress && (
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Dirección:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-right truncate max-w-[200px]">
                      {successOrder.deliveryAddress}
                    </span>
                  </div>
                )}
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex justify-between font-bold text-sm text-zinc-900 dark:text-zinc-100">
                <span>Total:</span>
                <span className="text-[var(--store-primary,#e11d48)]">
                  {formatPrice(successOrder.total)}
                </span>
              </div>
            </div>

            {/* Acciones principales */}
            <div className="w-full max-w-md space-y-2.5 pt-2">
              <a
                href={successOrder.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Abrir WhatsApp del local</span>
              </a>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-center"
              >
                Volver a la carta
              </button>
            </div>
          </div>
        ) : (
          /* Formulario principal de checkout */
          <>
            <form
              id="checkout-form"
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-5 space-y-6"
            >
              {/* Alerta de error de conexión / API si ocurre */}
              {submitError && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-left">
                    <p className="font-semibold">No se pudo procesar tu pedido</p>
                    <p className="opacity-90">{submitError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmitError(null)}
                    className="text-rose-400 hover:text-rose-600 transition-colors"
                    aria-label="Cerrar alerta"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* 1. Desglose de ítems del pedido */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Tu Pedido ({items.length}{" "}
                    {items.length === 1 ? "ítem" : "ítems"})
                  </h3>
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    Subtotal: {formatPrice(subtotal)}
                  </span>
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-8 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800">
                    <p className="text-sm text-zinc-500">
                      No tenés productos en tu carrito.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800"
                      >
                        {/* Imagen opcional */}
                        {item.image_url ? (
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-700 flex-shrink-0">
                            <Image
                              src={item.image_url}
                              alt={item.product_name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        ) : null}

                        {/* Detalle del ítem */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <h4 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                              {item.product_name}
                            </h4>
                            <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                              {formatPrice(item.subtotal)}
                            </span>
                          </div>

                          {/* Modificadores seleccionados */}
                          {item.selected_options.length > 0 && (
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                              {item.selected_options
                                .map(
                                  (opt) =>
                                    `${opt.name}${
                                      opt.price > 0
                                        ? ` (+${formatPrice(opt.price)})`
                                        : ""
                                    }`,
                                )
                                .join(", ")}
                            </p>
                          )}

                          {/* Aclaraciones particulares */}
                          {item.notes && (
                            <p className="text-[11px] italic text-zinc-400 dark:text-zinc-500 mt-0.5">
                              &quot;{item.notes}&quot;
                            </p>
                          )}

                          {/* Controles de cantidad dentro del carrito */}
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateQuantity(item.id, item.quantity - 1)
                                }
                                aria-label="Restar una unidad"
                                className="w-6 h-6 rounded-lg bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center active:scale-90 transition-transform shadow-xs"
                              >
                                <Minus className="w-3 h-3" />
                              </button>

                              <span className="w-5 text-center text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateQuantity(item.id, item.quantity + 1)
                                }
                                aria-label="Sumar una unidad"
                                className="w-6 h-6 rounded-lg bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center active:scale-90 transition-transform shadow-xs"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.id)}
                              aria-label={`Eliminar ${item.product_name} del carrito`}
                              className="text-zinc-400 hover:text-rose-500 p-1 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* 2. Método de entrega */}
              <section className="space-y-2">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Método de entrega
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeliveryType("delivery")}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs sm:text-sm font-semibold transition-all ${
                      deliveryType === "delivery"
                        ? "bg-white dark:bg-zinc-800 border-[var(--store-primary,#e11d48)] text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
                    }`}
                  >
                    <Bike
                      className={`w-5 h-5 mb-1 ${
                        deliveryType === "delivery"
                          ? "text-[var(--store-primary,#e11d48)]"
                          : "text-zinc-400"
                      }`}
                    />
                    <span>Envío a domicilio</span>
                    <span className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {store.delivery_cost && store.delivery_cost > 0
                        ? formatPrice(store.delivery_cost)
                        : "A convenir"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType("take_away")}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs sm:text-sm font-semibold transition-all ${
                      deliveryType === "take_away"
                        ? "bg-white dark:bg-zinc-800 border-[var(--store-primary,#e11d48)] text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
                    }`}
                  >
                    <StoreIcon
                      className={`w-5 h-5 mb-1 ${
                        deliveryType === "take_away"
                          ? "text-[var(--store-primary,#e11d48)]"
                          : "text-zinc-400"
                      }`}
                    />
                    <span>Retiro en local</span>
                    <span className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Sin cargo
                    </span>
                  </button>
                </div>
              </section>

              {/* 3. Datos del cliente */}
              <section className="space-y-3">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Datos de contacto
                </h3>

                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor={nameInputId}
                      className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                    >
                      Nombre y Apellido <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        id={nameInputId}
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ej: Juan Pérez"
                        className={`w-full text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--store-primary,#e11d48)] transition-all ${
                          errors.customerName
                            ? "border-rose-500"
                            : "border-zinc-200 dark:border-zinc-800"
                        }`}
                      />
                    </div>
                    {errors.customerName && (
                      <p className="text-[11px] text-rose-500 mt-1">
                        {errors.customerName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor={phoneInputId}
                      className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                    >
                      WhatsApp / Teléfono <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        id={phoneInputId}
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Ej: 11 1234 5678"
                        className={`w-full text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--store-primary,#e11d48)] transition-all ${
                          errors.customerPhone
                            ? "border-rose-500"
                            : "border-zinc-200 dark:border-zinc-800"
                        }`}
                      />
                    </div>
                    {errors.customerPhone && (
                      <p className="text-[11px] text-rose-500 mt-1">
                        {errors.customerPhone}
                      </p>
                    )}
                  </div>

                  {deliveryType === "delivery" && (
                    <div>
                      <label
                        htmlFor={addressInputId}
                        className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                      >
                        Dirección de entrega{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                          id={addressInputId}
                          type="text"
                          required
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Calle, número, piso/depto..."
                          className={`w-full text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--store-primary,#e11d48)] transition-all ${
                            errors.deliveryAddress
                              ? "border-rose-500"
                              : "border-zinc-200 dark:border-zinc-800"
                          }`}
                        />
                      </div>
                      {errors.deliveryAddress && (
                        <p className="text-[11px] text-rose-500 mt-1">
                          {errors.deliveryAddress}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* 4. Medio de pago */}
              <section className="space-y-2">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Forma de pago
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      paymentMethod === "cash"
                        ? "bg-white dark:bg-zinc-800 border-[var(--store-primary,#e11d48)] text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
                    }`}
                  >
                    <Banknote className="w-4 h-4 mb-1 text-emerald-500" />
                    <span>Efectivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("transfer")}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      paymentMethod === "transfer"
                        ? "bg-white dark:bg-zinc-800 border-[var(--store-primary,#e11d48)] text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
                    }`}
                  >
                    <Landmark className="w-4 h-4 mb-1 text-sky-500" />
                    <span>Transferencia</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("mercadopago")}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      paymentMethod === "mercadopago"
                        ? "bg-white dark:bg-zinc-800 border-[var(--store-primary,#e11d48)] text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mb-1 text-blue-500" />
                    <span>Mercado Pago</span>
                  </button>
                </div>
              </section>

              {/* 5. Aclaraciones generales para el pedido */}
              <section className="space-y-1.5">
                <label
                  htmlFor={notesInputId}
                  className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100"
                >
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Aclaraciones para el pedido</span>
                </label>
                <textarea
                  id={notesInputId}
                  rows={2}
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Ej: Timbre 2B, abonaré con billete de $10.000, etc..."
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--store-primary,#e11d48)] transition-all resize-none"
                />
              </section>

              {/* 6. Desglose final de importes */}
              <section className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal productos</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>
                    Costo de entrega (
                    {deliveryType === "delivery" ? "Domicilio" : "Retiro"})
                  </span>
                  <span>
                    {deliveryType === "delivery"
                      ? deliveryFee > 0
                        ? formatPrice(deliveryFee)
                        : "A convenir"
                      : "Gratis"}
                  </span>
                </div>

                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex justify-between font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                  <span>Total estimado</span>
                  <span className="text-[var(--store-primary,#e11d48)]">
                    {formatPrice(total)}
                  </span>
                </div>
              </section>

              {/* Alertas de error generales de validación */}
              {(errors.minOrder || errors.items) && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errors.minOrder || errors.items}</span>
                </div>
              )}
            </form>

            {/* Footer fijo con botón principal de confirmación */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting || isBelowMinOrder || items.length === 0}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-[var(--store-primary,#e11d48)] hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-between"
              >
                {isSubmitting ? (
                  <>
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando pedido a cocina...
                    </span>
                    <span className="text-xs opacity-75">Aguardá un momento</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar Pedido</span>
                    <span>{formatPrice(total)}</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
