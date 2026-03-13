// ============================================================
// systems/debug/PanelRow.ts  —  Base class for a single debug panel row.
//
// Extend this for rows that manage their own DOM structure or
// need per-frame update logic (e.g. progress bars, multi-column
// label/value pairs, sparklines, etc.).
//
// Simple text rows that only need an HTMLSpanElement can still
// use DebugPanel.addRow() directly.
// ============================================================

export class PanelRow {
  /** Root element appended to the parent panel by DebugPanel.addPanelRow(). */
  readonly el: HTMLElement;

  constructor() {
    this.el = document.createElement('span');
  }

  /**
   * Called every frame by the owning panel's update loop.
   * Override to refresh DOM content each tick.
   */
  update(_dt: number): void {}

  /** Called when the row is removed from its panel. Override to detach listeners. */
  destroy(): void {}
}
