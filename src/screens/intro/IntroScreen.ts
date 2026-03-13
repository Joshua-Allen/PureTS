// ============================================================
// screens/IntroScreen.ts  —  Title / intro screen
// ============================================================

import { Screen }         from '../Screen';
import { EventBus }       from '../../events/EventBus';
import { AudioManager }   from '../../managers/AudioManager';
import { ScreenManager }  from '../../managers/ScreenManager';
import { MainMenuScreen } from '../mainMenu/MainMenuScreen';
import { IntroUILayer }   from './Layers/IntroUILayer';

const DURATION = 1; // seconds

export class IntroScreen extends Screen {
  private transitionTimer: ReturnType<typeof setTimeout> | null = null;
  private elapsed = 0;
  private uiLayer!: IntroUILayer;

  constructor(
    private readonly eventBus:      EventBus,
    private readonly audio:         AudioManager,
    private readonly screenManager: ScreenManager
  ) {
    super();
  }

  async onEnter(): Promise<void> {
    // TODO: add canvas layers, load assets, start intro music, etc.

    this.elapsed = 0;
    this.uiLayer = new IntroUILayer();
    this.uiLayer.setText(String(DURATION));
    this.addLayer(this.uiLayer);

    this.transitionTimer = setTimeout(() => {
      this.screenManager.transition(new MainMenuScreen(this.eventBus, this.audio));
    }, DURATION * 1000);
  }

  override step(dt: number): void {
    this.elapsed += dt;
    const remaining = Math.max(0, DURATION - this.elapsed);
    this.uiLayer.setText(String(Math.ceil(remaining)));
    super.step(dt);
  }

  onExit(): void {
    if (this.transitionTimer !== null) {
      clearTimeout(this.transitionTimer);
      this.transitionTimer = null;
    }
    this.audio.stopAll();
  }
}
