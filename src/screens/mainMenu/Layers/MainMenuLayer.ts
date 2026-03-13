// ============================================================
// screens/mainMenu/Layers/MainMenuLayer.ts
// ============================================================

import { Layer }        from '../../Layer';
import { EventBus }     from '../../../events/EventBus';
import { ButtonObject } from '../../../objects/ButtonObject';

export class MainMenuLayer extends Layer {
  constructor(private readonly eventBus: EventBus) {
    super();
    this.add(new ButtonObject('Play', () => this.eventBus.emit('menu:start', {}), this.eventBus, 25, 50));
    this.add(new ButtonObject('Play', () => this.eventBus.emit('menu:start', {}), this.eventBus, 50, 50));
  }
}
