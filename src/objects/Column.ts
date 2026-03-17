// ============================================================
// objects/Column.ts  —  A column whose dots scroll downward and wrap
// ============================================================

import { GameObject } from './GameObject';
import { ColumnDot } from './ColumnDot';

const CIRCLE_COUNT = 4;
const CIRCLE_SPEED = 500; // px/s

export class Column extends GameObject {
  private readonly dots: ColumnDot[];

  constructor(x = 0, y = 0, width = 60, height = 300) {
    super(['static'], x, y, width, height);
    this.clipToBounds = true;

    // Space dots evenly across the column height.
    const spacing = height / CIRCLE_COUNT;
    this.dots = Array.from({ length: CIRCLE_COUNT }, (_, i) => new ColumnDot(i * spacing));
  }

  override step(dt: number): void {
    for (const dot of this.dots) {
      dot.step(dt, CIRCLE_SPEED, this.height);
    }
  }

  override draw(ctx: CanvasRenderingContext2D): void {
    const { x, y, width, height } = this;
    const cx = x + width / 2;

    // Background
    ctx.fillStyle = '#333333';
    ctx.fillRect(x, y, width, height);

    // Dots
    for (const dot of this.dots) {
      dot.draw(ctx, cx, y);
    }
  }
}
