"use client";

import { useState, useId } from "react";
import Image from "next/image";
import { Drawer } from "vaul";
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

  const [deliveryType, setDeliveryType] = useState<DeliveryType>("delivery");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [generalNotes, setGeneralNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<SuccessOrderData | null>(null);

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

  const handleClose = () => {
    setSuccessOrder(null);
    setSubmitError(null);
    onClose();
  };

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

      try {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      } catch (e) {
        console.warn("No se pudo abrir WhatsApp automáticamente:", e);
      }

      onClearCart?.();

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
        "Error de conexión con el servidor. Por favor, verificá tu conexión e intentá nuevamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 max-h-[92vh] sm:max-h-[88vh] bg-white rounded-t-3xl z-50 flex flex-col focus:outline-none max-w-xl mx-auto shadow-2xl overflow-hidden border-t border-zinc-200">
          {/* Manija de arrastre accesible para el bottom-sheet */}
          <div className="w-12 h-1.5 bg-zinc-300 rounded-full mx-auto my-3 shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200">
            <div>
              <Drawer.Title className="text-base sm:text-lg font-bold text-zinc-900">
                {successOrder ? "¡Pedido Confirmado!" : "Confirmar Pedido"}
              </Drawer.Title>
              <Drawer.Description className="text-xs text-zinc-500">
                {store.name}
              </Drawer.Description>
            </div>
            <button
              onClick={handleClose}
              type="button"
              aria-label="Cerrar checkout"
              className="min-h-[44px] min-w-[44px] rounded-full text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Pantalla de éxito */}
          {successOrder ? (
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700 tabular-nums">
                  Pedido #{successOrder.orderId}
                </span>
                <h3 className="mt-2 text-xl font-bold text-zinc-900">
                  ¡Pedido recibido en el local!
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm leading-relaxed max-w-md">
                <p className="font-semibold">
                  ¡Pedido enviado a WhatsApp! Aguardá que el local confirme tu pedido para coordinar la demora.
                </p>
                <p className="mt-1 text-emerald-700 text-xs">
                  Tu orden quedó registrada con seguridad. La cocina y la entrega se coordinan directamente por WhatsApp.
                </p>
              </div>

              <div className="w-full max-w-md p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs text-left">
                <div className="flex justify-between text-zinc-600">
                  <span>Modalidad:</span>
                  <span className="font-semibold text-zinc-900">
                    {successOrder.deliveryType === "delivery"
                      ? "Envío a domicilio"
                      : "Retiro en local"}
                  </span>
                </div>
                {successOrder.deliveryType === "delivery" &&
                  successOrder.deliveryAddress && (
                    <div className="flex justify-between text-zinc-600">
                      <span>Dirección:</span>
                      <span className="font-semibold text-zinc-900 text-right truncate max-w-[200px]">
                        {successOrder.deliveryAddress}
                      </span>
                    </div>
                  )}
                <div className="pt-2 border-t border-zinc-200 flex justify-between font-bold text-sm text-zinc-900">
                  <span>Total:</span>
                  <span className="tabular-nums text-zinc-900">
                    {formatPrice(successOrder.total)}
                  </span>
                </div>
              </div>

              <div className="w-full max-w-md space-y-2.5 pt-2">
                <a
                  href={successOrder.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[48px] px-4 rounded-xl font-bold text-sm text-white bg-[#25D366] hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Abrir WhatsApp del local</span>
                </a>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full min-h-[44px] px-4 rounded-xl font-medium text-xs text-zinc-600 hover:bg-zinc-100 transition-colors text-center"
                >
                  Volver a la carta
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Formulario de Checkout */}
              <form
                id="checkout-form"
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-5 space-y-6"
              >
                {submitError && (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <div className="flex-1 text-left">
                      <p className="font-semibold">No se pudo procesar tu pedido</p>
                      <p className="opacity-90">{submitError}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSubmitError(null)}
                      className="text-rose-500 hover:text-rose-700"
                      aria-label="Cerrar alerta"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* 1. Lista de ítems */}
                <section className="space-y-3">
                  <div className="flex items-baseline justify-between border-b border-zinc-200 pb-1.5">
                    <h3 className="font-bold text-sm text-zinc-900">
                      Tu Pedido ({items.length}{" "}
                      {items.length === 1 ? "ítem" : "ítems"})
                    </h3>
                    <span className="text-xs font-semibold text-zinc-600 tabular-nums">
                      Subtotal: {formatPrice(subtotal)}
                    </span>
                  </div>

                  {items.length === 0 ? (
                    <div className="text-center py-6 rounded-xl bg-zinc-50 border border-zinc-200">
                      <p className="text-xs text-zinc-500">
                        Tu carrito está vacío.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-200 max-h-56 overflow-y-auto pr-1">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="py-3 flex items-start justify-between gap-3"
                        >
                          {item.image_url ? (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                              <Image
                                src={item.image_url}
                                alt={item.product_name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          ) : null}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                              <h4 className="font-semibold text-xs sm:text-sm text-zinc-900 truncate">
                                {item.product_name}
                              </h4>
                              <span className="font-semibold text-xs sm:text-sm text-zinc-900 tabular-nums">
                                {formatPrice(item.subtotal)}
                              </span>
                            </div>

                            {item.selected_options.length > 0 && (
                              <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
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

                            {item.notes && (
                              <p className="text-[11px] italic text-zinc-400 mt-0.5">
                                &quot;{item.notes}&quot;
                              </p>
                            )}

                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center gap-1.5 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateQuantity(item.id, item.quantity - 1)
                                  }
                                  aria-label="Restar una unidad"
                                  className="w-7 h-7 rounded-md bg-white text-zinc-700 flex items-center justify-center transition-colors hover:bg-zinc-50 active:bg-zinc-200"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>

                                <span className="w-6 text-center text-xs font-bold text-zinc-900 tabular-nums">
                                  {item.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateQuantity(item.id, item.quantity + 1)
                                  }
                                  aria-label="Sumar una unidad"
                                  className="w-7 h-7 rounded-md bg-white text-zinc-700 flex items-center justify-center transition-colors hover:bg-zinc-50 active:bg-zinc-200"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => onRemoveItem(item.id)}
                                aria-label={`Eliminar ${item.product_name} del carrito`}
                                className="min-h-[36px] min-w-[36px] flex items-center justify-center text-zinc-400 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
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
                  <h3 className="font-bold text-sm text-zinc-900">
                    Método de entrega
                  </h3>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDeliveryType("delivery")}
                      className={`min-h-[48px] flex flex-col items-center justify-center p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                        deliveryType === "delivery"
                          ? "bg-zinc-50 border-zinc-900 text-zinc-900"
                          : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
                      }`}
                    >
                      <Bike className="w-4 h-4 mb-1 text-zinc-700" />
                      <span>Envío a domicilio</span>
                      <span className="text-[11px] font-normal text-zinc-500 tabular-nums mt-0.5">
                        {store.delivery_cost && store.delivery_cost > 0
                          ? formatPrice(store.delivery_cost)
                          : "A convenir"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType("take_away")}
                      className={`min-h-[48px] flex flex-col items-center justify-center p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                        deliveryType === "take_away"
                          ? "bg-zinc-50 border-zinc-900 text-zinc-900"
                          : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
                      }`}
                    >
                      <StoreIcon className="w-4 h-4 mb-1 text-zinc-700" />
                      <span>Retiro en local</span>
                      <span className="text-[11px] font-normal text-zinc-500 mt-0.5">
                        Sin costo
                      </span>
                    </button>
                  </div>
                </section>

                {/* 3. Datos de contacto */}
                <section className="space-y-3">
                  <h3 className="font-bold text-sm text-zinc-900">
                    Datos de contacto
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor={nameInputId}
                        className="block text-xs font-medium text-zinc-700 mb-1"
                      >
                        Nombre y Apellido <span className="text-[var(--store-primary,#D62828)]">*</span>
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
                          className={`w-full text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all ${
                            errors.customerName
                              ? "border-rose-400"
                              : "border-zinc-200"
                          }`}
                        />
                      </div>
                      {errors.customerName && (
                        <p className="text-[11px] text-rose-600 mt-1">
                          {errors.customerName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor={phoneInputId}
                        className="block text-xs font-medium text-zinc-700 mb-1"
                      >
                        WhatsApp / Teléfono <span className="text-[var(--store-primary,#D62828)]">*</span>
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
                          className={`w-full text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all ${
                            errors.customerPhone
                              ? "border-rose-400"
                              : "border-zinc-200"
                          }`}
                        />
                      </div>
                      {errors.customerPhone && (
                        <p className="text-[11px] text-rose-600 mt-1">
                          {errors.customerPhone}
                        </p>
                      )}
                    </div>

                    {deliveryType === "delivery" && (
                      <div>
                        <label
                          htmlFor={addressInputId}
                          className="block text-xs font-medium text-zinc-700 mb-1"
                        >
                          Dirección de entrega{" "}
                          <span className="text-[var(--store-primary,#D62828)]">*</span>
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
                            className={`w-full text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all ${
                              errors.deliveryAddress
                                ? "border-rose-400"
                                : "border-zinc-200"
                            }`}
                          />
                        </div>
                        {errors.deliveryAddress && (
                          <p className="text-[11px] text-rose-600 mt-1">
                            {errors.deliveryAddress}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </section>

                {/* 4. Medio de pago */}
                <section className="space-y-2">
                  <h3 className="font-bold text-sm text-zinc-900">
                    Forma de pago
                  </h3>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash")}
                      className={`min-h-[44px] flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                        paymentMethod === "cash"
                          ? "bg-zinc-50 border-zinc-900 text-zinc-900"
                          : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
                      }`}
                    >
                      <Banknote className="w-4 h-4 mb-1 text-emerald-600" />
                      <span>Efectivo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("transfer")}
                      className={`min-h-[44px] flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                        paymentMethod === "transfer"
                          ? "bg-zinc-50 border-zinc-900 text-zinc-900"
                          : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
                      }`}
                    >
                      <Landmark className="w-4 h-4 mb-1 text-sky-600" />
                      <span>Transferencia</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("mercadopago")}
                      className={`min-h-[44px] flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                        paymentMethod === "mercadopago"
                          ? "bg-zinc-50 border-zinc-900 text-zinc-900"
                          : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
                      }`}
                    >
                      <CreditCard className="w-4 h-4 mb-1 text-indigo-600" />
                      <span>Mercado Pago</span>
                    </button>
                  </div>
                </section>

                {/* 5. Aclaraciones */}
                <section className="space-y-1.5">
                  <label
                    htmlFor={notesInputId}
                    className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-zinc-900"
                  >
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Aclaraciones para el pedido</span>
                  </label>
                  <textarea
                    id={notesInputId}
                    rows={2}
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    placeholder="Ej: Timbre 2B, abonaré con cambio, etc."
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all resize-none"
                  />
                </section>

                {/* 6. Desglose de importes */}
                <section className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1.5 text-xs sm:text-sm">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal productos</span>
                    <span className="tabular-nums font-medium text-zinc-900">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-zinc-600">
                    <span>
                      Costo de entrega (
                      {deliveryType === "delivery" ? "Domicilio" : "Retiro"})
                    </span>
                    <span className="tabular-nums font-medium text-zinc-900">
                      {deliveryType === "delivery"
                        ? deliveryFee > 0
                          ? formatPrice(deliveryFee)
                          : "A convenir"
                        : "Gratis"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-zinc-200 flex justify-between font-bold text-sm sm:text-base text-zinc-900">
                    <span>Total estimado</span>
                    <span className="tabular-nums">
                      {formatPrice(total)}
                    </span>
                  </div>
                </section>

                {(errors.minOrder || errors.items) && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errors.minOrder || errors.items}</span>
                  </div>
                )}
              </form>

              {/* Footer fijo con botón principal */}
              <div className="p-4 border-t border-zinc-200 bg-white">
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting || isBelowMinOrder || items.length === 0}
                  className="w-full min-h-[48px] py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-[var(--store-primary,#D62828)] hover:opacity-95 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando pedido a cocina...
                      </span>
                      <span className="text-xs opacity-80">Aguardá un momento</span>
                    </>
                  ) : (
                    <>
                      <span>Confirmar Pedido</span>
                      <span className="tabular-nums">{formatPrice(total)}</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
