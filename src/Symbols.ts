// ============================================================
// Symbols.ts  —  All symbol definitions for the slot game
// ============================================================

export type SymbolId = 'H1' | 'H2' | 'H3' | 'H4' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'W' | 'S';

export interface SymbolDef {
  id:               SymbolId;
  name:             string;
  src:              string;
  animationFrames:  number;
}

export const SYMBOLS: Record<SymbolId, SymbolDef> = {
  // High-value symbols
  H1: { id: 'H1', name: 'Captain',   src: '/assets/images/captainbossman.png', animationFrames: 24 },
  H2: { id: 'H2', name: 'Swordsman', src: '/assets/images/zoro.png',           animationFrames: 24 },
  H3: { id: 'H3', name: 'Cook',      src: '/assets/images/sanji.png',          animationFrames: 24 },
  H4: { id: 'H4', name: 'Doctor',    src: '/assets/images/chopper.png',        animationFrames: 24 },

  // Low-value symbols
  L1: { id: 'L1', name: 'Navigator', src: '/assets/images/nami.png',           animationFrames: 16 },
  L2: { id: 'L2', name: 'Ace',       src: '/assets/images/pirate A.png',       animationFrames: 16 },
  L3: { id: 'L3', name: 'King',      src: '/assets/images/pirate K.png',       animationFrames: 16 },
  L4: { id: 'L4', name: 'Queen',     src: '/assets/images/pirate Q.png',       animationFrames: 16 },
  L5: { id: 'L5', name: 'Jack',      src: '/assets/images/pirate J.png',       animationFrames: 16 },

  // Special symbols
  W:  { id: 'W',  name: 'Wild',      src: '/assets/images/pirate wild.png',    animationFrames: 24 },
  S:  { id: 'S',  name: 'Scatter',   src: '/assets/images/pirate scatter.png', animationFrames: 24 },
};

/** Ordered list of all symbol IDs. */
export const SYMBOL_IDS = Object.keys(SYMBOLS) as SymbolId[];
