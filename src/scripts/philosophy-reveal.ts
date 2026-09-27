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
      gsap.set(sentence, { opacity: 0.22, filter: 'blur(4px)', y: 12 });

      const tween = gsap.to(sentence, {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sentence,
          start: 'top 85%',
          end: 'top 50%',
          scrub: 0.6,
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
    gsap.set(sentences, { opacity: 1, filter: 'blur(0px)', y: 0 });
  });
}
