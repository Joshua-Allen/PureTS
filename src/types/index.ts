// ============================================================
// types/index.ts  —  Shared TypeScript interfaces and type aliases
// ============================================================

// ---- Geometry ----------------------------------------------------
export interface Vector2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ---- Assets ----------------------------------------------------
export interface Asset       { key: string; src: string; }
export interface ImageAsset  extends Asset { image: HTMLImageElement; }
export interface AudioAsset  extends Asset { loop: boolean; volume: number; }
export interface FontAsset   extends Asset { family: string; }

import type { Screen } from '../screens/Screen';

// ---- Event map ---------------------------------------------------
// Add a new entry here for every event in the game.
// Key   = event name (used in EventBus.on / EventBus.emit)
// Value = the data payload type for that event
// ------------------------------------------------------------------
export interface GameEvents {
  'screen:transition': { screen: Screen };
  'screen:entered':    { name: string };
  'player:died':       { score: number };
  'player:scored':     { points: number };
  'menu:start':        {};
  'viewport:resize':   { width: number; height: number };
  'input:mousemove':   { mx: number; my: number };
  'input:mousedown':   { button: number };
  'input:mouseup':     { button: number };
  'input:click':       { mx: number; my: number; button: number };
  'input:mouseleave':  {};
}
