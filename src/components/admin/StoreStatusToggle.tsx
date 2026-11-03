"use client";

import { useState } from "react";
import { Power, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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
  const [notification, setNotification] = useState<string | null>(null);

  const handleToggle = async () => {
    const nextState = !isOpen;
    setLoading(true);
    setNotification(null);

    // Actualización optimista
    setIsOpen(nextState);

    const result = await toggleStoreOpenStatus(storeId, nextState);

    if (!result.success) {
      setIsOpen(!nextState);
      setNotification(`Error: ${result.error}`);
    } else {
      setNotification(
        nextState
          ? "Local Abierto. Los clientes pueden realizar pedidos."
          : "Local Cerrado. Tu carta se muestra en modo pausa.",
      );
      setTimeout(() => setNotification(null), 4000);
    }

    setLoading(false);
  };

  return (
    <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
              isOpen
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-500 border border-slate-200"
            }`}
          >
            <Power className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                Estado Operativo del Local
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                  isOpen
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOpen ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
                {isOpen ? "Abierto" : "Cerrado"}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-0.5">
              {isOpen
                ? "Los clientes pueden navegar la carta y enviar pedidos a WhatsApp."
                : "El local no recibe pedidos. Los clientes verán el menú con un aviso informativo."}
            </p>
          </div>
        </div>

        {/* Switch botón maestro */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={loading}
          aria-label={isOpen ? "Cerrar local" : "Abrir local"}
          className={`relative inline-flex h-9 w-18 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            isOpen ? "bg-emerald-600" : "bg-slate-300"
          }`}
        >
          <span
            className={`pointer-events-none inline-flex h-8 w-8 transform items-center justify-center rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              isOpen ? "translate-x-9" : "translate-x-0"
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
            ) : (
              <Power
                className={`w-4 h-4 ${
                  isOpen ? "text-emerald-600" : "text-slate-400"
                }`}
              />
            )}
          </span>
        </button>
      </div>

      {notification && (
        <div
          className={`mt-3 p-3 rounded-lg text-xs flex items-center gap-2 ${
            notification.startsWith("Error")
              ? "bg-rose-50 border border-rose-200 text-rose-700"
              : "bg-emerald-50 border border-emerald-200 text-emerald-700"
          }`}
        >
          {notification.startsWith("Error") ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          )}
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
}
