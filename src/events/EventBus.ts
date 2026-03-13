// ============================================================
// events/EventBus.ts  —  Simple publish/subscribe message bus
//                        used to decouple game systems
//
// Usage:
//   const bus = new EventBus<GameEvents>();
//   bus.on('player:died', (data) => console.log(data.score));
//   bus.emit('player:died', { score: 42 });
// ============================================================

import type { GameEvents } from '../types/index';

type Handler<T> = (data: T) => void;

export class EventBus<Events extends Record<string, any> = GameEvents> {
  private listeners = new Map<keyof Events, Handler<unknown>[]>();

  on<K extends keyof Events>(event: K, handler: Handler<Events[K]>): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(handler as Handler<unknown>);
  }

  // Unsubscribes a previously registered handler from an event
  off<K extends keyof Events>(event: K, handler: Handler<Events[K]>): void {
    const handlers = this.listeners.get(event);
    if (!handlers) return;
    this.listeners.set(event, handlers.filter(h => h !== handler));
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    this.listeners.get(event)?.forEach(h => h(data));
  }
}
