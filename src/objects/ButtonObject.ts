// ============================================================
// objects/ButtonObject.ts  —  Canvas-rendered clickable button
// ============================================================

import { GameObject } from './GameObject';
import { EventBus }   from '../events/EventBus';

const FONT            = 'bold 20px sans-serif';
const COLOR_NORMAL    = '#333333';
const COLOR_HOVER     = '#555555';
const COLOR_TEXT      = '#ffffff';
const BORDER_RADIUS   = 8;

export class ButtonObject extends GameObject {
  //private readonly onViewportResize: (data: { width: number; height: number }) => void;
  private readonly onInputClick:      (data: { mx: number; my: number; button: number }) => void;

  constructor(
    private readonly label:    string,
    private readonly onPress:  () => void,
    private readonly eventBus: EventBus,
    x = 0,
    y = 0,
    width  = 200,
    height = 60,
  ) {
    super(['button', 'static'], x, y, width, height, eventBus);
/*
    this.onViewportResize = ({ width, height }) => {
      this.x = (width  - this.width)  / 2;
      this.y = (height - this.height) / 2;
    };
*/
    this.onInputClick = ({ mx, my, button }) => {
      if (!this.active || !this.visible || button !== 0) return;
      if (this.containsPoint(mx, my)) this.onPress();
    };
  }

  // ---- Lifecycle -----------------------------------------------

  override init(): void {
    // Bootstrap position from current viewport dimensions without storing the canvas.
    const canvas = document.getElementById('world') as HTMLCanvasElement;
    const rect   = canvas.getBoundingClientRect();
    //this.x = (rect.width  - this.width)  / 2;
    //this.y = (rect.height - this.height) / 2;

    //this.eventBus.on('viewport:resize', this.onViewportResize);
    this.eventBus.on('input:click',     this.onInputClick);
  }

  override draw(ctx: CanvasRenderingContext2D): void {
    const { x, y, width, height } = this;

    // Background
    ctx.fillStyle = this.isMouseOver ? COLOR_HOVER : COLOR_NORMAL;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, BORDER_RADIUS);
    ctx.fill();

    // Label
    ctx.fillStyle    = COLOR_TEXT;
    ctx.font         = FONT;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label, x + width / 2, y + height / 2);
  }

  override onDestroy(): void {
    //this.eventBus.off('viewport:resize', this.onViewportResize);
    this.eventBus.off('input:click',     this.onInputClick);
  }
}
