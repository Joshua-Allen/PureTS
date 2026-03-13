// ============================================================
// screens/Screen.ts  —  Base class for all game screens.
//                       Each screen owns an ordered stack of Layers
//                       drawn bottom to top each frame.
// ============================================================

import { Layer } from './Layer';

export class Screen {
  // Public so PhysicsSystem, DebugSystem, and the game loop can read the stack.
  layers: Layer[] = [];

  // Adds a layer to the top of the stack.
  addLayer(layer: Layer): void {
    this.layers.push(layer);
  }

  // Called by ScreenManager when this screen becomes active.
  // Override to set up layers, load assets, start music, etc.
  // Can be async — ScreenManager awaits it before the screen starts.
  async onEnter(): Promise<void> {}

  // Called by ScreenManager just before switching away.
  // Override to stop music, clear state, run exit animations, etc.
  onExit(): void {}

  // Called every frame by PhysicsSystem.
  // Passes dt down to every layer in the stack.
  step(dt: number): void {
    for (const layer of this.layers) layer.step(dt);
  }

  // Called every frame by RenderSystem.
  // Draws layers in order — first added = furthest back.
  draw(ctx: CanvasRenderingContext2D): void {
    for (const layer of this.layers) layer.draw(ctx);
  }

  // Clears all layers. Called automatically by ScreenManager on exit.
  clear(): void {
    for (const layer of this.layers) layer.clear();
    this.layers = [];
  }
}
