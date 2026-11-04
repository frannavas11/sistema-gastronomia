export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Cabecera Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[#E9DAD2]">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-[#E9DAD2] rounded-xl" />
          <div className="h-4 w-72 bg-[#F6EBE4] rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-36 bg-[#FFFCF8] border border-[#E9DAD2] rounded-xl" />
          <div className="h-10 w-28 bg-[#FFFCF8] border border-[#E9DAD2] rounded-xl" />
        </div>
      </div>

      {/* Switch Estado Local Skeleton */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFCF8] border border-[#E9DAD2] flex justify-between items-center">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#F6EBE4]" />
          <div className="space-y-1.5">
            <div className="h-5 w-36 bg-[#E9DAD2] rounded-lg" />
            <div className="h-3 w-64 bg-[#F6EBE4] rounded" />
          </div>
        </div>
        <div className="h-11 w-20 rounded-full bg-[#E9DAD2]" />
      </div>

      {/* 3 Tarjetas de Métricas Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="p-5 rounded-2xl bg-[#FFFCF8] border border-[#E9DAD2] space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-32 bg-[#F6EBE4] rounded" />
              <div className="w-9 h-9 rounded-xl bg-[#F6EBE4]" />
            </div>
            <div className="h-8 w-16 bg-[#E9DAD2] rounded-xl" />
            <div className="h-3 w-28 bg-[#F6EBE4] rounded" />
          </div>
        ))}
      </div>

      {/* Pedidos recientes Skeleton */}
      <div className="bg-[#FFFCF8] border border-[#E9DAD2] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-[#E9DAD2]">
          <div className="space-y-1">
            <div className="h-5 w-40 bg-[#E9DAD2] rounded-lg" />
            <div className="h-3 w-56 bg-[#F6EBE4] rounded" />
          </div>
          <div className="h-4 w-28 bg-[#F6EBE4] rounded" />
        </div>

        <div className="divide-y divide-[#E9DAD2]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="py-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F6EBE4]" />
                <div className="space-y-1">
                  <div className="h-4 w-32 bg-[#E9DAD2] rounded" />
                  <div className="h-3 w-24 bg-[#F6EBE4] rounded" />
                </div>
              </div>
              <div className="h-5 w-20 bg-[#E9DAD2] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
