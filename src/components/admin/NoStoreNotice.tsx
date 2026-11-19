/** Aviso para usuarios autenticados que todavía no tienen un local vinculado. */
export function NoStoreNotice() {
  return (
    <div className="py-24 text-center max-w-md mx-auto">
      <p className="eyebrow text-brand-fg">Sin local</p>
      <h1 className="mt-3 font-serif text-4xl text-text-primary">Todavía no hay un local vinculado</h1>
      <p className="mt-3 font-serif italic text-text-secondary">
        Tu cuenta está activa, pero ningún comercio la tiene como dueña. Contactá al administrador
        de la plataforma para vincularlo.
      </p>
    </div>
  );
}
