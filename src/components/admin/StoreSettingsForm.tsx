"use client";

import { useState } from "react";
import { Store, Phone, Bike, Clock, Save, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
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
      toast.success("Configuración actualizada.");
      setTimeout(() => setSuccessMsg(false), 4000);
    } else {
      setErrorMsg(res.error || "Error al guardar cambios");
      toast.error(res.error || "Error al guardar cambios");
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5 shadow-xs"
    >
      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Configuración guardada exitosamente.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Nombre del Comercio
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Store className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            WhatsApp para Pedidos (con código de país)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              placeholder="Ej. 5491122334455"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            A este número se enviarán los pedidos vía wa.me
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Costo de Envío Estándar ($)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Bike className="w-4 h-4" />
            </div>
            <input
              type="number"
              min="0"
              step="50"
              value={deliveryCost}
              onChange={(e) => setDeliveryCost(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Monto Mínimo de Pedido ($)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Clock className="w-4 h-4" />
            </div>
            <input
              type="number"
              min="0"
              step="100"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
            />
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-2xs"
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
