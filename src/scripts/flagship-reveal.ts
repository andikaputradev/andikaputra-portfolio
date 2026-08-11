import { gsap } from './gsap-core';

let mm: gsap.MatchMedia | undefined;

export function initFlagshipReveal(): void {
  mm?.revert();

  const section = document.querySelector<HTMLElement>('[data-flagship]');
  const textBlock = document.querySelector<HTMLElement>('[data-flagship-text]');
  if (!section || !textBlock) return;

  mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.set(textBlock, { opacity: 0, y: 40 });

    const tween = gsap.to(textBlock, {
      opacity: 1,
      y: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        end: 'top 30%',
        scrub: 0.6,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
    };
  });

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(textBlock, { opacity: 1, y: 0 });
  });
}
