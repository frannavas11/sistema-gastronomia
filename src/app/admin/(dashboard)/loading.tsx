export default function AdminDashboardLoading() {
  return (
    <div className="space-y-10 animate-pulse" aria-busy="true" aria-label="Cargando">
      <div className="space-y-3">
        <div className="h-3 w-40 rounded bg-border" />
        <div className="h-12 w-3/4 max-w-lg rounded-xl bg-border" />
        <div className="h-4 w-80 max-w-full rounded bg-surface-2" />
      </div>
      <div className="h-36 rounded-3xl bg-surface border border-border" />
      <div className="grid grid-cols-1 sm:grid-cols-3 border-y border-border">
        {[1, 2, 3].map((n) => (
          <div key={n} className="py-6 sm:px-6 space-y-3">
            <div className="h-3 w-24 rounded bg-border" />
            <div className="h-11 w-28 rounded-lg bg-border" />
            <div className="h-3 w-32 rounded bg-surface-2" />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="h-8 w-56 rounded-lg bg-border" />
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-12 rounded-lg bg-surface-2" />
        ))}
      </div>
    </div>
  );
}
