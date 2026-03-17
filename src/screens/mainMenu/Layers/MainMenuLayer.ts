// ============================================================
// screens/mainMenu/Layers/MainMenuLayer.ts
// ============================================================

import { Layer }        from '../../Layer';
import { EventBus }     from '../../../events/EventBus';
import { ButtonObject } from '../../../objects/ButtonObject';
import { Column }       from '../../../objects/Column';

export class MainMenuLayer extends Layer {
  constructor(private readonly eventBus: EventBus) {
    super();
    this.add(new ButtonObject('Play', () => this.eventBus.emit('menu:start', {}), this.eventBus, 50, 100));
    this.add(new ButtonObject('Play', () => this.eventBus.emit('menu:start', {}), this.eventBus, 50, 200));
    this.add(new Column(600,400,100,300));
  }
}
