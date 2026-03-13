// ============================================================
// utils/helpers.ts  —  General-purpose utility functions
// ============================================================

/** Converts a MouseEvent's client coordinates to logical canvas pixel coordinates.
 *  Returns CSS-pixel offsets from the canvas origin, which matches the game's
 *  logical coordinate space (RenderSystem applies ctx.scale(dpr,dpr) so all
 *  draw positions are in CSS pixels, not physical pixels). */
export function canvasCoords(canvas: HTMLCanvasElement, e: MouseEvent): { mx: number; my: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    mx: e.clientX - rect.left,
    my: e.clientY - rect.top,
  };
}
