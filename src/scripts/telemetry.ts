import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap-core';
import { getTelemetryStatus, getTelemetryPath } from '../lib/telemetry-map';

let telemetryTriggers: ScrollTrigger[] = [];
let clockInterval: ReturnType<typeof setInterval> | null = null;

function updateClock(): void {
  const el = document.querySelector<HTMLElement>('#telemetry-clock');
  if (!el) return;
  const now = new Date();
  const pad = (n: number): string => String(n).padStart(2, '0');
  el.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function updateTelemetry(sectionKey: string): void {
  const statusEl = document.querySelector<HTMLElement>('#telemetry-status');
  const pathEl = document.querySelector<HTMLElement>('#telemetry-path');
  if (!statusEl || !pathEl) return;

  const newStatus = getTelemetryStatus(sectionKey);
  const newPath = getTelemetryPath(sectionKey);

  if (prefersReducedMotion()) {
    statusEl.textContent = newStatus;
    pathEl.textContent = newPath;
    return;
  }

  gsap.to(statusEl, {
    opacity: 0,
    duration: 0.12,
    onComplete: () => {
      statusEl.textContent = newStatus;
      gsap.to(statusEl, { opacity: 1, duration: 0.12 });
    },
  });
  pathEl.textContent = newPath;
}

export function initTelemetry(): void {
  telemetryTriggers.forEach((t) => t.kill());
  telemetryTriggers = [];

  if (!clockInterval) {
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
  }

  document.querySelectorAll<HTMLElement>('[data-telemetry-section]').forEach((section) => {
    const key = section.dataset.telemetrySection ?? '';
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => updateTelemetry(key),
      onEnterBack: () => updateTelemetry(key),
    });
    telemetryTriggers.push(trigger);
  });
}
