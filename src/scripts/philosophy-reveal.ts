import { gsap, ScrollTrigger } from './gsap-core';

let mm: gsap.MatchMedia | undefined;

export function initPhilosophyReveal(): void {
  mm?.revert();

  const sentences = document.querySelectorAll<HTMLElement>('[data-philosophy-sentence]');
  if (!sentences.length) return;

  mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const triggers: ScrollTrigger[] = [];

    sentences.forEach((sentence) => {
      gsap.set(sentence, { clipPath: 'inset(0 100% 0 0)', opacity: 1 });

      const tween = gsap.to(sentence, {
        clipPath: 'inset(0 0% 0 0)',
        ease: 'none',
        scrollTrigger: {
          trigger: sentence,
          start: 'top 82%',
          end: 'top 42%',
          scrub: 0.5,
        },
      });

      if (tween.scrollTrigger) {
        triggers.push(tween.scrollTrigger);
      }
    });

    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  });

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(sentences, { clipPath: 'inset(0 0% 0 0)', opacity: 1 });
  });
}
