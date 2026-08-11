import { describe, expect, it } from 'vitest';
import { getTelemetryStatus, getTelemetryPath } from '../../src/lib/telemetry-map';

describe('getTelemetryStatus', () => {
  it('returns the correct status for each known section', () => {
    expect(getTelemetryStatus('hero')).toBe('STATUS: ONLINE');
    expect(getTelemetryStatus('philosophy')).toBe('STATUS: AUTHENTICATED');
    expect(getTelemetryStatus('expertise')).toBe('STATUS: CALIBRATED');
    expect(getTelemetryStatus('security')).toBe('STATUS: AUTHORIZED-ONLY');
    expect(getTelemetryStatus('work')).toBe('STATUS: VERIFIED');
    expect(getTelemetryStatus('web3')).toBe('STATUS: CHAIN-VERIFIED');
    expect(getTelemetryStatus('rd-lab')).toBe('STATUS: EXPERIMENTAL');
    expect(getTelemetryStatus('contact')).toBe('STATUS: AWAITING-INPUT');
  });

  it('falls back to STATUS: ONLINE for an unknown section key', () => {
    expect(getTelemetryStatus('unknown-section')).toBe('STATUS: ONLINE');
    expect(getTelemetryStatus('')).toBe('STATUS: ONLINE');
  });
});

describe('getTelemetryPath', () => {
  it('returns the correct path for each known section', () => {
    expect(getTelemetryPath('hero')).toBe('/home/wahyu');
    expect(getTelemetryPath('security')).toBe('/home/wahyu/security');
    expect(getTelemetryPath('rd-lab')).toBe('/home/wahyu/lab');
    expect(getTelemetryPath('contact')).toBe('/home/wahyu/contact');
  });

  it('falls back to /home/wahyu for an unknown section key', () => {
    expect(getTelemetryPath('unknown-section')).toBe('/home/wahyu');
  });
});
