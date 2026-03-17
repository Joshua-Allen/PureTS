// ============================================================
// objects/LoadingBarObject.ts  —  Canvas-rendered loading bar with label
// ============================================================

import { GameObject } from './GameObject';

const FONT              = 'bold 16px sans-serif';
const COLOR_TEXT        = '#ffffff';
const COLOR_TRACK       = '#333333';
const COLOR_FILL        = '#4caf50';
const COLOR_BORDER      = '#ffffff';
const COLOR_BACKGROUND  = '#1a1a2e';
const BORDER_RADIUS     = 4;
const LABEL_OFFSET_Y    = 20; // px above the bar
const BG_PADDING        = 16; // px of padding around the bar + label
const BAR_HEIGHT        = 24; // px height of the progress bar

export class LoadingBarObject extends GameObject {
  /** 0–1 */
  progress: number;

  constructor(
    private label: string,
    x = 0,
    y = 0,
    width  = 300,
    height = 120,
    progress = 0,
  ) {
    super(['loading-bar', 'static'], x, y, width, height);
    this.progress = Math.min(1, Math.max(0, progress));
  }

  // ---- Public API ----------------------------------------------

  setProgress(value: number): void {
    this.progress = Math.min(1, Math.max(0, value));
  }

  setLabel(text: string): void {
    this.label = text;
  }

  // ---- Rendering -----------------------------------------------

  override draw(ctx: CanvasRenderingContext2D): void {
    const { x, y, width, height, progress, label } = this;

    // width/height are the outer box — derive inner bar dimensions
    const barX = x + BG_PADDING;
    const barY = y + height - BG_PADDING - BAR_HEIGHT;
    const barW = width - BG_PADDING * 2;
    const barH = BAR_HEIGHT;

    // Background rectangle (full outer box)
    ctx.fillStyle = COLOR_BACKGROUND;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, BORDER_RADIUS + 2);
    ctx.fill();

    // Label above the bar
    ctx.fillStyle    = COLOR_TEXT;
    ctx.font         = FONT;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + width / 2, y + BG_PADDING + LABEL_OFFSET_Y / 2);

    // Track (background)
    ctx.fillStyle = COLOR_TRACK;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, BORDER_RADIUS);
    ctx.fill();

    // Fill
    const fillWidth = barW * progress;
    if (fillWidth > 0) {
      ctx.fillStyle = COLOR_FILL;
      ctx.beginPath();
      ctx.roundRect(barX, barY, fillWidth, barH, BORDER_RADIUS);
      ctx.fill();
    }

    // Border
    ctx.strokeStyle = COLOR_BORDER;
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, BORDER_RADIUS);
    ctx.stroke();
  }
}
