import { animate, stagger } from 'animejs';
import { prefersReducedMotion } from './gsap-core';

export function initRdLabEntrance(containerSelector = '.rd-lab-list'): void {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const items = container.querySelectorAll<HTMLElement>('.rd-lab-item');
  if (!items.length) return;

  const reduced = prefersReducedMotion();

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting) return;
      observer.disconnect();

      animate(items, {
        translateY: reduced ? 0 : [24, 0],
        opacity: [0, 1],
        duration: reduced ? 0 : 480,
        delay: stagger(reduced ? 0 : 80),
        ease: 'outExpo',
      });
    },
    { threshold: 0.2 },
  );

  observer.observe(container);
}

export function initSocialEntrance(containerSelector = '.contact-socials'): void {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const links = container.querySelectorAll<HTMLElement>('a');
  if (!links.length) return;

  const reduced = prefersReducedMotion();

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting) return;
      observer.disconnect();

      animate(links, {
        translateY: reduced ? 0 : [16, 0],
        opacity: [0, 1],
        duration: reduced ? 0 : 400,
        delay: stagger(reduced ? 0 : 60, { from: 'first' }),
        ease: 'outCubic',
      });
    },
    { threshold: 0.3 },
  );

  observer.observe(container);
}

export function initExpertiseReveal(containerSelector = '#expertise-groups'): void {
  const container = document.querySelector<HTMLElement>(containerSelector);
  if (!container) return;

  const panels = container.querySelectorAll<HTMLElement>('.expertise-panel');
  if (!panels.length) return;

  const reduced = prefersReducedMotion();

  if (reduced) {
    panels.forEach((panel) => {
      panel.style.opacity = '1';
      panel.style.transform = 'none';
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting) return;
      observer.disconnect();

      animate(panels, {
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 550,
        delay: stagger(110),
        ease: 'outExpo',
      });

      panels.forEach((panel, panelIndex) => {
        const chips = panel.querySelectorAll<HTMLElement>('.expertise-chip');
        if (!chips.length) return;
        animate(chips, {
          opacity: [0, 1],
          duration: 350,
          delay: stagger(18, { start: 250 + panelIndex * 110 }),
          ease: 'outQuad',
        });
      });
    },
    { threshold: 0.15 },
  );

  observer.observe(container);
}
