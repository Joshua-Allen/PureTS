// ============================================================
// systems/debug/DebugPanel.ts  —  Abstract base class for debug panels.
//
// Subclasses:
//   - InfoPanel      (FPS, active screen name, coords)
//   - EventLogPanel  (last N emitted events)
// ============================================================

import { Config }    from '../../Config';
import { PanelRow } from './PanelRow';

export abstract class DebugPanel {
  protected readonly debugLayer: HTMLElement | null;

  constructor() {
    this.debugLayer = document.getElementById('debug-layer');

    if (this.debugLayer) {
      this.debugLayer.style.display = Config.debug ? 'block' : 'none';
    }
  }

  /** Called every frame with the current delta time (seconds). */
  abstract update(dt: number): void;

  // ---- Shared DOM helpers ----------------------------------------------

  protected createPanel(cssText: string): HTMLDivElement {
    const panel = document.createElement('div');
    panel.style.cssText = `position:absolute;display:flex;flex-direction:column;gap:4px;${cssText}`;
    this.debugLayer?.appendChild(panel);
    return panel;
  }

  /**
   * Appends a PanelRow's root element to the panel and returns the row.
   */
  protected addPanelRow<T extends PanelRow>(panel: HTMLElement, row: T): T {
    panel.appendChild(row.el);
    return row;
  }
}
