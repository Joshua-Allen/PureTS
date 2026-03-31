// ============================================================
// main.ts  —  Entry point. Bootstraps the game.
// ============================================================

import '../styles/main.scss';
import { Config }          from './Config';
import { EventBus }        from './events/EventBus';
import { InputSystem }     from './systems/InputSystem';
import { PhysicsSystem }   from './systems/PhysicsSystem';
import { RenderSystem }    from './systems/RenderSystem';
import { DebugSystem }     from './systems/debug/DebugSystem';
import { ScreenManager }   from './managers/ScreenManager';
import { AudioManager }    from './managers/AudioManager';
import { ResourceManager } from './managers/ResourceManager';
import { UrlManager }    from './managers/UrlManager';
import { ApiClient }     from './api/ApiClient';
import { WalletApi }     from './api/WalletApi';
import { IntroScreen } from './screens/intro/IntroScreen';

// ---- Canvas setup --------------------------------------------
const canvas = document.getElementById('world') as HTMLCanvasElement;
const ctx    = canvas.getContext('2d')!;

// ---- Core services -------------------------------------------
const eventBus       = new EventBus();
const input          = new InputSystem(eventBus, canvas);
const physics        = new PhysicsSystem(eventBus);
const renderer       = new RenderSystem(eventBus, canvas, ctx);
const debug          = new DebugSystem(eventBus);
const resources      = new ResourceManager(eventBus);
const audio          = new AudioManager(eventBus);
const screenManager  = new ScreenManager(eventBus);
const urlManager     = new UrlManager();
const apiBase        = urlManager.rgsUrl ?? 'https://api.stake-engine.com';
const apiClient      = new ApiClient(apiBase);
const walletApi      = new WalletApi(apiClient);

// ---- Initial screen ------------------------------------------
screenManager.transition(new IntroScreen(eventBus, audio, screenManager, resources, walletApi, urlManager));

// ---- Game loop -----------------------------------------------
let lastTime = performance.now();

function loop(now: number): void {
  const dt = Math.min((now - lastTime) / 1000, Config.maxDeltaTime);
  lastTime = now;

  const screen = screenManager.current;

  input.step(dt);
  physics.step(dt, screen);
  renderer.clear();
  //debug.preDraw(ctx, screen?.layers ?? [], dt);
  renderer.draw(screen);
  //debug.draw(ctx, screen?.layers ?? [], dt);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
