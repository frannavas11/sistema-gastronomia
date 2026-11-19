import Link from "next/link";

export default function StoreNotFound() {
  return (
    <main className="paper min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <p className="eyebrow text-brand-fg">Error 404</p>
      <h1 className="mt-3 font-serif text-5xl sm:text-6xl text-text-primary tracking-tight">
        Mesa no encontrada
      </h1>
      <p className="mt-4 font-serif italic text-lg text-text-secondary max-w-sm">
        El local que buscás no existe o el enlace es incorrecto.
      </p>
      <div className="rule-double w-24 my-8" />
      <Link
        href="/"
        className="min-h-[48px] px-6 rounded-full bg-ink text-ink-contrast text-sm font-semibold inline-flex items-center hover:bg-ink/90 transition-colors"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
