// ============================================================
// IntroUILayer.ts  —  HTML overlay for the intro screen.
//                     Displays whatever text IntroScreen pushes to it.
// ============================================================

import './IntroUILayer.scss';
import { Layer } from '../../Layer';

export class IntroUILayer extends Layer {
  private readonly el: HTMLElement;

  constructor() {
    super();

    this.el = document.createElement('div');
    this.el.id = 'intro-countdown';
    document.getElementById('ui-layer')?.appendChild(this.el);
  }

  // Called by IntroScreen each frame with the current countdown value.
  setText(value: string): void {
    this.el.textContent = value;
  }

  // No canvas drawing — DOM is managed directly.
  override draw(_ctx: CanvasRenderingContext2D): void {}

  override clear(): void {
    this.el.remove();
    super.clear();
  }
}
