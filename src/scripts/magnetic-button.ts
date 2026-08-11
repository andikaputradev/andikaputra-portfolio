import { gsap } from './gsap-core';

let mm: gsap.MatchMedia | undefined;

export function initMagneticButtons(selector = '[data-magnetic]'): void {
  mm?.revert();

  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!canHover) return;

  const buttons = document.querySelectorAll<HTMLElement>(selector);
  if (!buttons.length) return;

  mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const cleanups: Array<() => void> = [];

    buttons.forEach((btn) => {
      const strength = 0.35;
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' });
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' });

      const handleMove = (event: MouseEvent): void => {
        const rect = btn.getBoundingClientRect();
        const relX = event.clientX - rect.left - rect.width / 2;
        const relY = event.clientY - rect.top - rect.height / 2;
        xTo(relX * strength);
        yTo(relY * strength);
      };

      const handleLeave = (): void => {
        xTo(0);
        yTo(0);
      };

      btn.addEventListener('mousemove', handleMove);
      btn.addEventListener('mouseleave', handleLeave);

      cleanups.push(() => {
        btn.removeEventListener('mousemove', handleMove);
        btn.removeEventListener('mouseleave', handleLeave);
        gsap.set(btn, { x: 0, y: 0 });
      });
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  });
}
