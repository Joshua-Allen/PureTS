// ============================================================
// ScreenManager.ts  —  Owns the active screen and handles
//                      transitions between screens.
//                      Not a per-frame system — call transition()
//                      whenever the app needs to change screens.
// ============================================================

import { EventBus }  from '../events/EventBus';
import { Screen }    from '../screens/Screen';

export class ScreenManager {
  private _current: Screen | null = null;

  constructor(private readonly eventBus: EventBus) {
    this.eventBus.on('screen:transition', ({ screen }) => {
      this.transition(screen);
    });
  }

  // The currently active screen. Systems read this every frame.
  get current(): Screen | null {
    return this._current;
  }

  // Exits the current screen (if any) and enters the next one.
  // Awaits onEnter() so async screens (e.g. those that load assets) are
  // fully ready before the game loop starts interacting with them.
  async transition(next: Screen): Promise<void> {
    if (this._current) {
      this._current.onExit();
      this._current.clear();
    }

    this._current = next;
    await this._current.onEnter();
    this.eventBus.emit('screen:entered', { name: next.constructor.name });
  }
}
