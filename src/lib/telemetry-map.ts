export const STATUS_BY_SECTION: Record<string, string> = {
  hero: 'STATUS: ONLINE',
  philosophy: 'STATUS: AUTHENTICATED',
  expertise: 'STATUS: CALIBRATED',
  security: 'STATUS: AUTHORIZED-ONLY',
  work: 'STATUS: VERIFIED',
  web3: 'STATUS: CHAIN-VERIFIED',
  'rd-lab': 'STATUS: EXPERIMENTAL',
  contact: 'STATUS: AWAITING-INPUT',
};

export const PATH_BY_SECTION: Record<string, string> = {
  hero: '/home/wahyu',
  philosophy: '/home/wahyu/philosophy',
  expertise: '/home/wahyu/expertise',
  security: '/home/wahyu/security',
  work: '/home/wahyu/work',
  web3: '/home/wahyu/web3',
  'rd-lab': '/home/wahyu/lab',
  contact: '/home/wahyu/contact',
};

export function getTelemetryStatus(sectionKey: string): string {
  return STATUS_BY_SECTION[sectionKey] ?? 'STATUS: ONLINE';
}

export function getTelemetryPath(sectionKey: string): string {
  return PATH_BY_SECTION[sectionKey] ?? '/home/wahyu';
}
