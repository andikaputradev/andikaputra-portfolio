import { gsap, Flip, prefersReducedMotion } from './gsap-core';

export function initProjectFilter(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-filter-btn]');
  const grid = document.querySelector<HTMLElement>('[data-project-grid]');
  if (!buttons.length || !grid) return;

  const cards = grid.querySelectorAll<HTMLElement>('[data-project-card]');
  if (!cards.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filterValue = btn.dataset.filterBtn ?? 'ALL';

      buttons.forEach((b) => {
        b.setAttribute('aria-pressed', String(b === btn));
      });

      const reduced = prefersReducedMotion();
      const state = reduced ? null : Flip.getState(cards, { props: 'opacity' });

      cards.forEach((card) => {
        const tag = card.dataset.projectTag;
        const shouldShow = filterValue === 'ALL' || tag === filterValue;
        card.classList.toggle('is-filtered-out', !shouldShow);
      });

      if (state) {
        Flip.from(state, {
          duration: 0.5,
          ease: 'power2.inOut',
          absolute: true,
          onEnter: (elements) =>
            gsap.fromTo(
              elements,
              { opacity: 0, scale: 0.92 },
              { opacity: 1, scale: 1, duration: 0.4, delay: 0.15 },
            ),
          onLeave: (elements) => gsap.to(elements, { opacity: 0, scale: 0.92, duration: 0.3 }),
        });
      }
    });
  });
}
