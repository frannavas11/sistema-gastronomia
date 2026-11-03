"use client";

import { useState } from "react";
import { Store, Phone, Bike, Clock, Save, Loader2, CheckCircle2 } from "lucide-react";
import { updateStoreSettings } from "@/app/admin/actions";

interface StoreSettingsFormProps {
  store: {
    id: string;
    name: string;
    slug: string;
    phone_whatsapp: string;
    delivery_cost: number | null;
    min_order_amount: number | null;
  };
}

export function StoreSettingsForm({ store }: StoreSettingsFormProps) {
  const [name, setName] = useState(store.name);
  const [phone, setPhone] = useState(store.phone_whatsapp);
  const [deliveryCost, setDeliveryCost] = useState(
    store.delivery_cost?.toString() || "0",
  );
  const [minOrder, setMinOrder] = useState(
    store.min_order_amount?.toString() || "0",
  );

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(false);
    setErrorMsg(null);

    const costNum = parseFloat(deliveryCost) || 0;
    const minNum = parseFloat(minOrder) || 0;

    const res = await updateStoreSettings({
      storeId: store.id,
      name,
      phoneWhatsapp: phone,
      deliveryCost: costNum,
      minOrderAmount: minNum,
    });

    if (res.success) {
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
    } else {
      setErrorMsg(res.error || "Error al guardar cambios");
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm"
    >
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>¡Configuración actualizada exitosamente!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Nombre del Comercio
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <Store className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            WhatsApp para Pedidos (con código de país)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              placeholder="Ej. 5491122334455"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
            />
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            A este número se enviarán los mensajes automáticos de wa.me
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Costo de Envío Estándar ($)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <Bike className="w-4 h-4" />
            </div>
            <input
              type="number"
              min="0"
              step="50"
              value={deliveryCost}
              onChange={(e) => setDeliveryCost(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Monto Mínimo de Pedido ($)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <Clock className="w-4 h-4" />
            </div>
            <input
              type="number"
              min="0"
              step="100"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition-colors shadow-sm"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Guardar Configuración</span>
        </button>
      </div>
    </form>
  );
}

