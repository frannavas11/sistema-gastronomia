import Link from "next/link";
import { Store as StoreIcon } from "lucide-react";

export default function StoreNotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-4 text-zinc-500">
        <StoreIcon className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
        Local no encontrado
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400 max-w-sm mb-6 text-sm">
        El comercio que estás buscando no existe o el enlace ingresado es incorrecto.
      </p>
      <Link
        href="/"
        className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity"
      >
        Volver al inicio
      </Link>
    </main>
  );
}

