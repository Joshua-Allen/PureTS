// ============================================================
// objects/GameObject.ts  —  Base class for every object in the game world
// ============================================================

import { EventBus } from '../events/EventBus';
import type { Rect } from '../types/index';

let nextId = 0;

export class GameObject {
  // Identity
  readonly id: number;
  tags: string[];

  // Position & size
  x: number;
  y: number;
  width: number;
  height: number;

  // Motion
  vx: number;
  vy: number;

  // Appearance
  alpha: number;
  depth: number;

  // Lifecycle
  active:        boolean;
  visible:       boolean;
  clipToBounds:  boolean;
  isMouseOver:   boolean;
  isMouseDown:   boolean;

  private readonly _eventBus?:     EventBus;
  private readonly _onMouseMove?:  (data: { mx: number; my: number }) => void;
  private readonly _onMouseDown?:  (data: { button: number }) => void;
  private readonly _onMouseUp?:    (data: { button: number }) => void;
  private readonly _onMouseLeave?: (data: {}) => void;
  private readonly _onMouseClick?: (data: { mx: number; my: number; button: number }) => void;

  constructor(tags: string[] = ['object'], x = 0, y = 0, width = 0, height = 0, eventBus?: EventBus) {
    this.id      = nextId++;
    this.tags    = tags;
    this.x       = x;
    this.y       = y;
    this.width   = width;
    this.height  = height;
    this.vx      = 0;
    this.vy      = 0;
    this.alpha       = 1;
    this.depth       = 0;
    this.active       = true;
    this.visible      = true;
    this.clipToBounds = false;
    this.isMouseOver  = false;
    this.isMouseDown  = false;

    if (eventBus) {
      this._eventBus = eventBus;

      this._onMouseMove = ({ mx, my }) => {
        if (!this.active || !this.visible) {
          if (this.isMouseOver) { this.isMouseOver = false; this.isMouseDown = false; this.onMouseLeave(); }
          return;
        }
        const wasOver = this.isMouseOver;
        this.isMouseOver = this.containsPoint(mx, my);
        if (!wasOver && this.isMouseOver)  { this.onMouseEnter(); }
        else if (wasOver && !this.isMouseOver) { this.isMouseDown = false; this.onMouseLeave(); }
      };

      this._onMouseDown = () => {
        if (this.isMouseOver) this.isMouseDown = true;
      };

      this._onMouseUp = () => {
        this.isMouseDown = false;
      };

      this._onMouseLeave = () => {
        if (this.isMouseOver) { this.onMouseLeave(); }
        this.isMouseOver = false;
        this.isMouseDown = false;
      };

      this._onMouseClick = ({ mx, my }) => {
        if (this.active && this.visible && this.containsPoint(mx, my)) this.onMouseClick();
      };
    }
  }

  // ── Internal lifecycle ─────────────────────────────────────
  // Called by Layer. Always run — do not override.
  // Each method applies base behaviour then delegates to the
  // corresponding override hook below.

  __init(): void {
    if (this._eventBus && this._onMouseMove && this._onMouseLeave) {
      this._eventBus.on('input:mousemove',  this._onMouseMove);
      this._eventBus.on('input:mousedown',  this._onMouseDown!);
      this._eventBus.on('input:mouseup',    this._onMouseUp!);
      this._eventBus.on('input:mouseleave', this._onMouseLeave);
      this._eventBus.on('input:click',      this._onMouseClick!);
    }
    this.init();
  }

  __step(dt: number): void {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.step(dt);
  }

  __draw(ctx: CanvasRenderingContext2D): void {
    const needsSave = this.alpha !== 1 || this.clipToBounds;
    if (!needsSave) {
      this.draw(ctx);
      return;
    }

    ctx.save();

    if (this.clipToBounds) {
      ctx.beginPath();
      ctx.rect(this.x, this.y, this.width, this.height);
      ctx.clip();
    }

    if (this.alpha !== 1) {
      ctx.globalAlpha = ctx.globalAlpha * this.alpha;
    }

    this.draw(ctx);
    ctx.restore();
  }

  __destroy(): void {
    this.active = false;
    if (this._eventBus && this._onMouseMove && this._onMouseLeave) {
      this._eventBus.off('input:mousemove',  this._onMouseMove);
      this._eventBus.off('input:mousedown',  this._onMouseDown!);
      this._eventBus.off('input:mouseup',    this._onMouseUp!);
      this._eventBus.off('input:mouseleave', this._onMouseLeave);
      this._eventBus.off('input:click',      this._onMouseClick!);
    }
    this.onDestroy();
  }

  // ── Override hooks ───────────────────────────────────────────
  // Called once when the object is added to a layer.
  init(): void {}

  // Called every frame. Velocity is already applied by __step.
  step(dt: number): void {}

  // Called every frame when the object is visible.
  draw(ctx: CanvasRenderingContext2D): void {}

  // Called by PhysicsSystem when this object overlaps another.
  onCollide(other: GameObject): void {}

  // Called when the mouse cursor enters this object's bounds.
  onMouseEnter(): void {}

  // Called when the mouse cursor leaves this object's bounds.
  onMouseLeave(): void {}

  // Called when the mouse is clicked within this object's bounds.
  onMouseClick(): void {}

  // Public API — delegates to __destroy so external callers work too.
  destroy(): void {
    this.__destroy();
  }

  // Override to clean up timers, listeners, child objects, etc.
  onDestroy(): void {}

  // Returns true when the given canvas-space point falls within this object's bounds.
  containsPoint(mx: number, my: number): boolean {
    return mx >= this.x && mx <= this.x + this.width
        && my >= this.y && my <= this.y + this.height;
  }

  // Returns true if this object has the given tag.
  hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  // Returns a snapshot of this object's position and size.
  getBounds(): Rect {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}
