// ============================================================
// systems/debug/InfoPanel.ts  —  Top-left debug info panel.
//
// Displays:
//   - FPS counter
//   - Active screen name
//   - Canvas mouse coordinates
// ============================================================

import { EventBus }     from '../../events/EventBus';
import { canvasCoords } from '../../utils/helpers';
import { DebugPanel }   from './DebugPanel';
import { PanelRow }    from './PanelRow';

export class InfoPanel extends DebugPanel {
  private fpsRow!:    PanelRow;
  private screenRow!: PanelRow;
  private coordsRow!: PanelRow;

  constructor(private readonly eventBus: EventBus) {
    super();
    this.build();
  }

  update(dt: number): void {
    const fps = dt > 0 ? Math.round(1 / dt) : 0;
    this.fpsRow.el.textContent = `FPS: ${fps}`;
  }

  // ---- Builder ---------------------------------------------------------

  private build(): void {
    const panel = this.createPanel('top:10px;left:10px;');

    this.fpsRow    = this.addPanelRow(panel, new PanelRow());
    this.screenRow = this.addPanelRow(panel, new PanelRow());
    this.coordsRow = this.addPanelRow(panel, new PanelRow());

    this.eventBus.on('screen:entered', ({ name }) => {
      this.screenRow.el.textContent = `Screen: ${name}`;
    });

    const canvas = document.getElementById('world') as HTMLCanvasElement | null;
    if (canvas) {
      canvas.addEventListener('mousemove', (e: MouseEvent) => {
        const { mx, my } = canvasCoords(canvas, e);
        this.coordsRow.el.textContent = `Coords: ${Math.round(mx)}, ${Math.round(my)}`;
      });
      canvas.addEventListener('mouseleave', () => {
        this.coordsRow.el.textContent = 'Coords: —';
      });
    }
  }
}
