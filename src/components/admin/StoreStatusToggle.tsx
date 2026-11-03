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
      // Revertir en caso de error
      setIsOpen(!nextState);
      setNotification(`Error: ${result.error}`);
    } else {
      setNotification(
        nextState
          ? "¡Local Abierto! Ahora tus clientes pueden pedir."
          : "Local Cerrado. Tu carta se muestra en modo pausa.",
      );
      setTimeout(() => setNotification(null), 4000);
    }

    setLoading(false);
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-sm relative overflow-hidden">
      {/* Luz ambiental indicadora */}
      <div
        className={`absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
          isOpen ? "bg-emerald-500/15" : "bg-rose-500/15"
        }`}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors flex-shrink-0 ${
              isOpen
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
            }`}
          >
            <Power className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-100">
                Estado Operativo del Local
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                  isOpen
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                  }`}
                />
                {isOpen ? "Abierto" : "Cerrado"}
              </span>
            </div>

            <p className="text-xs text-zinc-400 mt-1">
              {isOpen
                ? "Los clientes pueden navegar la carta y enviar pedidos por WhatsApp con normalidad."
                : "El local no está recibiendo pedidos. Los clientes verán un aviso indicando que está cerrado."}
            </p>
          </div>
        </div>

        {/* Switch botón maestro */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={loading}
          aria-label={isOpen ? "Cerrar local" : "Abrir local"}
          className={`relative inline-flex h-11 w-24 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed ${
            isOpen
              ? "bg-emerald-600 focus:ring-emerald-500"
              : "bg-zinc-800 focus:ring-zinc-600"
          }`}
        >
          <span
            className={`pointer-events-none inline-flex h-10 w-10 transform items-center justify-center rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              isOpen ? "translate-x-13" : "translate-x-0"
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-zinc-700" />
            ) : (
              <Power
                className={`w-5 h-5 ${
                  isOpen ? "text-emerald-600" : "text-zinc-400"
                }`}
              />
            )}
          </span>
        </button>
      </div>

      {/* Notificación de confirmación */}
      {notification && (
        <div
          className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 animate-fade-in ${
            notification.startsWith("Error")
              ? "bg-rose-500/10 border border-rose-500/20 text-rose-300"
              : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
          }`}
        >
          {notification.startsWith("Error") ? (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
}

