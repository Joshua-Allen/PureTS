// ============================================================
// screens/MainMenuScreen.ts  —  Title / main menu screen
// ============================================================

import { Screen }             from '../Screen';
import { EventBus }           from '../../events/EventBus';
import { AudioManager }       from '../../managers/AudioManager';
import { ResourceManager }    from '../../managers/ResourceManager';
import { UrlManager }         from '../../managers/UrlManager';
import { WalletApi }          from '../../api/WalletApi';
import { MainMenuLayer }      from './Layers/MainMenuLayer';
import { SYMBOLS, SYMBOL_IDS } from '../../Symbols';
import { Logger }             from '../../utils/Logger';

export class MainMenuScreen extends Screen {
  constructor(
    private readonly eventBus:   EventBus,
    private readonly audio:      AudioManager,
    private readonly resources:  ResourceManager,
    private readonly walletApi:  WalletApi,
    private readonly urlManager: UrlManager,
  ) {
    super();
  }

  async onEnter(): Promise<void> {
    await this.resources.loadImages(SYMBOL_IDS.map(id => ({ key: id, src: SYMBOLS[id].src })));
    const layer = new MainMenuLayer(this.eventBus, this.audio, this.resources);
    this.addLayer(layer);
    // Fire-and-forget so the layer renders "Connecting…" while the call is in flight.
    this.runAuthenticate(layer);
  }

  onExit(): void {
    this.audio.stopAll();
  }

  // ── Private ────────────────────────────────────────────────

  private async runAuthenticate(layer: MainMenuLayer): Promise<void> {
    const validation = this.urlManager.validate();
    if (!validation.ok) {
      layer.setAuthError(validation.error);
      return;
    }

    try {
      const response = await this.walletApi.authenticate(this.urlManager.sessionID!);
      layer.setAuthResponse(response);
    } catch (err) {
      Logger.error('MainMenuScreen', 'Authentication failed', err);
      layer.setAuthError(classifyAuthError(err));
    }
  }
}

// ── Helpers ──────────────────────────────────────────────────

function classifyAuthError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes('401') || msg.includes('400') || msg.includes('Unauthorized') || msg.includes('Bad Request'))
    return 'Session expired or invalid. Please use a valid game link.';
  if (msg.includes('403') || msg.includes('Forbidden'))
    return 'Access denied. Please check your game link or contact support.';
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('CORS') || msg.includes('TypeError'))
    return 'Unable to connect to game server. Please check your connection.';
  return 'Connection failed. Please refresh the page or contact support.';
}
