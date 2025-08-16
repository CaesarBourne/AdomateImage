// You give it a ref to a DOM element.

// It measures the element’s width & height right now.

// If the element or the browser window changes size, it updates the measurement.

// It gives you { width, height } back to use in your component.


'use client';

import { useEffect, useState } from 'react';

export function useViewportBox<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  enabled: boolean = true
) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!enabled) return;

    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const w = Math.max(0, Math.round(rect.width));
      const h = Math.max(0, Math.round(rect.height));
      setSize({ width: w, height: h });
    };

    const raf = requestAnimationFrame(measure);

    const ro = new ResizeObserver(measure);
    ro.observe(el);

    window.addEventListener('resize', measure);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [ref, enabled]); 
  return size;
}
