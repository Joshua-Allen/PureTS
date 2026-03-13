// ============================================================
// systems/debug/DebugSystem.ts  —  Per-frame visual debugging.
//                                  Runs after RenderSystem each frame
//                                  and draws overlays on top of everything.
//                                  Does nothing when Config.debug is false.
//
// Canvas overlays drawn when active:
//   - Checkerboard background
//   - Hitboxes (bounding boxes) for all objects
//   - Velocity vectors
//   - Object id and tags
//   - FPS counter (via DebugPanel)
// ============================================================

import { Config }         from '../../Config';
import { Layer }          from '../../screens/Layer';
import { EventBus }       from '../../events/EventBus';
import { DebugPanel }     from './DebugPanel';
import { InfoPanel }      from './InfoPanel';
import { EventLogPanel }  from './EventLogPanel';

export class DebugSystem {
  private readonly panels: DebugPanel[];

  constructor(eventBus: EventBus) {
    this.panels = [
      new InfoPanel(eventBus),
      new EventLogPanel(eventBus),
    ];
  }

  // Called before RenderSystem.draw() each frame (after renderer.clear()).
  preDraw(ctx: CanvasRenderingContext2D, _layers: Layer[], _dt: number): void {
    if (!Config.debug) return;

    this.drawCheckerboard(ctx);
    this.drawSectionGrid(ctx);
  }

  // Pass the active screen's layers each frame.
  draw(ctx: CanvasRenderingContext2D, layers: Layer[], dt: number): void {
    if (!Config.debug) return;

    for (const layer of layers) {
      this.drawLayerDebug(ctx, layer);
    }

    for (const panel of this.panels) {
      panel.update(dt);
    }
  }

  private drawSectionGrid(ctx: CanvasRenderingContext2D): void {
    const dpr    = window.devicePixelRatio ?? 1;
    const width  = ctx.canvas.width  / dpr;
    const height = ctx.canvas.height / dpr;

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 255, 1)';
    ctx.lineWidth   = 1;

    // 2 vertical lines → 3 columns
    for (let i = 1; i <= 3; i++) {
      const x = (width / 4) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // 2 horizontal lines → 3 rows
    for (let i = 1; i <= 3; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawCheckerboard(ctx: CanvasRenderingContext2D): void {
    const dpr    = window.devicePixelRatio ?? 1;
    const width  = ctx.canvas.width  / dpr;
    const height = ctx.canvas.height / dpr;
    const tile   = 32;

    ctx.save();
    for (let row = 0; row * tile < height; row++) {
      for (let col = 0; col * tile < width; col++) {
        ctx.fillStyle = (row + col) % 2 === 0
          ? 'rgba(255,255,255,0.06)'
          : 'rgba(0,0,0,0.06)';
        ctx.fillRect(col * tile, row * tile, tile, tile);
      }
    }
    ctx.restore();
  }

  private drawLayerDebug(ctx: CanvasRenderingContext2D, layer: Layer): void {
    for (const o of (layer as any).objects) {
      if (!o.active) continue;

      ctx.save();

      // Hitbox
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
      ctx.lineWidth   = 1;
      ctx.strokeRect(o.x, o.y, o.width, o.height);

      // Velocity vector
      if (o.vx !== 0 || o.vy !== 0) {
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.9)';
        ctx.beginPath();
        ctx.moveTo(o.x + o.width / 2, o.y + o.height / 2);
        ctx.lineTo(o.x + o.width / 2 + o.vx, o.y + o.height / 2 + o.vy);
        ctx.stroke();
      }

      // Id and tags
      ctx.fillStyle = 'red';
      ctx.font      = '10px monospace';
      ctx.fillText(`#${o.id} [${o.tags.join(', ')}]`, o.x, o.y - 3);

      ctx.restore();
    }
  }
}
