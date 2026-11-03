import Link from "next/link";
import { Store as StoreIcon } from "lucide-react";

export default function StoreNotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#fafafa]">
      <div className="w-16 h-16 rounded-full bg-zinc-200 flex items-center justify-center mb-4 text-zinc-500">
        <StoreIcon className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">
        Local no encontrado
      </h1>
      <p className="text-zinc-600 max-w-sm mb-6 text-sm">
        El comercio que estás buscando no existe o el enlace ingresado es incorrecto.
      </p>
      <Link
        href="/"
        className="min-h-[44px] px-4 py-2.5 text-sm font-medium rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition-colors inline-flex items-center justify-center"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
