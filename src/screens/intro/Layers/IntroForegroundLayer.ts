// ============================================================
// IntroForegroundLayer.ts  —  Full-screen black overlay for
//                             fade-in / fade-out transitions.
// ============================================================

import { Layer } from '../../Layer';

export class IntroForegroundLayer extends Layer {
  override draw(ctx: CanvasRenderingContext2D): void {
    if (this.alpha === 0) return;

    const { width, height } = ctx.canvas;

    const prev = ctx.globalAlpha;
    ctx.globalAlpha = prev * this.alpha;
    ctx.fillStyle   = '#000000';
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = prev;
  }
}
