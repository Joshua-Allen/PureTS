// ============================================================
// screens/mainMenu/Layers/MainMenuLayer.ts
// ============================================================

import { Layer }        from '../../Layer';
import { EventBus }     from '../../../events/EventBus';
import { ButtonObject } from '../../../objects/ButtonObject';
import { Column }       from '../../../objects/Column';
import { LoadingBarObject } from '../../../objects/LoadingBarObject';

export class MainMenuLayer extends Layer {
  private readonly loadingBar = new LoadingBarObject('Loading assets…', 0, 0, 300, 120, 0.3);
  private vpWidth  = window.innerWidth;
  private vpHeight = window.innerHeight;

  private readonly onViewportResize = ({ width, height }: { width: number; height: number }): void => {
    this.vpWidth  = width;
    this.vpHeight = height;
  };

  constructor(private readonly eventBus: EventBus) {
    super();
    this.eventBus.on('viewport:resize', this.onViewportResize);
    this.add(new ButtonObject('Play', () => this.eventBus.emit('menu:start', {}), this.eventBus, 50, 100));
    this.add(new ButtonObject('Play', () => this.eventBus.emit('menu:start', {}), this.eventBus, 50, 200));
    this.add(new Column(600,400,100,300));
    this.add(this.loadingBar);
  }

  override step(dt: number): void {
    this.loadingBar.x = (this.vpWidth  - this.loadingBar.width)  / 2;
    this.loadingBar.y = (this.vpHeight - this.loadingBar.height) / 2;
    super.step(dt);
  }

  override clear(): void {
    this.eventBus.off('viewport:resize', this.onViewportResize);
    super.clear();
  }
}
