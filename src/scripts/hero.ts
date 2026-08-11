import { gsap, SplitText } from './gsap-core';

let mm: gsap.MatchMedia | undefined;

export function initHeroEntrance(): void {
  mm?.revert();

  const eyebrow = document.querySelector<HTMLElement>('[data-hero-eyebrow]');
  const heading = document.querySelector<HTMLElement>('[data-hero-heading]');
  const subhead = document.querySelector<HTMLElement>('[data-hero-subhead]');
  const ctas = document.querySelector<HTMLElement>('[data-hero-ctas]');

  const targets = [eyebrow, heading, subhead, ctas].filter(
    (el): el is HTMLElement => el !== null,
  );
  if (!targets.length) return;

  mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    let split: SplitText | undefined;

    if (eyebrow) {
      tl.fromTo(eyebrow, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 });
    }

    if (heading) {
      split = new SplitText(heading, { type: 'chars', charsClass: 'hero-char' });
      tl.set(heading, { opacity: 1 }, eyebrow ? '-=0.2' : 0);
      tl.fromTo(
        split.chars,
        { opacity: 0, yPercent: 110 },
        { opacity: 1, yPercent: 0, duration: 0.7, stagger: 0.018 },
        '<',
      );
    }

    if (subhead) {
      tl.fromTo(subhead, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.35');
    }

    if (ctas) {
      tl.fromTo(ctas, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');
    }

    return () => {
      split?.revert();
    };
  });

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(targets, { opacity: 1, y: 0 });
  });
}
