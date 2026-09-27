import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  BufferGeometry,
  Points,
  PointsMaterial,
  BufferAttribute,
  Color,
} from 'three';
import { prefersReducedMotion } from './gsap-core';

type HeroParticlesConfig = {
  canvas: HTMLCanvasElement;
  color?: number;
  secondaryColor?: number;
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
    color = 0xd4973b, // Radiant Amber Phosphor
    secondaryColor = 0x5ec4d6, // Telemetry Cyan / Steel Web3
    opacity = 0.55,
    rotationSpeed = 0.0008,
    particleCountDesktop = 1800,
    particleCountMobile = 500,
  } = config;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const lowPower = isLowPower();
  const particleCount = isMobile
    ? (lowPower ? 250 : particleCountMobile)
    : (lowPower ? 900 : particleCountDesktop);

  const renderer = new WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: 'low-power',
  });

  const scene = new Scene();
  const camera = new PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 7.5;

  const geometry = new BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const basePositions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorPrimary = new Color(color);
  const colorSecondary = new Color(secondaryColor);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    // Cyber constellation distribution: layered disk with depth
    const radius = Math.sqrt(Math.random()) * 6.5;
    const theta = Math.random() * Math.PI * 2;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    const y = (Math.random() - 0.5) * 4.5;

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    basePositions[i3] = x;
    basePositions[i3 + 1] = y;
    basePositions[i3 + 2] = z;

    // Dual-tone color assignment: ~80% primary phosphor, ~20% cyan telemetry
    const isSec = Math.random() > 0.78;
    const chosenColor = isSec ? colorSecondary : colorPrimary;
    colors[i3] = chosenColor.r;
    colors[i3 + 1] = chosenColor.g;
    colors[i3 + 2] = chosenColor.b;
  }

  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('color', new BufferAttribute(colors, 3));

  const material = new PointsMaterial({
    size: isMobile ? 0.025 : 0.028,
    vertexColors: true,
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
  let clock = 0;

  // Mouse parallax interaction
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;

  const handlePointerMove = (e: MouseEvent) => {
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    mouseX = (e.clientX - windowHalfX) * 0.0003;
    mouseY = (e.clientY - windowHalfY) * 0.0003;
  };

  if (!isMobile && !reduced) {
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
  }

  function animate(): void {
    if (disposed) return;
    animFrameId = requestAnimationFrame(animate);
    clock += 0.012;

    targetRotationY += (mouseX - targetRotationY) * 0.04;
    targetRotationX += (mouseY - targetRotationX) * 0.04;

    points.rotation.y += rotationSpeed;
    points.rotation.x = targetRotationX;

    // Subtle cyber wave undulating ripple
    if (!lowPower) {
      const posAttr = geometry.attributes.position as BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      // Update a slice of particles per frame for peak 60fps performance
      const step = 2;
      for (let i = 0; i < particleCount; i += step) {
        const i3 = i * 3;
        const bx = basePositions[i3];
        const bz = basePositions[i3 + 2];
        posArray[i3 + 1] = basePositions[i3 + 1] + Math.sin(clock + bx * 0.45) * 0.22 + Math.cos(clock * 0.7 + bz * 0.45) * 0.15;
      }
      posAttr.needsUpdate = true;
    }

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
    window.removeEventListener('mousemove', handlePointerMove);
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
