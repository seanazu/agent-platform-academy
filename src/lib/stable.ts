import { useEffect, useRef, type RefObject } from 'react';

// An element keeps the tallest height it has had, so nothing below it moves up when its content gets
// shorter. The lock resets when the width changes by more than a few pixels (a different layout) or when
// resetKey changes (another lesson).
export const useGrowOnly = <T extends HTMLElement>(resetKey?: unknown): RefObject<T | null> => {
  const ref = useRef<T | null>(null);
  const max = useRef(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.minHeight = '';
    max.current = el.getBoundingClientRect().height;
    el.style.minHeight = `${max.current}px`;
  }, [resetKey]);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    let width = el.getBoundingClientRect().width;
    const ro = new ResizeObserver((entries) => {
      const w = el.getBoundingClientRect().width;
      if (Math.abs(w - width) > 24) {
        width = w;
        max.current = 0;
        el.style.minHeight = '';
      }
      const entry = entries[entries.length - 1];
      const box = entry?.borderBoxSize?.[0];
      const h = box ? box.blockSize : el.offsetHeight;
      if (h > max.current) {
        max.current = h;
        el.style.minHeight = `${h}px`;
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return ref;
};
