// ============================================================
// RenderSystem.ts  —  Clears the canvas and draws the active screen
//                     each frame.
//
// Call draw(screen) once per frame after physics.step().
// The canvas is cleared to its background color first, then
// Screen.draw() is called which iterates layers bottom-to-top.
// ============================================================

import { Config }    from '../Config';
import { EventBus } from '../events/EventBus';
import { Screen }   from '../screens/Screen';

export class RenderSystem {
  // The color the canvas is cleared to at the start of every frame.
  clearColor = Config.clearColor;

  constructor(
    private readonly eventBus: EventBus,
    private readonly canvas:   HTMLCanvasElement,
    private readonly ctx:      CanvasRenderingContext2D
  ) {
    // Keep the canvas pixel-perfect when the browser window is resized.
    window.addEventListener('resize', this.onResize);
    this.onResize();
  }

  // Clears the canvas to clearColor. Call this once per frame before preDraw.
  clear(): void {
    const { ctx, canvas } = this;
    const dpr = window.devicePixelRatio ?? 1;
    const w   = canvas.width  / dpr;
    const h   = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = this.clearColor;
    ctx.fillRect(0, 0, w, h);
  }

  // Called every frame from the game loop after clear().
  draw(screen: Screen | null): void {
    if (!screen) return;
    screen.draw(this.ctx);
  }

  // Remove the resize listener if the system is ever torn down.
  destroy(): void {
    window.removeEventListener('resize', this.onResize);
  }

  // Matches the canvas's internal resolution to its CSS display size
  // so drawings are never blurry on high-DPI screens.
  private readonly onResize = (): void => {
    const dpr  = window.devicePixelRatio ?? 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width  = Math.round(rect.width  * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.scale(dpr, dpr);
    this.eventBus.emit('viewport:resize', {
      width:  Math.round(rect.width),
      height: Math.round(rect.height),
    });
  };
}
