// ============================================================
// screens/mainMenu/Layers/MainMenuLayer.ts
// ============================================================

import { Layer }                from '../../Layer';
import { EventBus }             from '../../../events/EventBus';
import { AudioManager }         from '../../../managers/AudioManager';
import { ResourceManager }      from '../../../managers/ResourceManager';
import { ButtonObject }         from '../../../objects/ButtonObject';
import { LoadingBarObject }     from '../../../objects/LoadingBarObject';
import { GameScreen }           from '../../game/GameScreen';
import { AuthenticateResponse } from '../../../api/PlayerApi';
import { formatCurrency }       from '../../../utils/Currency';

export class MainMenuLayer extends Layer {
  private authResponse: AuthenticateResponse | null = null;
  private authError:    string | null               = null;

  private readonly loadingBar = new LoadingBarObject('Connecting…', 0, 0, 300, 120, 0.3);
  private readonly playButton: ButtonObject;

  constructor(
    private readonly eventBus:  EventBus,
    private readonly audio:     AudioManager,
    private readonly resources: ResourceManager,
  ) {
    super(eventBus);

    this.playButton = new ButtonObject(
      'Play',
      () => this.eventBus.emit('screen:transition', {
        screen: new GameScreen(this.eventBus, this.audio, this.resources, this.authResponse!),
      }),
      this.eventBus,
      0, 0,
    );
    this.playButton.visible = false; // shown only after successful auth

    this.add(this.loadingBar);
    this.add(this.playButton);
  }

  // ── Auth setters (called by MainMenuScreen) ─────────────────

  setAuthResponse(response: AuthenticateResponse): void {
    this.authResponse         = response;
    this.loadingBar.visible   = false;
    this.playButton.visible   = true;
  }

  setAuthError(message: string): void {
    this.authError          = message;
    this.loadingBar.visible = false;
  }

  // ── Per-frame ───────────────────────────────────────────────

  override step(dt: number): void {
    const cx = (this.vpWidth  - this.loadingBar.width)  / 2;
    const cy = (this.vpHeight - this.loadingBar.height) / 2;

    this.loadingBar.x = cx;
    this.loadingBar.y = cy;

    this.playButton.x = (this.vpWidth  - this.playButton.width)  / 2;
    this.playButton.y = cy + this.loadingBar.height + 20;

    super.step(dt);
  }

  override draw(ctx: CanvasRenderingContext2D): void {
    super.draw(ctx); // renders objects

    const cx = this.vpWidth  / 2;
    const cy = this.vpHeight / 2;

    ctx.save();
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    if (this.authResponse !== null) {
      const { balance, config } = this.authResponse;
      const { amount, currency } = balance;

      ctx.fillStyle = '#ffffff';
      ctx.font      = 'bold 28px sans-serif';
      ctx.fillText(formatCurrency(amount, currency), cx, cy - 60);

      ctx.fillStyle = '#cccccc';
      ctx.font      = '16px sans-serif';
      const levels  = config.betLevels.map(b => formatCurrency(b, currency)).join('  ·  ');
      ctx.fillText(`Bet levels: ${levels}`, cx, cy - 25);

    } else if (this.authError !== null) {
      ctx.fillStyle = '#ff4444';
      ctx.font      = '18px sans-serif';
      ctx.fillText(this.authError, cx, cy);
    }

    ctx.restore();
  }
}
