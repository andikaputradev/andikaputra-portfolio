import { Scene, OrthographicCamera, PlaneGeometry, Mesh } from 'three';
import { WebGPURenderer, MeshBasicNodeMaterial } from 'three/webgpu';
import { uv, vec2, vec3, sin, fract, dot, time } from 'three/tsl';
import { prefersReducedMotion } from './gsap-core';

let activeDisposers: Array<() => void> = [];

export async function initNoiseBackground(canvas: HTMLCanvasElement): Promise<void> {
  const renderer = new WebGPURenderer({ canvas, antialias: false, alpha: true });
  await renderer.init();

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const geometry = new PlaneGeometry(2, 2);

  const noiseCoord = uv().mul(160).add(vec2(0, time.mul(0.025)));
  const randomValue = fract(sin(dot(noiseCoord, vec2(12.9898, 78.233))).mul(43758.5453123));

  const material = new MeshBasicNodeMaterial({ transparent: true });
  material.colorNode = vec3(0.788, 0.49, 0.247);
  material.opacityNode = randomValue.mul(0.045);

  const mesh = new Mesh(geometry, material);
  scene.add(mesh);

  const { width, height } = canvas.getBoundingClientRect();
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  const reduced = prefersReducedMotion();
  let animFrameId: number;
  let disposed = false;

  function animate(): void {
    if (disposed) return;
    animFrameId = requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  if (reduced) {
    renderer.render(scene, camera);
  } else {
    animate();
  }

  const handleResize = (): void => {
    const { width: w, height: h } = canvas.getBoundingClientRect();
    renderer.setSize(w, h);
    if (reduced) renderer.render(scene, camera);
  };

  window.addEventListener('resize', handleResize);

  function dispose(): void {
    disposed = true;
    cancelAnimationFrame(animFrameId);
    window.removeEventListener('resize', handleResize);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
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
