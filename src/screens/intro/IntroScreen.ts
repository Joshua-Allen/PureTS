// ============================================================
// screens/IntroScreen.ts  —  Title / intro screen
// ============================================================

import { Screen }         from '../Screen';
import { EventBus }       from '../../events/EventBus';
import { AudioManager }   from '../../managers/AudioManager';
import { ScreenManager }  from '../../managers/ScreenManager';
import { MainMenuScreen } from '../mainMenu/MainMenuScreen';
import { IntroForegroundLayer } from './Layers/IntroForegroundLayer';

const FADE_IN_DURATION  = .1;   // seconds
const WAIT_DURATION     = .2;   // seconds
const FADE_OUT_DURATION = .1;   // seconds

type IntroState = 'fade-in' | 'waiting' | 'fade-out';

export class IntroScreen extends Screen {
  private state:   IntroState = 'fade-in';
  private elapsed  = 0;
  private uiLayer!: IntroForegroundLayer;

  constructor(
    private readonly eventBus:      EventBus,
    private readonly audio:         AudioManager,
    private readonly screenManager: ScreenManager
  ) {
    super();
  }

  async onEnter(): Promise<void> {
    // TODO: add canvas layers, load assets, start intro music, etc.

    this.state   = 'fade-in';
    this.elapsed = 0;
    this.uiLayer = new IntroForegroundLayer();
    this.uiLayer.alpha = 1;
    this.addLayer(this.uiLayer);
  }

  override step(dt: number): void {
    this.elapsed += dt;

    switch (this.state) {
      case 'fade-in': {
        const t = Math.min(this.elapsed / FADE_IN_DURATION, 1);
        this.uiLayer.alpha = 1 - t;
        if (this.elapsed >= FADE_IN_DURATION) {
          this.state   = 'waiting';
          this.elapsed = 0;
        }
        break;
      }

      case 'waiting': {
        this.uiLayer.alpha = 0;
        if (this.elapsed >= WAIT_DURATION) {
          this.state   = 'fade-out';
          this.elapsed = 0;
        }
        break;
      }

      case 'fade-out': {
        const t = Math.min(this.elapsed / FADE_OUT_DURATION, 1);
        this.uiLayer.alpha = t;
        if (this.elapsed >= FADE_OUT_DURATION) {
          this.screenManager.transition(new MainMenuScreen(this.eventBus, this.audio));
        }
        break;
      }
    }

    super.step(dt);
  }

  onExit(): void {
    this.audio.stopAll();
  }
}
