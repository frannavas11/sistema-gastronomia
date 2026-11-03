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

  useEffect(() => {
    if (categories.length === 0) return;

    const observerCallback: IntersectionObserverCallback = (entries) => {
      const visibleEntry = entries.find((entry) => entry.isIntersecting);
      if (visibleEntry) {
        const catId = visibleEntry.target.id.replace("cat-", "");
        setInternalActiveId(catId);
        onCategoryChange?.(catId);

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
      rootMargin: "-20% 0px -70% 0px",
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
      className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200"
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
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${
                isActive
                  ? "bg-slate-900 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <span>{cat.name}</span>
              {typeof cat.productsCount === "number" && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-semibold ${
                    isActive
                      ? "bg-slate-800 text-slate-200"
                      : "bg-slate-200 text-slate-600"
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
