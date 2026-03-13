// ============================================================
// InputSystem.ts  —  Reads keyboard, mouse, and gamepad input.
//
// Call step(dt) every frame to flush per-frame state.
// Query state with isKeyDown / isKeyJustPressed / isMouseDown, etc.
//
// Key strings use KeyboardEvent.code (layout-independent):
//   'ArrowLeft', 'KeyA', 'Space', 'Enter', ...
// Mouse buttons: 0 = left, 1 = middle, 2 = right
// ============================================================

import { EventBus }     from '../events/EventBus';
import { canvasCoords } from '../utils/helpers';

export class InputSystem {
  // ---- Keyboard ------------------------------------------------
  private readonly keysDown        = new Set<string>();
  private readonly keysJustPressed = new Set<string>();
  private readonly keysJustReleased= new Set<string>();

  // ---- Mouse ---------------------------------------------------
  mouseX = 0;
  mouseY = 0;

  private readonly mouseDown        = new Set<number>();
  private readonly mouseJustPressed = new Set<number>();
  private readonly mouseJustReleased= new Set<number>();

  constructor(private readonly eventBus: EventBus, private readonly canvas: HTMLCanvasElement) {
    window.addEventListener('keydown',   this.onKeyDown);
    window.addEventListener('keyup',     this.onKeyUp);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup',   this.onMouseUp);
    window.addEventListener('contextmenu', this.onContextMenu);

    canvas.addEventListener('mousemove',  this.onMouseMove);
    canvas.addEventListener('mouseleave', this.onCanvasMouseLeave);
    canvas.addEventListener('click',      this.onCanvasClick);
  }

  // ---- Frame step ----------------------------------------------

  // Call once per frame (before physics/render) to flush
  // the justPressed / justReleased sets.
  step(_dt: number): void {
    this.keysJustPressed.clear();
    this.keysJustReleased.clear();
    this.mouseJustPressed.clear();
    this.mouseJustReleased.clear();
  }

  // ---- Keyboard queries ----------------------------------------

  isKeyDown(code: string): boolean {
    return this.keysDown.has(code);
  }

  // True only on the first frame the key was pressed.
  isKeyJustPressed(code: string): boolean {
    return this.keysJustPressed.has(code);
  }

  // True only on the first frame the key was released.
  isKeyJustReleased(code: string): boolean {
    return this.keysJustReleased.has(code);
  }

  // ---- Mouse queries -------------------------------------------

  isMouseDown(button = 0): boolean {
    return this.mouseDown.has(button);
  }

  isMouseJustPressed(button = 0): boolean {
    return this.mouseJustPressed.has(button);
  }

  isMouseJustReleased(button = 0): boolean {
    return this.mouseJustReleased.has(button);
  }

  // ---- Gamepad queries -----------------------------------------

  // Returns the value of a gamepad axis (-1 to 1).
  // gamepadIndex defaults to the first connected pad.
  getAxis(axisIndex: number, gamepadIndex = 0): number {
    const pad = navigator.getGamepads()?.[gamepadIndex];
    return pad?.axes[axisIndex] ?? 0;
  }

  // True while a gamepad button is held.
  isGamepadButtonDown(buttonIndex: number, gamepadIndex = 0): boolean {
    const pad = navigator.getGamepads()?.[gamepadIndex];
    return pad?.buttons[buttonIndex]?.pressed ?? false;
  }

  // ---- Cleanup -------------------------------------------------

  // Call when the game is torn down to avoid listener leaks.
  destroy(): void {
    window.removeEventListener('keydown',      this.onKeyDown);
    window.removeEventListener('keyup',        this.onKeyUp);
    window.removeEventListener('mousedown',    this.onMouseDown);
    window.removeEventListener('mouseup',      this.onMouseUp);
    window.removeEventListener('contextmenu',  this.onContextMenu);

    this.canvas.removeEventListener('mousemove',  this.onMouseMove);
    this.canvas.removeEventListener('mouseleave', this.onCanvasMouseLeave);
    this.canvas.removeEventListener('click',      this.onCanvasClick);
  }

  // ---- Private listeners (arrow fns to preserve `this`) --------

  private readonly onKeyDown = (e: KeyboardEvent): void => {
    if (!this.keysDown.has(e.code)) this.keysJustPressed.add(e.code);
    this.keysDown.add(e.code);
  };

  private readonly onKeyUp = (e: KeyboardEvent): void => {
    this.keysDown.delete(e.code);
    this.keysJustReleased.add(e.code);
  };

  private readonly onMouseMove = (e: MouseEvent): void => {
    const { mx, my } = canvasCoords(this.canvas, e);
    this.mouseX = mx;
    this.mouseY = my;
    this.eventBus.emit('input:mousemove', { mx, my });
  };

  private readonly onCanvasMouseLeave = (): void => {
    this.eventBus.emit('input:mouseleave', {});
  };

  private readonly onCanvasClick = (e: MouseEvent): void => {
    const { mx, my } = canvasCoords(this.canvas, e);
    this.eventBus.emit('input:click', { mx, my, button: e.button });
  };

  private readonly onMouseDown = (e: MouseEvent): void => {
    if (!this.mouseDown.has(e.button)) this.mouseJustPressed.add(e.button);
    this.mouseDown.add(e.button);
    this.eventBus.emit('input:mousedown', { button: e.button });
  };

  private readonly onMouseUp = (e: MouseEvent): void => {
    this.mouseDown.delete(e.button);
    this.mouseJustReleased.add(e.button);
    this.eventBus.emit('input:mouseup', { button: e.button });
  };

  private readonly onContextMenu = (e: Event): void => {
    e.preventDefault();
  };
}
