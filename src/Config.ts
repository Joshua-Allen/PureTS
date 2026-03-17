// ============================================================
// Config.ts  —  Global game settings and constants
// ============================================================

export class Config {
  // Set to true during development to enable DebugSystem overlays
  // and Logger output. Set to false for production builds.
  static debug: boolean = true;

  // Maximum allowed delta time (seconds). Caps the physics step during
  // tab switches or slow frames to prevent the "spiral of death".
  static maxDeltaTime: number = 0.05;

  // Color the canvas is cleared to at the start of every frame.
  static clearColor: string = '#ffffff';
}