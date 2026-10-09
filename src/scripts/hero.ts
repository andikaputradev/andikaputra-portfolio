import { gsap } from './gsap-core';

let mm: gsap.MatchMedia | undefined;

export function initHeroEntrance(): void {
  mm?.revert();

  const eyebrow = document.querySelector<HTMLElement>('[data-hero-eyebrow]');
  const subhead = document.querySelector<HTMLElement>('[data-hero-subhead]');
  const ctas = document.querySelector<HTMLElement>('[data-hero-ctas]');

  const targets = [eyebrow, subhead, ctas].filter(
    (el): el is HTMLElement => el !== null,
  );
  if (!targets.length) return;

  mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (eyebrow) {
      tl.fromTo(eyebrow, { opacity: 0, y: 12, filter: 'blur(4px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5 });
    }

    // Heading LCP (<h1 class="hero__heading font-display">) dirender langsung
    // via HTML statis server-side 100% visible tanpa menunggu animasi teks / SplitText

    if (subhead) {
      tl.fromTo(subhead, { opacity: 0, y: 16, filter: 'blur(4px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6 }, '-=0.2');
    }

    if (ctas) {
      tl.fromTo(ctas, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3');
    }
  });

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(targets, { opacity: 1, y: 0, filter: 'none' });
  });
}
