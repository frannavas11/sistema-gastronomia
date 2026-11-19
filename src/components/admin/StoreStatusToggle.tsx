"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { toggleStoreOpenStatus } from "@/app/admin/actions";

interface StoreStatusToggleProps {
  storeId: string;
  initialIsOpen: boolean;
}

/** Interruptor maestro "abierto / cerrado", presentado como cartel de la puerta del local. */
export function StoreStatusToggle({ storeId, initialIsOpen }: StoreStatusToggleProps) {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const next = !isOpen;
    setLoading(true);
    setIsOpen(next); // optimista

    const result = await toggleStoreOpenStatus(storeId, next);
    if (!result.success) {
      setIsOpen(!next);
      toast.error("No se pudo cambiar el estado", { description: result.error });
    } else if (next) {
      toast.success("Local abierto", { description: "Ya podés recibir pedidos." });
    } else {
      toast.info("Local cerrado", { description: "La carta queda visible pero sin recibir pedidos." });
    }
    setLoading(false);
  };

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border p-6 sm:p-7 transition-colors ${
        isOpen ? "bg-success-soft border-success-border" : "bg-surface border-border"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <p className={`eyebrow ${isOpen ? "text-success" : "text-text-tertiary"}`}>Estado del local</p>
          <p className="mt-1 font-serif text-4xl sm:text-5xl leading-none text-text-primary">
            {isOpen ? "Abierto" : "Cerrado"}
            <span className={`font-serif italic ${isOpen ? "text-success" : "text-text-tertiary"}`}>.</span>
          </p>
          <p className="mt-2 text-sm text-text-secondary max-w-md">
            {isOpen
              ? "Tu carta está recibiendo pedidos ahora mismo."
              : "Los clientes pueden ver la carta, pero no enviar pedidos."}
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isOpen}
          onClick={handleToggle}
          disabled={loading}
          aria-label={isOpen ? "Cerrar el local" : "Abrir el local"}
          className={`relative inline-flex h-14 w-28 shrink-0 items-center rounded-full p-1.5 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 disabled:opacity-60 ${
            isOpen ? "bg-success-solid" : "bg-border-strong"
          }`}
        >
          <span
            className={`eyebrow absolute text-white/90 transition-opacity ${
              isOpen ? "left-4 opacity-100" : "left-4 opacity-0"
            }`}
          >
            On
          </span>
          <span
            className={`eyebrow absolute right-4 text-text-secondary transition-opacity ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          >
            Off
          </span>
          <span
            className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ease-out ${
              isOpen ? "translate-x-14" : "translate-x-0"
            }`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />}
          </span>
        </button>
      </div>
    </section>
  );
}
