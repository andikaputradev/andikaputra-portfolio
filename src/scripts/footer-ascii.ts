import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap-core';

export function initFooterReveal(containerSelector = '[data-footer-ascii]'): void {
  const container = document.querySelector<HTMLElement>(containerSelector);
  if (!container) return;

  const lines = container.querySelectorAll<HTMLElement>('.footer-ascii__line');
  if (!lines.length) return;

  if (prefersReducedMotion()) {
    gsap.set(lines, { opacity: 1, y: 0 });
    return;
  }

  gsap.set(lines, { opacity: 0, y: 18 });

  ScrollTrigger.create({
    trigger: container,
    start: 'top 88%',
    once: true,
    onEnter: () => {
      gsap.to(lines, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.09,
        ease: 'power2.out',
      });
    },
  });
}
