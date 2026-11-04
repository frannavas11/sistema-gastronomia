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
      className="sticky top-0 z-30 bg-[#FBF5EF]/95 backdrop-blur-md border-b border-[#E9DAD2] py-2"
    >
      <div
        ref={containerRef}
        className="max-w-2xl mx-auto flex items-center gap-2 overflow-x-auto px-4 touch-pan-x scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
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
              className={`shrink-0 min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-primary)] focus-visible:ring-offset-2 ${
                isActive
                  ? "bg-[var(--store-primary)] text-[var(--store-primary-contrast)] shadow-xs"
                  : "bg-[#FFFCF8] text-[#74645E] hover:text-[#211B19] hover:bg-[#F6EBE4] border border-[#E9DAD2]"
              }`}
            >
              <span>{cat.name}</span>
              {typeof cat.productsCount === "number" && (
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full tabular-nums font-semibold ${
                    isActive
                      ? "bg-black/20 text-inherit"
                      : "bg-[#F6EBE4] text-[#74645E]"
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
