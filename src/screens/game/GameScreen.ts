// ============================================================
// screens/GameScreen.ts  —  The primary in-game screen
//
// Layer order (bottom to top):
//   BackgroundLayer → MidgroundLayer → ForegroundLayer → UILayer
// ============================================================

import { Screen }              from '../Screen';
import { EventBus }            from '../../events/EventBus';
import { AudioManager }        from '../../managers/AudioManager';
import { ResourceManager }     from '../../managers/ResourceManager';
import { Foreground }          from './Layers/Foreground';
import { SYMBOLS, SYMBOL_IDS } from '../../Symbols';
import { AuthenticateResponse } from '../../api/PlayerApi';

export class GameScreen extends Screen {
  constructor(
    private readonly eventBus:   EventBus,
    private readonly audio:      AudioManager,
    private readonly resources:  ResourceManager,
    readonly authData?:          AuthenticateResponse,
  ) {
    super();
  }

  async onEnter(): Promise<void> {
    await this.resources.loadImages(SYMBOL_IDS.map(id => ({ key: id, src: SYMBOLS[id].src })));
    this.addLayer(new Foreground(this.eventBus, this.resources));
  }

  onExit(): void {
    this.audio.stopAll();
  }
}
