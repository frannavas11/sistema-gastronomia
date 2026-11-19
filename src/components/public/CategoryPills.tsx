"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

interface CategoryPillsProps {
  categories: Array<{ id: string; name: string }>;
}

/** Tiempo durante el cual se ignora el scroll-spy tras un clic (mientras dura el scroll suave). */
const CLICK_LOCK_MS = 900;

/**
 * Índice de categorías fijo arriba, estilo pestañas de revista con subrayado animado.
 * Resalta la sección visible al scrollear (scroll-spy) y centra la pestaña activa.
 */
export function CategoryPills({ categories }: CategoryPillsProps) {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? "");
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const isLocked = useRef(false);
  const unlockTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(unlockTimer.current), []);

  // Mantiene la pestaña activa visible dentro de la barra horizontal
  useEffect(() => {
    const tab = tabRefs.current.get(activeId);
    const container = containerRef.current;
    if (!tab || !container) return;
    container.scrollTo({
      left: tab.offsetLeft - container.clientWidth / 2 + tab.clientWidth / 2,
      behavior: "smooth",
    });
  }, [activeId]);

  // Scroll-spy: la sección que cruza la franja superior de la pantalla es la activa.
  // Antes también se re-disparaba mientras corría el scroll suave de un clic (saltos).
  useEffect(() => {
    if (categories.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isLocked.current) return;
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id.replace("cat-", ""));
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    for (const cat of categories) {
      const el = document.getElementById(`cat-${cat.id}`);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [categories]);

  const handleClick = (id: string) => {
    isLocked.current = true;
    clearTimeout(unlockTimer.current);
    unlockTimer.current = setTimeout(() => {
      isLocked.current = false;
    }, CLICK_LOCK_MS);
    setActiveId(id);
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (categories.length === 0) return null;

  return (
    <nav
      aria-label="Categorías del menú"
      className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border"
    >
      <div
        ref={containerRef}
        className="max-w-2xl mx-auto flex items-center gap-1 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((cat) => {
          const isActive = activeId === cat.id;
          return (
            <button
              key={cat.id}
              ref={(el) => {
                if (el) tabRefs.current.set(cat.id, el);
                else tabRefs.current.delete(cat.id);
              }}
              type="button"
              onClick={() => handleClick(cat.id)}
              aria-current={isActive ? "true" : undefined}
              className={`relative shrink-0 h-12 px-4 inline-flex items-center justify-center text-sm transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg ${
                isActive ? "text-text-primary font-semibold" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <span>{cat.name}</span>
              {isActive && (
                <motion.span
                  layoutId="category-underline"
                  className="absolute left-3 right-3 bottom-0 h-[2px] rounded-full bg-brand"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
