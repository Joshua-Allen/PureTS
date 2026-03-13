// ============================================================
// systems/debug/EventLogPanel.ts  —  Top-right event log panel.
//
// Intercepts every EventBus emission and displays the last N
// events in a scrolling list, excluding configurable noise events.
// ============================================================

import { EventBus }       from '../../events/EventBus';
import type { GameEvents }  from '../../types/index';
import { DebugPanel }     from './DebugPanel';

export class EventLogPanel extends DebugPanel {
  private static readonly MAX_ROWS = 8;

  private readonly logPanel: HTMLDivElement;

  constructor(
    private readonly eventBus: EventBus,
    private readonly excludeEvents: ReadonlyArray<keyof GameEvents> = ['input:mousemove'],
  ) {
    super();
    this.logPanel = this.createPanel('top:10px;right:10px;text-align:right;');
    this.interceptEmit();
  }

  /** Event log is driven by interception; no per-frame work needed. */
  update(_dt: number): void {}

  // ---- Event interception ----------------------------------------------

  private interceptEmit(): void {
    const originalEmit = this.eventBus.emit.bind(this.eventBus);
    (this.eventBus as any).emit = (event: string, data: unknown) => {
      originalEmit(event as any, data as any);
      this.logEvent(event, data);
    };
  }

  private logEvent(event: string, data: unknown): void {
    if (this.excludeEvents.includes(event as keyof GameEvents)) return;

    const row = document.createElement('span');
    row.textContent = `${event}: ${JSON.stringify(data)}`;
    this.logPanel.prepend(row);

    while (this.logPanel.childElementCount > EventLogPanel.MAX_ROWS) {
      this.logPanel.lastElementChild?.remove();
    }
  }
}
