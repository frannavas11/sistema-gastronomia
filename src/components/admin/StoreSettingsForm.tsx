"use client";

import { useState } from "react";
import {
  Store,
  Phone,
  Bike,
  Clock,
  Save,
  Loader2,
  CheckCircle2,
  Palette,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { updateStoreSettings } from "@/app/admin/actions";
import { ImageUploadInput } from "@/components/admin/ImageUploadInput";
import { getContrastTextColor } from "@/lib/utils";

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
    theme_colors?: unknown;
  };
}

const DEFAULT_PRIMARY = "#78232F";

function isValidHex(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex.trim());
}

function normalizeToFullHex(hex: string): string {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    return `#${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`.toUpperCase();
  }
  if (clean.length === 6) {
    return `#${clean}`.toUpperCase();
  }
  return DEFAULT_PRIMARY;
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

  const initialPrimary =
    (store.theme_colors as { primary?: string } | null)?.primary || DEFAULT_PRIMARY;
  const [primaryColor, setPrimaryColor] = useState(initialPrimary);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isColorValid = isValidHex(primaryColor);
  const validHexPreview = isColorValid
    ? normalizeToFullHex(primaryColor)
    : DEFAULT_PRIMARY;
  const contrastColor = getContrastTextColor(validHexPreview);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    if (!val.startsWith("#") && val.length > 0) {
      val = `#${val}`;
    }
    setPrimaryColor(val);
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrimaryColor(e.target.value.toUpperCase());
  };

  const handleResetColor = () => {
    setPrimaryColor(DEFAULT_PRIMARY);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(false);
    setErrorMsg(null);

    if (!isValidHex(primaryColor)) {
      const err = "Por favor ingresá un código hexadecimal válido (ej. #78232F).";
      setErrorMsg(err);
      toast.error(err);
      setLoading(false);
      return;
    }

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
      primaryColor: normalizeToFullHex(primaryColor),
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

      {/* Selector de Color Principal y Vista Previa en Vivo */}
      <div className="pt-4 border-t border-[#E9DAD2] space-y-4">
        <div>
          <h2 className="font-serif text-base sm:text-lg font-normal text-[#211B19] flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#78232F]" />
            <span>Color de Marca del Catálogo</span>
          </h2>
          <p className="text-xs text-[#74645E]">
            Define el color principal (--store-primary) de tu carta digital. Los tonos suaves y el contraste de texto se derivan automáticamente.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Controles de entrada: color picker y campo hex */}
          <div className="lg:col-span-5 space-y-3">
            <label className="block text-xs font-medium text-[#74645E]">
              Color Principal (HEX)
            </label>

            <div className="flex items-center gap-2.5">
              {/* Input color táctil */}
              <div className="relative shrink-0">
                <input
                  type="color"
                  value={validHexPreview}
                  onChange={handlePickerChange}
                  aria-label="Selector interactivo de color"
                  className="w-12 h-11 p-1 bg-[#FBF5EF] border border-[#E9DAD2] rounded-xl cursor-pointer hover:border-[#78232F] transition-colors"
                />
              </div>

              {/* Campo de texto HEX */}
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={7}
                  value={primaryColor}
                  onChange={handleHexChange}
                  placeholder="#78232F"
                  className={`w-full min-h-[44px] px-3.5 py-2.5 bg-[#FBF5EF] border rounded-xl text-sm font-mono uppercase tracking-wider text-[#211B19] focus:outline-none focus:ring-2 focus:ring-[#78232F] focus:bg-[#FFFCF8] transition-all ${
                    isColorValid ? "border-[#E9DAD2]" : "border-[#FAC5C2] bg-[#FDE8E7]/40"
                  }`}
                />
              </div>

              {/* Botón de restablecer */}
              <button
                type="button"
                onClick={handleResetColor}
                title="Restablecer color por defecto (#78232F)"
                aria-label="Restablecer color predeterminado"
                className="min-h-[44px] px-3 rounded-xl border border-[#E9DAD2] bg-[#FBF5EF] hover:bg-[#FFFCF8] text-[#74645E] hover:text-[#211B19] transition-colors flex items-center justify-center text-xs gap-1.5 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Defecto</span>
              </button>
            </div>

            {!isColorValid && (
              <p className="text-[11px] text-[#C74742]">
                Ingresá un código hexadecimal válido (ej. #78232F o #C0392B).
              </p>
            )}

            <div className="p-3 rounded-xl bg-[#FBF5EF] border border-[#E9DAD2] text-xs text-[#74645E] space-y-1">
              <div className="flex justify-between items-center">
                <span>Color seleccionado:</span>
                <span className="font-mono font-semibold text-[#211B19]">
                  {validHexPreview}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Texto sobre el color:</span>
                <span className="font-medium text-[#211B19]">
                  {contrastColor === "#ffffff" ? "Blanco (#ffffff)" : "Oscuro (#211B19)"}
                </span>
              </div>
            </div>
          </div>

          {/* Vista previa en vivo */}
          <div className="lg:col-span-7 bg-[#FBF5EF] border border-[#E9DAD2] rounded-xl p-4 space-y-3">
            <span className="text-[11px] font-semibold tracking-wider text-[#74645E] uppercase block">
              Vista previa en vivo en la carta pública
            </span>

            <div className="p-3.5 rounded-xl bg-[#FFFCF8] border border-[#E9DAD2] space-y-3">
              {/* Header simulado con logo y pill */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E9DAD2]">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-serif text-xs font-bold shadow-xs transition-colors"
                    style={{
                      backgroundColor: validHexPreview,
                      color: contrastColor,
                    }}
                  >
                    {name.slice(0, 2).toUpperCase() || "GA"}
                  </div>
                  <div>
                    <span className="font-serif text-sm font-semibold text-[#211B19] block leading-none">
                      {name || "Tu Comercio"}
                    </span>
                    <span className="text-[10px] text-[#74645E]">Carta online</span>
                  </div>
                </div>

                {/* Pill activa simulada */}
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold shadow-xs transition-colors"
                  style={{
                    backgroundColor: validHexPreview,
                    color: contrastColor,
                  }}
                >
                  Pizzas
                </span>
              </div>

              {/* Botón y opción con tono suave derivado */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                {/* Opción con color-mix suave */}
                <div
                  className="px-3 py-1.5 rounded-lg border text-xs font-medium text-[#211B19] flex items-center gap-2 transition-colors"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${validHexPreview} 14%, #FFFCF8)`,
                    borderColor: validHexPreview,
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: validHexPreview }}
                  />
                  <span>Opción seleccionada (tono suave)</span>
                </div>

                {/* Botón Agregar simulado */}
                <div
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 self-end sm:self-auto transition-colors"
                  style={{
                    backgroundColor: validHexPreview,
                    color: contrastColor,
                  }}
                >
                  <span>+ Agregar</span>
                </div>
              </div>
            </div>
          </div>
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
