"use client";

import { useState } from "react";
import { Store, Phone, Bike, Clock, Save, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { updateStoreSettings } from "@/app/admin/actions";
import { ImageUploadInput } from "@/components/admin/ImageUploadInput";

interface StoreSettingsFormProps {
  store: {
    id: string;
    name: string;
    slug: string;
    phone_whatsapp: string;
    delivery_cost: number | null;
    min_order_amount: number | null;
    logo_url?: string | null;
    banner_url?: string | null;
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
  const [logoUrl, setLogoUrl] = useState(store.logo_url || "");
  const [bannerUrl, setBannerUrl] = useState(store.banner_url || "");

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
      logoUrl: logoUrl.trim() || null,
      bannerUrl: bannerUrl.trim() || null,
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
      className="bg-[#FFFCF8] border border-[#E9DAD2] rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs text-[#211B19]"
    >
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-[#E5F4E7] border border-[#C2E8C7] text-xs text-[#249653] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Configuración guardada exitosamente.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-[#FDE8E7] border border-[#FAC5C2] text-xs text-[#C74742]">
          {errorMsg}
        </div>
      )}

      {/* Datos operativos */}
      <div className="space-y-4">
        <div>
          <h2 className="font-serif text-base sm:text-lg font-normal text-[#211B19]">
            Datos Operativos
          </h2>
          <p className="text-xs text-[#74645E]">
            Nombre, contacto para pedidos y montos comerciales.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#74645E] mb-1">
              Nombre del Comercio
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A18A81]">
                <Store className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full min-h-[44px] pl-9 pr-3.5 py-2.5 bg-[#FBF5EF] border border-[#E9DAD2] rounded-xl text-sm text-[#211B19] focus:outline-none focus:ring-2 focus:ring-[#78232F] focus:bg-[#FFFCF8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#74645E] mb-1">
              WhatsApp para Pedidos (con código de país)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A18A81]">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="Ej. 5491122334455"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full min-h-[44px] pl-9 pr-3.5 py-2.5 bg-[#FBF5EF] border border-[#E9DAD2] rounded-xl text-sm text-[#211B19] font-mono focus:outline-none focus:ring-2 focus:ring-[#78232F] focus:bg-[#FFFCF8]"
              />
            </div>
            <p className="text-[11px] text-[#74645E] mt-1">
              A este número se enviarán los pedidos vía wa.me
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#74645E] mb-1">
              Costo de Envío Estándar ($)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A18A81]">
                <Bike className="w-4 h-4" />
              </div>
              <input
                type="number"
                min="0"
                step="50"
                value={deliveryCost}
                onChange={(e) => setDeliveryCost(e.target.value)}
                className="w-full min-h-[44px] pl-9 pr-3.5 py-2.5 bg-[#FBF5EF] border border-[#E9DAD2] rounded-xl text-sm text-[#211B19] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#78232F] focus:bg-[#FFFCF8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#74645E] mb-1">
              Monto Mínimo de Pedido ($)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A18A81]">
                <Clock className="w-4 h-4" />
              </div>
              <input
                type="number"
                min="0"
                step="100"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="w-full min-h-[44px] pl-9 pr-3.5 py-2.5 bg-[#FBF5EF] border border-[#E9DAD2] rounded-xl text-sm text-[#211B19] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#78232F] focus:bg-[#FFFCF8]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Imágenes de Portada e Identidad */}
      <div className="pt-4 border-t border-[#E9DAD2] space-y-4">
        <div>
          <h2 className="font-serif text-base sm:text-lg font-normal text-[#211B19]">
            Imágenes del Local
          </h2>
          <p className="text-xs text-[#74645E]">
            Personalizá el logo circular y la foto de portada (banner) del catálogo público.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ImageUploadInput
            storeId={store.id}
            value={logoUrl}
            onChange={setLogoUrl}
            label="Logo del Local"
          />

          <ImageUploadInput
            storeId={store.id}
            value={bannerUrl}
            onChange={setBannerUrl}
            label="Foto de Portada (Banner)"
          />
        </div>
      </div>

      <div className="pt-3 border-t border-[#E9DAD2] flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-[#78232F] hover:bg-[#541923] disabled:opacity-50 transition-colors shadow-xs"
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
