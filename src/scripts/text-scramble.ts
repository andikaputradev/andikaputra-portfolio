import { prefersReducedMotion } from './gsap-core';

const SCRAMBLE_CHARS = '0123456789ABCDEF!<>-_/[]{}*^?#';

interface ScrambleInstance {
  el: HTMLElement;
  originalText: string;
  isScrambling: boolean;
  frameId?: number;
}

export function initTextScramble(selector = '[data-scramble]'): () => void {
  if (typeof window === 'undefined') return () => {};
  if (typeof navigator !== 'undefined' && navigator.webdriver) return () => {};

  const elements = document.querySelectorAll<HTMLElement>(selector);
  if (!elements.length) return () => {};

  const instances: ScrambleInstance[] = [];

  elements.forEach((el) => {
    const originalText = el.getAttribute('data-original-text') || el.textContent || '';
    if (!originalText) return;
    el.setAttribute('data-original-text', originalText);

    const instance: ScrambleInstance = {
      el,
      originalText,
      isScrambling: false,
    };

    const scramble = () => {
      if (instance.isScrambling || prefersReducedMotion()) return;
      instance.isScrambling = true;

      const chars = instance.originalText.split('');
      const totalChars = chars.length;
      const totalFrames = Math.min(24, Math.max(12, totalChars * 2));
      let frame = 0;

      const update = () => {
        frame++;
        const progress = frame / totalFrames;
        const settledIndex = Math.floor(progress * totalChars);

        const currentOutput = chars
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < settledIndex) return char;
            const randIdx = Math.floor(Math.random() * SCRAMBLE_CHARS.length);
            return SCRAMBLE_CHARS[randIdx];
          })
          .join('');

        instance.el.textContent = currentOutput;

        if (frame < totalFrames) {
          instance.frameId = requestAnimationFrame(update);
        } else {
          instance.el.textContent = instance.originalText;
          instance.isScrambling = false;
        }
      };

      instance.frameId = requestAnimationFrame(update);
    };

    const reset = () => {
      if (instance.frameId) {
        cancelAnimationFrame(instance.frameId);
      }
      instance.el.textContent = instance.originalText;
      instance.isScrambling = false;
    };

    el.addEventListener('mouseenter', scramble);
    el.addEventListener('focus', scramble);
    el.addEventListener('mouseleave', reset);
    el.addEventListener('blur', reset);

    instances.push(instance);
  });

  return () => {
    instances.forEach((inst) => {
      if (inst.frameId) cancelAnimationFrame(inst.frameId);
      inst.el.textContent = inst.originalText;
    });
  };
}
