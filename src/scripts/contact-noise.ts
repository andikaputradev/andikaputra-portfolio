import { prefersReducedMotion } from './gsap-core';

let activeDisposers: Array<() => void> = [];

export function initNoiseBackground(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  const width = Math.floor(rect.width / 2) || 300;
  const height = Math.floor(rect.height / 2) || 200;
  canvas.width = width;
  canvas.height = height;

  const reduced = prefersReducedMotion();
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // Pre-generate subtle grain pattern
  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = 128;
  noiseCanvas.height = 128;
  const nCtx = noiseCanvas.getContext('2d');
  if (nCtx) {
    const nData = nCtx.createImageData(128, 128);
    const buf = nData.data;
    for (let i = 0; i < buf.length; i += 4) {
      if (Math.random() < 0.08) {
        buf[i] = 201;     // Phosphor Amber R
        buf[i + 1] = 125; // G
        buf[i + 2] = 63;  // B
        buf[i + 3] = 10;  // Alpha
      }
    }
    nCtx.putImageData(nData, 0, 0);
  }

  if (reduced || isMobile) {
    if (nCtx) {
      ctx.fillStyle = ctx.createPattern(noiseCanvas, 'repeat') || 'transparent';
      ctx.fillRect(0, 0, width, height);
    }
    return;
  }

  let animFrameId = 0;
  let disposed = false;
  let frame = 0;

  function render(): void {
    if (disposed || !ctx) return;
    frame++;
    // Throttle rendering to ~20fps to keep main thread completely idle
    if (frame % 3 === 0 && nCtx) {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = ctx.createPattern(noiseCanvas, 'repeat') || 'transparent';
      ctx.fillRect(0, 0, width, height);
    }
    animFrameId = requestAnimationFrame(render);
  }

  render();

  function dispose(): void {
    disposed = true;
    cancelAnimationFrame(animFrameId);
  }

  activeDisposers.push(dispose);
}

export function mountNoiseCanvas(canvasSelector: string): void {
  const canvas = document.querySelector<HTMLCanvasElement>(canvasSelector);
  if (!canvas) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        observer.disconnect();
        initNoiseBackground(canvas);
      }
    },
    { threshold: 0.1 },
  );

  observer.observe(canvas);
}

function disposeAllNoiseCanvases(): void {
  activeDisposers.forEach((dispose) => dispose());
  activeDisposers = [];
}

document.addEventListener('astro:before-swap', disposeAllNoiseCanvases);
