"use client";

import { useState, useId } from "react";
import Image from "next/image";
import { Drawer } from "vaul";
import { motion } from "motion/react";
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
  UtensilsCrossed,
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
    deliveryType === "delivery" ? store.delivery_cost || 0 : 0;
  const total = subtotal + deliveryFee;

  const minOrder = store.min_order_amount || 0;
  const isBelowMinOrder = minOrder > 0 && subtotal < minOrder;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerName.trim()) {
      newErrors.customerName = "Por favor ingresá tu nombre y apellido.";
    }

    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (!customerPhone.trim()) {
      newErrors.customerPhone = "Por favor ingresá un número de teléfono.";
    } else if (cleanPhone.length < 8) {
      newErrors.customerPhone = "Ingresá un número de teléfono válido (mín. 8 dígitos).";
    }

    if (deliveryType === "delivery" && !deliveryAddress.trim()) {
      newErrors.deliveryAddress = "Por favor ingresá la dirección de entrega.";
    }

    if (isBelowMinOrder) {
      newErrors.minOrder = `El pedido mínimo para este local es de ${formatPrice(minOrder)}.`;
    }

    if (items.length === 0) {
      newErrors.items = "Tu carrito está vacío.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    if (successOrder) {
      setSuccessOrder(null);
      onClearCart?.();
    }
    setSubmitError(null);
    setErrors({});
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const apiPayload = {
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
        notes: item.notes || null,
        selected_options: item.selected_options.map((opt) => ({
          id: opt.id,
          group_id: opt.group_id,
        })),
      })),
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            "Ocurrió un error al procesar tu pedido. Por favor, intentá nuevamente.",
        );
      }

      const finalTotal = result.order?.total_amount ?? total;
      const finalSubtotal = result.order?.subtotal_amount ?? subtotal;
      const finalDeliveryFee = result.order?.delivery_fee ?? deliveryFee;

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

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");

      if (onConfirmOrder) {
        onConfirmOrder({
          store_id: store.id,
          store_slug: store.slug,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          delivery_type: deliveryType,
          delivery_address: deliveryAddress.trim(),
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
        <Drawer.Overlay className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 transition-opacity" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 max-h-[92vh] sm:max-h-[88vh] bg-[#FFFCF8] rounded-t-3xl z-50 flex flex-col focus:outline-none max-w-xl mx-auto shadow-2xl overflow-hidden border-t border-[#E9DAD2]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex flex-col h-full max-h-[92vh] sm:max-h-[88vh] overflow-hidden"
          >
            {/* Manija de arrastre del bottom-sheet */}
            <div className="w-12 h-1.5 bg-[#E9DAD2] rounded-full mx-auto my-3 shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#E9DAD2]">
            <div>
              <Drawer.Title className="font-serif text-lg sm:text-xl font-normal text-[#211B19]">
                {successOrder ? "Pedido Registrado" : "Tu Pedido"}
              </Drawer.Title>
              <Drawer.Description className="text-xs text-[#74645E]">
                {store.name}
              </Drawer.Description>
            </div>
            <button
              onClick={handleClose}
              type="button"
              aria-label="Cerrar checkout"
              className="min-h-[44px] min-w-[44px] rounded-full text-[#74645E] hover:text-[#211B19] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-primary,#78232F)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Pantalla final honesta: Pedido enviado a WhatsApp */}
          {successOrder ? (
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-full bg-[#E5F4E7] text-[#249653] flex items-center justify-center border border-[#C2E8C7]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#F6EBE4] border border-[#E9DAD2] text-xs font-semibold text-[#211B19] tabular-nums">
                  Pedido #{successOrder.orderId}
                </span>
                <h3 className="font-serif text-2xl font-normal text-[#211B19] mt-2">
                  Pedido enviado a WhatsApp
                </h3>
                <p className="text-xs sm:text-sm text-[#74645E] max-w-sm mt-1 leading-relaxed">
                  Aguardá la confirmación del local para coordinar la entrega o el retiro.
                </p>
              </div>

              {/* Resumen objetivo del pedido */}
              <div className="w-full max-w-md p-4 rounded-xl bg-[#F6EBE4] border border-[#E9DAD2] space-y-2 text-xs text-left">
                <div className="flex justify-between text-[#74645E]">
                  <span>Modalidad:</span>
                  <span className="font-semibold text-[#211B19]">
                    {successOrder.deliveryType === "delivery"
                      ? "Envío a domicilio"
                      : "Retiro en local"}
                  </span>
                </div>
                {successOrder.deliveryType === "delivery" &&
                  successOrder.deliveryAddress && (
                    <div className="flex justify-between text-[#74645E]">
                      <span>Dirección:</span>
                      <span className="font-semibold text-[#211B19] text-right truncate max-w-[200px]">
                        {successOrder.deliveryAddress}
                      </span>
                    </div>
                  )}
                <div className="pt-2 border-t border-[#E9DAD2] flex justify-between font-bold text-sm text-[#211B19]">
                  <span>Total:</span>
                  <span className="tabular-nums">
                    {formatPrice(successOrder.total)}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="w-full max-w-md space-y-2.5 pt-2">
                <a
                  href={successOrder.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[48px] px-4 rounded-xl font-semibold text-sm text-white bg-[#25D366] hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 shadow-xs"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Abrir chat de WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full min-h-[44px] px-4 rounded-xl font-medium text-xs text-[#74645E] hover:text-[#211B19] hover:bg-[#F6EBE4] transition-colors text-center"
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
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FDE8E7] border border-[#FAC5C2] text-[#C74742] text-xs sm:text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C74742]" />
                    <div className="flex-1 text-left">
                      <p className="font-semibold">No se pudo procesar tu pedido</p>
                      <p className="opacity-90">{submitError}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSubmitError(null)}
                      className="text-[#C74742] hover:opacity-80"
                      aria-label="Cerrar alerta"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* 1. Lista de ítems */}
                <section className="space-y-3">
                  <div className="flex items-baseline justify-between border-b border-[#E9DAD2] pb-1.5">
                    <h3 className="font-semibold text-sm text-[#211B19]">
                      Tu Pedido ({items.length}{" "}
                      {items.length === 1 ? "ítem" : "ítems"})
                    </h3>
                    <span className="text-xs font-semibold text-[#74645E] tabular-nums">
                      Subtotal: {formatPrice(subtotal)}
                    </span>
                  </div>

                  {items.length === 0 ? (
                    <div className="text-center py-6 rounded-xl bg-[#F6EBE4] border border-[#E9DAD2]">
                      <p className="text-xs text-[#74645E]">
                        Tu carrito está vacío.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E9DAD2] max-h-56 overflow-y-auto pr-1">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="py-3 flex items-start justify-between gap-3"
                        >
                          {item.image_url ? (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F6EBE4] shrink-0 border border-[#E9DAD2]">
                              <Image
                                src={item.image_url}
                                alt={item.product_name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-[#F6EBE4] border border-[#E9DAD2] flex items-center justify-center text-[#A18A81] shrink-0">
                              <UtensilsCrossed className="w-5 h-5" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                              <h4 className="font-semibold text-xs sm:text-sm text-[#211B19] truncate">
                                {item.product_name}
                              </h4>
                              <span className="font-semibold text-xs sm:text-sm text-[#211B19] tabular-nums">
                                {formatPrice(item.subtotal)}
                              </span>
                            </div>

                            {item.selected_options.length > 0 && (
                              <p className="text-[11px] text-[#74645E] mt-0.5 leading-snug">
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
                              <p className="text-[11px] text-[#8C5815] italic mt-0.5">
                                &ldquo;{item.notes}&rdquo;
                              </p>
                            )}

                            {/* Controles de cantidad */}
                            <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#E9DAD2]/50">
                              <div className="flex items-center rounded-lg border border-[#E9DAD2] bg-[#F6EBE4] p-0.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateQuantity(item.id, item.quantity - 1)
                                  }
                                  aria-label="Restar una unidad"
                                  className="min-h-[36px] min-w-[36px] rounded-md bg-[#FFFCF8] text-[#211B19] flex items-center justify-center transition-colors hover:bg-[#F6EBE4]"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>

                                <span className="w-6 text-center text-xs font-bold text-[#211B19] tabular-nums">
                                  {item.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateQuantity(item.id, item.quantity + 1)
                                  }
                                  aria-label="Sumar una unidad"
                                  className="min-h-[36px] min-w-[36px] rounded-md bg-[#FFFCF8] text-[#211B19] flex items-center justify-center transition-colors hover:bg-[#F6EBE4]"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => onRemoveItem(item.id)}
                                aria-label={`Eliminar ${item.product_name} del carrito`}
                                className="min-h-[36px] min-w-[36px] flex items-center justify-center text-[#74645E] hover:text-[#C74742] transition-colors"
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
                  <h3 className="font-semibold text-sm text-[#211B19]">
                    Método de entrega
                  </h3>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDeliveryType("delivery")}
                      className={`min-h-[48px] flex flex-col items-center justify-center p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-primary,#78232F)] ${
                        deliveryType === "delivery"
                          ? "bg-[#F6EBE4] border-[var(--store-primary,#78232F)] text-[#211B19] shadow-xs"
                          : "bg-[#FFFCF8] border-[#E9DAD2] text-[#74645E] hover:border-[#D5C2B8]"
                      }`}
                    >
                      <Bike className="w-4 h-4 mb-1 text-[#74645E]" />
                      <span>Envío a domicilio</span>
                      <span className="text-[11px] font-normal text-[#74645E] tabular-nums mt-0.5">
                        {store.delivery_cost && store.delivery_cost > 0
                          ? formatPrice(store.delivery_cost)
                          : "A convenir"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType("take_away")}
                      className={`min-h-[48px] flex flex-col items-center justify-center p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-primary,#78232F)] ${
                        deliveryType === "take_away"
                          ? "bg-[#F6EBE4] border-[var(--store-primary,#78232F)] text-[#211B19] shadow-xs"
                          : "bg-[#FFFCF8] border-[#E9DAD2] text-[#74645E] hover:border-[#D5C2B8]"
                      }`}
                    >
                      <StoreIcon className="w-4 h-4 mb-1 text-[#74645E]" />
                      <span>Retiro en local</span>
                      <span className="text-[11px] font-normal text-[#74645E] mt-0.5">
                        Sin costo
                      </span>
                    </button>
                  </div>
                </section>

                {/* 3. Datos de contacto */}
                <section className="space-y-3">
                  <h3 className="font-semibold text-sm text-[#211B19]">
                    Datos de contacto
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor={nameInputId}
                        className="block text-xs font-medium text-[#74645E] mb-1"
                      >
                        Nombre y Apellido <span className="text-[var(--store-primary,#78232F)]">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A18A81]" />
                        <input
                          id={nameInputId}
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Ej: Juan Pérez"
                          className={`w-full min-h-[44px] text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border bg-[#FBF5EF] text-[#211B19] placeholder:text-[#A18A81] focus:outline-none focus:ring-2 focus:ring-[var(--store-primary,#78232F)] focus:bg-[#FFFCF8] transition-all ${
                            errors.customerName
                              ? "border-[#FAC5C2]"
                              : "border-[#E9DAD2]"
                          }`}
                        />
                      </div>
                      {errors.customerName && (
                        <p className="text-[11px] text-[#C74742] mt-1">
                          {errors.customerName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor={phoneInputId}
                        className="block text-xs font-medium text-[#74645E] mb-1"
                      >
                        WhatsApp / Teléfono <span className="text-[var(--store-primary,#78232F)]">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A18A81]" />
                        <input
                          id={phoneInputId}
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="Ej: 11 1234 5678"
                          className={`w-full min-h-[44px] text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border bg-[#FBF5EF] text-[#211B19] placeholder:text-[#A18A81] focus:outline-none focus:ring-2 focus:ring-[var(--store-primary,#78232F)] focus:bg-[#FFFCF8] transition-all ${
                            errors.customerPhone
                              ? "border-[#FAC5C2]"
                              : "border-[#E9DAD2]"
                          }`}
                        />
                      </div>
                      {errors.customerPhone && (
                        <p className="text-[11px] text-[#C74742] mt-1">
                          {errors.customerPhone}
                        </p>
                      )}
                    </div>

                    {deliveryType === "delivery" && (
                      <div>
                        <label
                          htmlFor={addressInputId}
                          className="block text-xs font-medium text-[#74645E] mb-1"
                        >
                          Dirección de entrega{" "}
                          <span className="text-[var(--store-primary,#78232F)]">*</span>
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A18A81]" />
                          <input
                            id={addressInputId}
                            type="text"
                            required
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder="Calle, número, piso/depto..."
                            className={`w-full min-h-[44px] text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border bg-[#FBF5EF] text-[#211B19] placeholder:text-[#A18A81] focus:outline-none focus:ring-2 focus:ring-[var(--store-primary,#78232F)] focus:bg-[#FFFCF8] transition-all ${
                              errors.deliveryAddress
                                ? "border-[#FAC5C2]"
                                : "border-[#E9DAD2]"
                            }`}
                          />
                        </div>
                        {errors.deliveryAddress && (
                          <p className="text-[11px] text-[#C74742] mt-1">
                            {errors.deliveryAddress}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </section>

                {/* 4. Medio de pago */}
                <section className="space-y-2">
                  <h3 className="font-semibold text-sm text-[#211B19]">
                    Forma de pago
                  </h3>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash")}
                      className={`min-h-[44px] flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-primary,#78232F)] ${
                        paymentMethod === "cash"
                          ? "bg-[#F6EBE4] border-[var(--store-primary,#78232F)] text-[#211B19] shadow-xs"
                          : "bg-[#FFFCF8] border-[#E9DAD2] text-[#74645E] hover:border-[#D5C2B8]"
                      }`}
                    >
                      <Banknote className="w-4 h-4 mb-1 text-[#249653]" />
                      <span>Efectivo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("transfer")}
                      className={`min-h-[44px] flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-primary,#78232F)] ${
                        paymentMethod === "transfer"
                          ? "bg-[#F6EBE4] border-[var(--store-primary,#78232F)] text-[#211B19] shadow-xs"
                          : "bg-[#FFFCF8] border-[#E9DAD2] text-[#74645E] hover:border-[#D5C2B8]"
                      }`}
                    >
                      <Landmark className="w-4 h-4 mb-1 text-[#74645E]" />
                      <span>Transferencia</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("mercadopago")}
                      className={`min-h-[44px] flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-primary,#78232F)] ${
                        paymentMethod === "mercadopago"
                          ? "bg-[#F6EBE4] border-[var(--store-primary,#78232F)] text-[#211B19] shadow-xs"
                          : "bg-[#FFFCF8] border-[#E9DAD2] text-[#74645E] hover:border-[#D5C2B8]"
                      }`}
                    >
                      <CreditCard className="w-4 h-4 mb-1 text-[#74645E]" />
                      <span>Mercado Pago</span>
                    </button>
                  </div>
                </section>

                {/* 5. Aclaraciones */}
                <section className="space-y-1.5">
                  <label
                    htmlFor={notesInputId}
                    className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm text-[#211B19]"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#A18A81]" />
                    <span>Aclaraciones para el pedido</span>
                  </label>
                  <textarea
                    id={notesInputId}
                    rows={2}
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    placeholder="Ej: Timbre 2B, abonaré con cambio, etc."
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#E9DAD2] bg-[#FBF5EF] text-[#211B19] placeholder:text-[#A18A81] focus:outline-none focus:ring-2 focus:ring-[var(--store-primary,#78232F)] focus:bg-[#FFFCF8] transition-all resize-none"
                  />
                </section>

                {/* 6. Desglose de importes */}
                <section className="p-3.5 rounded-xl bg-[#F6EBE4] border border-[#E9DAD2] space-y-1.5 text-xs sm:text-sm">
                  <div className="flex justify-between text-[#74645E]">
                    <span>Subtotal productos</span>
                    <span className="tabular-nums font-medium text-[#211B19]">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-[#74645E]">
                    <span>
                      Costo de entrega (
                      {deliveryType === "delivery" ? "Domicilio" : "Retiro"})
                    </span>
                    <span className="tabular-nums font-medium text-[#211B19]">
                      {deliveryType === "delivery"
                        ? deliveryFee > 0
                          ? formatPrice(deliveryFee)
                          : "A convenir"
                        : "Gratis"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#E9DAD2] flex justify-between font-bold text-sm sm:text-base text-[#211B19]">
                    <span>Total estimado</span>
                    <span className="tabular-nums">
                      {formatPrice(total)}
                    </span>
                  </div>
                </section>

                {(errors.minOrder || errors.items) && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FDE8E7] border border-[#FAC5C2] text-[#C74742] text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#C74742]" />
                    <span>{errors.minOrder || errors.items}</span>
                  </div>
                )}
              </form>

              {/* Footer fijo con botón principal */}
              <div className="p-4 border-t border-[#E9DAD2] bg-[#FFFCF8]">
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting || isBelowMinOrder || items.length === 0}
                  className="w-full min-h-[48px] py-3.5 px-4 rounded-xl font-semibold text-sm text-[var(--store-primary-contrast,#ffffff)] bg-[var(--store-primary,#78232F)] hover:opacity-95 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-primary,#78232F)] focus-visible:ring-offset-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Registrando pedido...
                      </span>
                      <span className="text-xs opacity-80">Aguardá un momento</span>
                    </>
                  ) : (
                    <>
                      <span>Confirmar Pedido</span>
                      <span className="tabular-nums font-bold">{formatPrice(total)}</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
