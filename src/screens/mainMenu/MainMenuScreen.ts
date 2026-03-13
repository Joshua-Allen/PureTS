// ============================================================
// screens/MainMenuScreen.ts  —  Title / main menu screen
// ============================================================

import { Screen }          from '../Screen';
import { EventBus }        from '../../events/EventBus';
import { AudioManager }    from '../../managers/AudioManager';
import { MainMenuLayer }   from './Layers/MainMenuLayer';

export class MainMenuScreen extends Screen {
  constructor(
    private readonly eventBus: EventBus,
    private readonly audio:    AudioManager
  ) {
    super();
  }

  async onEnter(): Promise<void> {
    this.addLayer(new MainMenuLayer(this.eventBus));
  }

  onExit(): void {
    this.audio.stopAll();
  }
}
