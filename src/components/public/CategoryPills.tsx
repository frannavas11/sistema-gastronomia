"use client";

import { useEffect, useRef, useState } from "react";

interface CategoryPillsProps {
  categories: Array<{
    id: string;
    name: string;
    productsCount?: number;
  }>;
  activeCategoryId?: string;
  onCategoryChange?: (id: string) => void;
}

export function CategoryPills({
  categories,
  activeCategoryId: controlledActiveId,
  onCategoryChange,
}: CategoryPillsProps) {
  const [internalActiveId, setInternalActiveId] = useState<string>(
    categories[0]?.id ?? "",
  );
  const activeId = controlledActiveId ?? internalActiveId;

  const containerRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Manejo de clic en categoría: hace scroll suave hacia la sección correspondiente
  const handlePillClick = (id: string) => {
    setInternalActiveId(id);
    onCategoryChange?.(id);

    const targetElement = document.getElementById(`cat-${id}`);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    // Centrar la píldora seleccionada en el contenedor horizontal
    const pillElement = pillRefs.current.get(id);
    if (pillElement && containerRef.current) {
      const container = containerRef.current;
      const scrollLeft =
        pillElement.offsetLeft -
        container.clientWidth / 2 +
        pillElement.clientWidth / 2;
      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  };

  // Observa qué sección de categoría está visible en pantalla al scrollear
  useEffect(() => {
    if (categories.length === 0) return;

    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Buscar la primera sección intersectando cerca del viewport superior
      const visibleEntry = entries.find((entry) => entry.isIntersecting);
      if (visibleEntry) {
        const catId = visibleEntry.target.id.replace("cat-", "");
        setInternalActiveId(catId);
        onCategoryChange?.(catId);

        // Auto-scrollear la barra horizontal hacia la píldora activa
        const pillElement = pillRefs.current.get(catId);
        if (pillElement && containerRef.current) {
          const container = containerRef.current;
          const scrollLeft =
            pillElement.offsetLeft -
            container.clientWidth / 2 +
            pillElement.clientWidth / 2;
          container.scrollTo({
            left: scrollLeft,
            behavior: "smooth",
          });
        }
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: "-20% 0px -70% 0px", // Zona activa en la parte superior media
      threshold: 0,
    });

    categories.forEach((cat) => {
      const el = document.getElementById(`cat-${cat.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories, onCategoryChange]);

  if (categories.length === 0) return null;

  return (
    <nav
      aria-label="Categorías del menú"
      className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
    >
      <div
        ref={containerRef}
        className="max-w-3xl mx-auto flex items-center gap-2 overflow-x-auto px-4 py-2.5 touch-pan-x scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((cat) => {
          const isActive = activeId === cat.id;

          return (
            <button
              key={cat.id}
              ref={(el) => {
                if (el) {
                  pillRefs.current.set(cat.id, el);
                } else {
                  pillRefs.current.delete(cat.id);
                }
              }}
              onClick={() => handlePillClick(cat.id)}
              type="button"
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 select-none active:scale-95 ${
                isActive
                  ? "bg-[var(--store-primary,#e11d48)] text-white shadow-sm font-semibold"
                  : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <span>{cat.name}</span>
              {typeof cat.productsCount === "number" && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {cat.productsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

