export const RD_LAB = [
  {
    name: 'AETHER-OS',
    desc: 'Experimental x86_64 kernel written in Rust',
    tag: 'SYSTEMS',
  },
  {
    name: 'Gesture WebGL FX',
    desc: 'MediaPipe Hands + custom fragment shaders, single-file',
    tag: 'GRAPHICS',
  },
  {
    name: 'Termux System Banner',
    desc: 'Rich system-info terminal banner for rooted Android',
    tag: 'SYSTEMS',
  },
  {
    name: 'Bloomberg-style PWA Game',
    desc: 'Terminal-themed progressive web app game',
    tag: 'GAME',
  },
] as const;

export type RdLabEntry = (typeof RD_LAB)[number];
export type RdLabTag = RdLabEntry['tag'];
