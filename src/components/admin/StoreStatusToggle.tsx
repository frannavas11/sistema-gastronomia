"use client";

import { useState } from "react";
import { Power, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { toggleStoreOpenStatus } from "@/app/admin/actions";

interface StoreStatusToggleProps {
  storeId: string;
  initialIsOpen: boolean;
}

export function StoreStatusToggle({
  storeId,
  initialIsOpen,
}: StoreStatusToggleProps) {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const nextState = !isOpen;
    setLoading(true);

    // Actualización optimista
    setIsOpen(nextState);

    const result = await toggleStoreOpenStatus(storeId, nextState);

    if (!result.success) {
      setIsOpen(!nextState);
      toast.error("Error al actualizar el estado", {
        description: result.error || "No se pudo cambiar el estado del local.",
      });
    } else {
      if (nextState) {
        toast.success("Local Abierto", {
          description: "Los clientes ya pueden recorrer la carta y enviar pedidos.",
        });
      } else {
        toast.info("Local Cerrado", {
          description: "La carta se encuentra en modo pausa con aviso a los clientes.",
        });
      }
    }

    setLoading(false);
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFCF8] border border-[#E9DAD2] shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
              isOpen
                ? "bg-[#E5F4E7] text-[#249653] border border-[#C2E8C7]"
                : "bg-[#F6EBE4] text-[#74645E] border border-[#E9DAD2]"
            }`}
          >
            <Power className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-serif text-base sm:text-lg font-normal text-[#211B19]">
                Estado del Local
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                  isOpen
                    ? "bg-[#E5F4E7] text-[#249653] border-[#C2E8C7]"
                    : "bg-[#FDE8E7] text-[#C74742] border-[#FAC5C2]"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOpen ? "bg-[#249653]" : "bg-[#C74742]"
                  }`}
                />
                {isOpen ? "Abierto" : "Cerrado"}
              </span>
            </div>

            <p className="text-xs text-[#74645E] mt-1">
              {isOpen
                ? "Tu local está abierto y recibiendo pedidos en tiempo real."
                : "El local se encuentra cerrado. Los clientes podrán explorar la carta con aviso informativo."}
            </p>
          </div>
        </div>

        {/* Switch botón maestro accesible (≥44px) */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={loading}
          aria-label={isOpen ? "Cerrar local" : "Abrir local"}
          className={`relative inline-flex h-11 w-20 shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#78232F] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none ${
            isOpen ? "bg-[#249653]" : "bg-[#E9DAD2]"
          }`}
        >
          <span
            className={`pointer-events-none inline-flex h-9 w-9 transform items-center justify-center rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              isOpen ? "translate-x-9" : "translate-x-0"
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#74645E]" />
            ) : (
              <Power
                className={`w-4 h-4 ${
                  isOpen ? "text-[#249653]" : "text-[#A18A81]"
                }`}
              />
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
