let audioCtx: AudioContext | null = null;
let isAudioEnabled = true;

const SFX_STORAGE_KEY = 'wahyu_portfolio_sfx';

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(SFX_STORAGE_KEY);
  return stored !== 'off';
}

export function toggleSound(): boolean {
  isAudioEnabled = !isSoundEnabled();
  localStorage.setItem(SFX_STORAGE_KEY, isAudioEnabled ? 'on' : 'off');
  if (isAudioEnabled) {
    playMechanicalClick('toggle');
  }
  dispatchSoundStateChange();
  return isAudioEnabled;
}

function dispatchSoundStateChange(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('portfolio:sfx-change', { detail: { enabled: isAudioEnabled } }));
}

/**
 * Synthesizes an authentic mechanical switch tactile sound using Web Audio API
 */
export function playMechanicalClick(type: 'press' | 'release' | 'toggle' | 'tick' = 'press'): void {
  if (!isSoundEnabled()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    if (type === 'press') {
      // Tactile Switch Downstroke: Noise burst + damped body resonance
      const bufferSize = ctx.sampleRate * 0.015; // 15ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(2200, now);
      bandpass.Q.setValueAtTime(3.5, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);

      // Low frequency tactile "thock"
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.02);

      oscGain.gain.setValueAtTime(0.06, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.02);
    } else if (type === 'release') {
      // Switch Upstroke: Higher pitch, crisp release snap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(3400, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.01);

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.01);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.01);
    } else if (type === 'toggle') {
      // Cyber telemetry toggle beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(960, now);
      osc.frequency.setValueAtTime(1440, now + 0.04);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'tick') {
      // Subtle micro-interaction tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, now);

      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.006);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.006);
    }
  } catch {
    // Graceful fallback if Web Audio is restricted
  }
}

/**
 * Initializes global click and interactive tactile sound bindings
 */
export function initSoundFx(): () => void {
  if (typeof window === 'undefined') return () => {};

  isAudioEnabled = isSoundEnabled();

  const handlePointerDown = (e: MouseEvent | TouchEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const interactive = target.closest('button, a, [role="button"], input[type="submit"], input[type="checkbox"], summary, [data-filter-btn]');
    if (interactive) {
      playMechanicalClick('press');
    }
  };

  const handlePointerUp = (e: MouseEvent | TouchEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const interactive = target.closest('button, a, [role="button"], input[type="submit"], input[type="checkbox"], summary, [data-filter-btn]');
    if (interactive) {
      playMechanicalClick('release');
    }
  };

  document.addEventListener('mousedown', handlePointerDown, { passive: true });
  document.addEventListener('mouseup', handlePointerUp, { passive: true });

  return () => {
    document.removeEventListener('mousedown', handlePointerDown);
    document.removeEventListener('mouseup', handlePointerUp);
  };
}
