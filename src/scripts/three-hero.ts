import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  BufferGeometry,
  Points,
  PointsMaterial,
  BufferAttribute,
} from 'three';
import { prefersReducedMotion } from './gsap-core';

type HeroParticlesConfig = {
  canvas: HTMLCanvasElement;
  color?: number;
  opacity?: number;
  rotationSpeed?: number;
  particleCountDesktop?: number;
  particleCountMobile?: number;
};

function isLowPower(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 4) return true;
  if (nav.deviceMemory && nav.deviceMemory < 4) return true;
  if (nav.connection?.saveData) return true;
  return false;
}

export async function initHeroParticles(config: HeroParticlesConfig): Promise<() => void> {
  const {
    canvas,
    color = 0xc97d3f,
    opacity = 0.55,
    rotationSpeed = 0.0006,
    particleCountDesktop = 1600,
    particleCountMobile = 400,
  } = config;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const lowPower = isLowPower();
  const particleCount = isMobile
    ? (lowPower ? 200 : particleCountMobile)
    : (lowPower ? 800 : particleCountDesktop);

  const renderer = new WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: 'low-power',
  });

  const scene = new Scene();
  const camera = new PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 8;

  const geometry = new BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 12;
  }
  geometry.setAttribute('position', new BufferAttribute(positions, 3));

  const material = new PointsMaterial({
    size: 0.02,
    color,
    transparent: true,
    opacity,
  });

  const points = new Points(geometry, material);
  scene.add(points);

  const { width, height } = canvas.getBoundingClientRect();
  renderer.setSize(width, height);
  renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5));

  const reduced = prefersReducedMotion();
  let animFrameId = 0;
  let disposed = false;

  function animate(): void {
    if (disposed) return;
    animFrameId = requestAnimationFrame(animate);
    points.rotation.y += rotationSpeed;
    points.rotation.x += rotationSpeed / 6;
    renderer.render(scene, camera);
  }

  if (reduced) {
    renderer.render(scene, camera);
  } else {
    animate();
  }

  const handleResize = (): void => {
    const { width: w, height: h } = canvas.getBoundingClientRect();
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    if (reduced) {
      renderer.render(scene, camera);
    }
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

  return dispose;
}

let activeDisposers: Array<() => void> = [];

export function mountParticleCanvas(
  canvasSelector: string,
  particleConfig: Omit<HeroParticlesConfig, 'canvas'> = {},
): void {
  const canvas = document.querySelector<HTMLCanvasElement>(canvasSelector);
  if (!canvas) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        observer.disconnect();
        initHeroParticles({ canvas, ...particleConfig }).then((dispose) => {
          activeDisposers.push(dispose);
        });
      }
    },
    { threshold: 0.1 },
  );

  observer.observe(canvas);
}

function disposeAllParticleCanvases(): void {
  activeDisposers.forEach((dispose) => dispose());
  activeDisposers = [];
}

document.addEventListener('astro:before-swap', disposeAllParticleCanvases);
