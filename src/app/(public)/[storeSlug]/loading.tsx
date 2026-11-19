export default function StoreCatalogLoading() {
  return (
    <div className="paper min-h-screen" aria-busy="true" aria-label="Cargando la carta">
      <div className="h-[46vh] min-h-[320px] max-h-[480px] bg-surface-2 animate-pulse relative">
        <div className="absolute inset-x-0 bottom-0 max-w-2xl mx-auto px-5 pb-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-border" />
            <div className="h-3 w-28 rounded bg-border" />
          </div>
          <div className="h-12 w-3/4 rounded-xl bg-border" />
          <div className="flex gap-2">
            <div className="h-7 w-28 rounded-full bg-border" />
            <div className="h-7 w-32 rounded-full bg-border" />
          </div>
        </div>
      </div>

      <div className="border-b border-border">
        <div className="max-w-2xl mx-auto px-5 h-[52px] flex items-center gap-6">
          {[20, 24, 16, 20].map((w, i) => (
            <div key={i} className="h-3 rounded bg-border animate-pulse" style={{ width: `${w * 4}px` }} />
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-5 pt-10 animate-pulse">
        <div className="h-9 w-48 rounded-lg bg-border" />
        <div className="mt-3 rule-double" />
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex gap-4 py-5 border-b border-border/70">
            <div className="flex-1 space-y-2.5">
              <div className="h-5 w-2/3 rounded bg-border" />
              <div className="h-3 w-full rounded bg-surface-2" />
              <div className="h-3 w-1/2 rounded bg-surface-2" />
            </div>
            <div className="w-24 h-24 rounded-2xl bg-surface-2" />
          </div>
        ))}
      </main>
    </div>
  );
}
