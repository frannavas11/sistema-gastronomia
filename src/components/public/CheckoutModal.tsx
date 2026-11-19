"use client";

import { useState, useId } from "react";
import { Drawer } from "vaul";
import {
  X,
  Minus,
  Plus,
  Bike,
  Store as StoreIcon,
  Banknote,
  Landmark,
  CreditCard,
  AlertCircle,
  Loader2,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import type {
  Store,
  CartItem,
  DeliveryType,
  PaymentMethod,
  CreateOrderResponse,
} from "@/types/store";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatCurrencyARS } from "@/lib/format";

interface CheckoutModalProps {
  store: Store;
  items: CartItem[];
  subtotal: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  /** Se llama al cerrar la pantalla de éxito (vacía el carrito). */
  onOrderPlaced: () => void;
}

interface PlacedOrder {
  orderId: number;
  whatsappUrl: string;
  total: number;
}

const DELIVERY_OPTIONS: Array<{ value: DeliveryType; label: string; icon: LucideIcon }> = [
  { value: "delivery", label: "Envío", icon: Bike },
  { value: "take_away", label: "Retiro", icon: StoreIcon },
];

const PAYMENT_OPTIONS: Array<{ value: PaymentMethod; label: string; icon: LucideIcon }> = [
  { value: "cash", label: "Efectivo", icon: Banknote },
  { value: "transfer", label: "Transferencia", icon: Landmark },
  { value: "mercadopago", label: "Mercado Pago", icon: CreditCard },
];

/** Botonera de opciones excluyentes (antes eran 5 botones copiados a mano). */
function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string; icon: LucideIcon }>;
  onChange: (value: T) => void;
  hint?: (value: T) => string | null;
}) {
  return (
    <fieldset>
      <legend className="eyebrow text-text-tertiary mb-2.5">{label}</legend>
      <div className={`grid gap-2 ${options.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {options.map((opt) => {
          const active = opt.value === value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              aria-pressed={active}
              className={`min-h-[64px] rounded-2xl border px-2 py-2.5 flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                active
                  ? "border-brand bg-brand-light text-text-primary shadow-sm"
                  : "border-border text-text-secondary hover:border-border-strong hover:text-text-primary"
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? "text-brand-fg" : ""}`} />
              <span>{opt.label}</span>
              {hint?.(opt.value) && (
                <span className="text-[10px] font-normal text-text-tertiary tabular-nums">
                  {hint(opt.value)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Field({
  id,
  label,
  error,
  ...input
}: { id: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-text-secondary mb-1.5">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error) || undefined}
        className={`w-full min-h-[48px] px-4 rounded-2xl border bg-background text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand focus:bg-surface transition-colors ${
          error ? "border-error" : "border-border"
        }`}
        {...input}
      />
      {error && <p className="text-[11px] text-error mt-1">{error}</p>}
    </div>
  );
}

export function CheckoutModal({
  store,
  items,
  subtotal,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onOrderPlaced,
}: CheckoutModalProps) {
  const ids = { name: useId(), phone: useId(), address: useId(), notes: useId() };

  const [deliveryType, setDeliveryType] = useState<DeliveryType>("delivery");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [generalNotes, setGeneralNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);

  const isDelivery = deliveryType === "delivery";
  const deliveryFee = isDelivery ? store.delivery_cost || 0 : 0;
  const total = subtotal + deliveryFee;
  const minOrder = store.min_order_amount || 0;
  const missingForMin = minOrder > 0 ? minOrder - subtotal : 0;
  const isStoreClosed = store.is_open === false;

  const validate = () => {
    const next: Record<string, string> = {};
    if (customerName.trim().length < 2) next.name = "Ingresá tu nombre y apellido.";
    if (customerPhone.replace(/\D/g, "").length < 8) next.phone = "Ingresá un teléfono válido (mín. 8 dígitos).";
    if (isDelivery && deliveryAddress.trim().length < 3) next.address = "Ingresá la dirección de entrega.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleClose = () => {
    if (placedOrder) {
      setPlacedOrder(null);
      onOrderPlaced();
    }
    setSubmitError(null);
    setErrors({});
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const order = {
      store_id: store.id,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      delivery_type: deliveryType,
      delivery_address: isDelivery ? deliveryAddress.trim() : null,
      payment_method: paymentMethod,
      notes: generalNotes.trim() || null,
    };

    let response: Response;
    try {
      response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...order,
          items: items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            notes: item.notes || null,
            selected_options: item.selected_options.map(({ id, group_id }) => ({ id, group_id })),
          })),
        }),
      });
    } catch {
      setSubmitError("No hay conexión con el servidor. Verificá tu internet e intentá de nuevo.");
      setIsSubmitting(false);
      return;
    }

    const result = (await response.json().catch(() => null)) as
      | CreateOrderResponse
      | { error?: string }
      | null;

    if (!response.ok || !result || !("success" in result)) {
      // Antes cualquier rechazo del servidor (producto agotado, local cerrado, mínimo)
      // se mostraba como "Error de conexión": ahora se muestra el motivo real.
      setSubmitError(
        (result && "error" in result && result.error) ||
          "No pudimos registrar tu pedido. Intentá nuevamente.",
      );
      setIsSubmitting(false);
      return;
    }

    // El mensaje de WhatsApp usa los totales recalculados por el servidor
    // (antes se leían de campos inexistentes y siempre caía en los del navegador).
    const whatsappUrl = buildWhatsAppUrl({
      ...order,
      orderId: result.orderId,
      store: { name: store.name, phone_whatsapp: store.phone_whatsapp },
      items,
      subtotal: result.subtotal,
      delivery_fee: result.deliveryFee,
      total: result.total,
    });

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setPlacedOrder({ orderId: result.orderId, whatsappUrl, total: result.total });
    setIsSubmitting(false);
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Drawer.Content className="fixed bottom-0 inset-x-0 z-50 max-w-xl mx-auto max-h-[94vh] flex flex-col rounded-t-[2rem] bg-surface shadow-2xl overflow-hidden focus:outline-none">
          <div className="mx-auto mt-3 w-10 h-1.5 rounded-full bg-border-strong shrink-0" />

          <div className="flex items-start justify-between px-6 pt-4 pb-3 shrink-0">
            <div>
              <p className="eyebrow text-brand-fg">{store.name}</p>
              <Drawer.Title className="font-serif text-3xl text-text-primary">
                {placedOrder ? "¡Pedido enviado!" : "La cuenta"}
              </Drawer.Title>
              <Drawer.Description className="sr-only">
                Revisá tu pedido y completá tus datos para enviarlo por WhatsApp.
              </Drawer.Description>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Cerrar"
              className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {placedOrder ? (
            <div className="flex-1 overflow-y-auto px-6 pb-8 text-center animate-fade">
              <div className="mx-auto mt-4 w-full max-w-sm rounded-3xl border border-border bg-background p-6">
                <p className="eyebrow text-text-tertiary">Comanda</p>
                <p className="font-serif text-5xl text-text-primary tabular-nums mt-1">
                  #{placedOrder.orderId}
                </p>
                <div className="perforation my-5" />
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-text-secondary">Total</span>
                  <span className="font-serif text-2xl tabular-nums">{formatCurrencyARS(placedOrder.total)}</span>
                </div>
              </div>
              <p className="mt-5 font-serif italic text-text-secondary leading-relaxed max-w-sm mx-auto">
                Tu pedido quedó registrado. Enviá el mensaje de WhatsApp y esperá la confirmación del
                local.
              </p>
              <a
                href={placedOrder.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full max-w-sm mx-auto min-h-[52px] rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-black/10 transition-colors"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                Abrir WhatsApp
              </a>
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 w-full max-w-sm mx-auto min-h-[44px] rounded-full text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Volver a la carta
              </button>
            </div>
          ) : (
            <>
              <form
                id="checkout-form"
                onSubmit={handleSubmit}
                noValidate
                className="flex-1 overflow-y-auto px-6 pb-6 space-y-8"
              >
                {/* Ticket con los ítems */}
                <section className="rounded-3xl border border-border bg-background px-5 py-4">
                  {items.length === 0 ? (
                    <p className="py-6 text-center font-serif italic text-text-secondary">
                      Tu pedido está vacío.
                    </p>
                  ) : (
                    <ul className="divide-y divide-dashed divide-border-strong/70">
                      {items.map((item) => (
                        <li key={item.id} className="py-3.5">
                          <div className="flex items-baseline gap-2">
                            <span className="font-serif text-lg text-text-primary">{item.product_name}</span>
                            <span className="leader" aria-hidden="true" />
                            <span className="text-sm font-semibold tabular-nums">
                              {formatCurrencyARS(item.subtotal)}
                            </span>
                          </div>
                          {item.selected_options.length > 0 && (
                            <p className="text-xs text-text-secondary mt-0.5">
                              {item.selected_options.map((o) => o.name).join(" · ")}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-xs font-serif italic text-warning-fg mt-0.5">
                              “{item.notes}”
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                item.quantity > 1
                                  ? onUpdateQuantity(item.id, item.quantity - 1)
                                  : onRemoveItem(item.id)
                              }
                              aria-label={item.quantity > 1 ? "Restar uno" : `Quitar ${item.product_name}`}
                              className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-7 text-center text-sm font-semibold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              aria-label="Sumar uno"
                              className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <span className="ml-2 text-xs text-text-tertiary tabular-nums">
                              × {formatCurrencyARS(item.unit_price)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="perforation my-3" />
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-text-secondary">
                      <dt>Subtotal</dt>
                      <dd className="tabular-nums">{formatCurrencyARS(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between text-text-secondary">
                      <dt>{isDelivery ? "Envío" : "Retiro en el local"}</dt>
                      <dd className="tabular-nums">
                        {isDelivery ? (deliveryFee > 0 ? formatCurrencyARS(deliveryFee) : "A convenir") : "Gratis"}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between pt-2">
                      <dt className="eyebrow text-text-primary">Total</dt>
                      <dd className="font-serif text-3xl tabular-nums text-text-primary">
                        {formatCurrencyARS(total)}
                      </dd>
                    </div>
                  </dl>
                </section>

                <ChoiceGroup
                  label="¿Cómo lo recibís?"
                  value={deliveryType}
                  options={DELIVERY_OPTIONS}
                  onChange={setDeliveryType}
                  hint={(v) =>
                    v === "delivery"
                      ? (store.delivery_cost ?? 0) > 0
                        ? formatCurrencyARS(store.delivery_cost!)
                        : "A convenir"
                      : "Sin costo"
                  }
                />

                <fieldset className="space-y-3">
                  <legend className="eyebrow text-text-tertiary mb-2.5">Tus datos</legend>
                  <Field
                    id={ids.name}
                    label="Nombre y apellido"
                    autoComplete="name"
                    maxLength={80}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Juan Pérez"
                    error={errors.name}
                  />
                  <Field
                    id={ids.phone}
                    label="WhatsApp / teléfono"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    maxLength={30}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="11 1234 5678"
                    error={errors.phone}
                  />
                  {isDelivery && (
                    <Field
                      id={ids.address}
                      label="Dirección de entrega"
                      autoComplete="street-address"
                      maxLength={200}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Calle, número, piso/depto"
                      error={errors.address}
                    />
                  )}
                </fieldset>

                <ChoiceGroup
                  label="Forma de pago"
                  value={paymentMethod}
                  options={PAYMENT_OPTIONS}
                  onChange={setPaymentMethod}
                />

                <div>
                  <label htmlFor={ids.notes} className="eyebrow text-text-tertiary">
                    Aclaraciones
                  </label>
                  <textarea
                    id={ids.notes}
                    rows={2}
                    maxLength={500}
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    placeholder="Timbre 2B, pago con $10.000…"
                    className="mt-2.5 w-full px-4 py-3 rounded-2xl border border-border bg-background text-sm text-text-primary placeholder:text-text-tertiary placeholder:italic focus:outline-none focus:ring-2 focus:ring-brand focus:bg-surface resize-none transition-colors"
                  />
                </div>

                {submitError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 p-4 rounded-2xl bg-error-soft border border-error-border text-error text-sm"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{submitError}</p>
                  </div>
                )}
              </form>

              <div className="shrink-0 p-4 border-t border-border bg-surface safe-bottom">
                {(isStoreClosed || missingForMin > 0) && (
                  <p className="text-xs text-center text-brand-fg mb-3">
                    {isStoreClosed
                      ? "El local está cerrado: no recibe pedidos en este momento."
                      : `Te faltan ${formatCurrencyARS(missingForMin)} para el pedido mínimo.`}
                  </p>
                )}
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting || items.length === 0 || missingForMin > 0 || isStoreClosed}
                  className="w-full min-h-[56px] px-6 rounded-full bg-brand text-brand-contrast font-semibold flex items-center justify-between shadow-lg shadow-black/10 hover:bg-brand-dark active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2 mx-auto">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registrando pedido…
                    </span>
                  ) : (
                    <>
                      <span className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Pedir por WhatsApp
                      </span>
                      <span className="font-serif text-lg tabular-nums">{formatCurrencyARS(total)}</span>
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
