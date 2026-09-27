import { prefersReducedMotion } from './gsap-core';

export function initSpotlightCards(selector = '[data-spotlight]'): () => void {
  if (typeof window === 'undefined') return () => {};
  if (typeof navigator !== 'undefined' && navigator.webdriver) return () => {};

  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!canHover || prefersReducedMotion()) return () => {};

  const cards = document.querySelectorAll<HTMLElement>(selector);
  if (!cards.length) return () => {};

  const cleanups: Array<() => void> = [];

  cards.forEach((card) => {
    let rafId: number | null = null;

    const handlePointerMove = (e: PointerEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    };

    const handlePointerLeave = () => {
      if (rafId) cancelAnimationFrame(rafId);
      card.style.removeProperty('--mouse-x');
      card.style.removeProperty('--mouse-y');
    };

    card.addEventListener('pointermove', handlePointerMove);
    card.addEventListener('pointerleave', handlePointerLeave);

    cleanups.push(() => {
      if (rafId) cancelAnimationFrame(rafId);
      card.removeEventListener('pointermove', handlePointerMove);
      card.removeEventListener('pointerleave', handlePointerLeave);
      card.style.removeProperty('--mouse-x');
      card.style.removeProperty('--mouse-y');
    });
  });

  return () => {
    cleanups.forEach((c) => c());
  };
}
