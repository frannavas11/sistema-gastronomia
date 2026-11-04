export default function StoreCatalogLoading() {
  return (
    <div className="min-h-screen bg-[#FBF5EF] text-[#211B19] pb-12 animate-pulse">
      {/* Header Portada Skeleton */}
      <header className="relative bg-[#FFFCF8] border-b border-[#E9DAD2]">
        <div className="relative w-full h-44 sm:h-56 md:h-64 bg-[#F6EBE4]">
          {/* Borde inferior ondulado */}
          <div className="absolute -bottom-1 inset-x-0 overflow-hidden leading-none z-10 pointer-events-none">
            <svg
              className="relative block w-full h-4 sm:h-6 md:h-8 text-[#FFFCF8]"
              viewBox="0 0 1440 80"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M0,32 C240,75 480,85 720,50 C960,15 1200,65 1440,32 L1440,80 L0,80 Z"
              />
            </svg>
          </div>
        </div>

        {/* Info del local Skeleton */}
        <div className="max-w-2xl mx-auto px-4 pb-5">
          <div className="flex justify-center">
            <div className="relative -mt-12 sm:-mt-14 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#FFFCF8] shadow-sm bg-[#E9DAD2] overflow-hidden" />
          </div>

          <div className="mt-3 flex flex-col items-center space-y-2.5">
            <div className="h-7 w-48 bg-[#E9DAD2] rounded-xl" />
            <div className="h-4 w-32 bg-[#F6EBE4] rounded-lg" />
            <div className="flex gap-4 pt-1">
              <div className="h-4 w-24 bg-[#F6EBE4] rounded-lg" />
              <div className="h-4 w-24 bg-[#F6EBE4] rounded-lg" />
            </div>
          </div>
        </div>
      </header>

      {/* Píldoras de Categorías Skeleton */}
      <div className="max-w-2xl mx-auto px-4 py-3 flex gap-2 overflow-hidden border-b border-[#E9DAD2]/60">
        <div className="h-10 w-24 bg-[#E9DAD2] rounded-full shrink-0" />
        <div className="h-10 w-28 bg-[#FFFCF8] border border-[#E9DAD2] rounded-full shrink-0" />
        <div className="h-10 w-24 bg-[#FFFCF8] border border-[#E9DAD2] rounded-full shrink-0" />
        <div className="h-10 w-20 bg-[#FFFCF8] border border-[#E9DAD2] rounded-full shrink-0" />
      </div>

      {/* Tarjetas de Productos Skeleton */}
      <main className="max-w-2xl mx-auto px-4 mt-6 space-y-4">
        <div className="h-6 w-36 bg-[#E9DAD2] rounded-lg mb-2" />

        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="bg-[#FFFCF8] rounded-2xl p-3 sm:p-4 border border-[#E9DAD2] flex gap-3 sm:gap-4"
          >
            {/* Foto Skeleton */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-[#F6EBE4] border border-[#E9DAD2] shrink-0" />

            {/* Info Skeleton */}
            <div className="flex-1 flex flex-col justify-between py-1">
              <div className="space-y-2">
                <div className="h-5 w-40 bg-[#E9DAD2] rounded-lg" />
                <div className="h-3 w-56 bg-[#F6EBE4] rounded" />
                <div className="h-3 w-32 bg-[#F6EBE4] rounded" />
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-5 w-16 bg-[#E9DAD2] rounded" />
                <div className="h-9 w-24 bg-[#E9DAD2] rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
