// ============================================================
// AudioManager.ts  —  Plays and manages music and sound effects.
//                     Register AudioAssets up front, then call
//                     play() / stop() / stopAll() from screens.
// ============================================================

import { EventBus }  from '../events/EventBus';
import type { AudioAsset } from '../types/index';

export class AudioManager {
  private readonly tracks = new Map<string, HTMLAudioElement>();

  constructor(private readonly eventBus: EventBus) {}

  // Pre-loads an audio file and stores it under asset.key.
  // Safe to call multiple times with the same key — existing entry is kept.
  register(asset: AudioAsset): void {
    if (this.tracks.has(asset.key)) return;

    const el = new Audio(asset.src);
    el.loop   = asset.loop;
    el.volume = Math.max(0, Math.min(1, asset.volume));
    this.tracks.set(asset.key, el);
  }

  // Plays the track from the beginning.
  play(key: string): void {
    const track = this.tracks.get(key);
    if (!track) {
      console.warn(`[AudioManager] Unknown track: "${key}"`);
      return;
    }
    track.currentTime = 0;
    track.play().catch(() => {
      // Autoplay may be blocked before a user gesture — ignore silently.
    });
  }

  // Pauses and resets a single track.
  stop(key: string): void {
    const track = this.tracks.get(key);
    if (!track) return;
    track.pause();
    track.currentTime = 0;
  }

  // Pauses and resets every registered track.
  stopAll(): void {
    for (const track of this.tracks.values()) {
      track.pause();
      track.currentTime = 0;
    }
  }

  // Adjusts the volume of a single track (0–1).
  setVolume(key: string, volume: number): void {
    const track = this.tracks.get(key);
    if (!track) return;
    track.volume = Math.max(0, Math.min(1, volume));
  }
}
