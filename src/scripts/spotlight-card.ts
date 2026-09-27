import { prefersReducedMotion } from './gsap-core';

export function initSpotlightCards(selector = '[data-spotlight]'): () => void {
  if (typeof window === 'undefined') return () => {};
  if (typeof navigator !== 'undefined' && navigator.webdriver) return () => {};
  if (prefersReducedMotion()) return () => {};

  const cards = document.querySelectorAll<HTMLElement>(selector);
  if (!cards.length) return () => {};

  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const cleanups: Array<() => void> = [];

  if (canHover) {
    // Desktop: pointermove tracking
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

      card.addEventListener('pointermove', handlePointerMove, { passive: true });
      card.addEventListener('pointerleave', handlePointerLeave, { passive: true });

      cleanups.push(() => {
        if (rafId) cancelAnimationFrame(rafId);
        card.removeEventListener('pointermove', handlePointerMove);
        card.removeEventListener('pointerleave', handlePointerLeave);
        card.style.removeProperty('--mouse-x');
        card.style.removeProperty('--mouse-y');
      });
    });
  } else {
    // Mobile / Touch Devices: touch tracking + scroll illumination
    cards.forEach((card) => {
      let touchTimeout: ReturnType<typeof setTimeout> | null = null;

      const handleTouch = (e: TouchEvent) => {
        const touch = e.touches[0];
        if (!touch) return;
        const rect = card.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
        card.classList.add('is-touched');

        if (touchTimeout) clearTimeout(touchTimeout);
        touchTimeout = setTimeout(() => {
          card.classList.remove('is-touched');
        }, 1800);
      };

      card.addEventListener('touchstart', handleTouch, { passive: true });
      card.addEventListener('touchmove', handleTouch, { passive: true });

      cleanups.push(() => {
        if (touchTimeout) clearTimeout(touchTimeout);
        card.removeEventListener('touchstart', handleTouch);
        card.removeEventListener('touchmove', handleTouch);
        card.classList.remove('is-touched');
      });
    });

    // Mobile scroll-in illumination
    if ('IntersectionObserver' in window) {
      const scrollObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const el = entry.target as HTMLElement;
            if (entry.isIntersecting) {
              const rect = el.getBoundingClientRect();
              el.style.setProperty('--mouse-x', `${rect.width / 2}px`);
              el.style.setProperty('--mouse-y', '30px');
              el.classList.add('is-in-view');
            } else {
              el.classList.remove('is-in-view');
            }
          });
        },
        { rootMargin: '-15% 0px -15% 0px', threshold: 0.2 },
      );

      cards.forEach((card) => scrollObserver.observe(card));
      cleanups.push(() => scrollObserver.disconnect());
    }
  }

  return () => {
    cleanups.forEach((c) => c());
  };
}
