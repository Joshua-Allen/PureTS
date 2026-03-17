// ============================================================
// objects/ColumnDot.ts  —  A single scrolling dot inside a Column
// ============================================================

export class ColumnDot {
  /** y offset relative to the column's top edge (0 … columnHeight) */
  yOffset: number;

  constructor(
    yOffset: number,
    public readonly radius = 10,
    public readonly color  = '#ffffff',
  ) {
    this.yOffset = yOffset;
  }

  /** Move downward and wrap back to the top when leaving the column. */
  step(dt: number, speed: number, columnHeight: number): void {
    this.yOffset = (this.yOffset + speed * dt) % columnHeight;
  }

  draw(ctx: CanvasRenderingContext2D, cx: number, columnY: number): void {
    ctx.beginPath();
    ctx.arc(cx, columnY + this.yOffset, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}
