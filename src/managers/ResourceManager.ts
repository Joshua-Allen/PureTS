// ============================================================
// ResourceManager.ts  —  Loads and caches game assets.
//                        Call loadImages() / loadFonts() during
//                        screen setup, then getImage() at draw time.
// ============================================================

import { EventBus }  from '../events/EventBus';
import type { FontAsset } from '../types/index';

export class ResourceManager {
  private readonly images = new Map<string, HTMLImageElement>();

  constructor(private readonly eventBus: EventBus) {}

  // ---- Images ------------------------------------------------

  // Loads an array of {key, src} descriptors in parallel.
  // Resolves once every image has finished loading.
  loadImages(assets: Array<{ key: string; src: string }>): Promise<void[]> {
    const pending = assets
      .filter(a => !this.images.has(a.key))
      .map(a => this.loadImage(a));
    return Promise.all(pending);
  }

  // Loads a single image and stores it under asset.key.
  loadImage(asset: { key: string; src: string }): Promise<void> {
    if (this.images.has(asset.key)) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload  = () => { this.images.set(asset.key, img); resolve(); };
      img.onerror = () => reject(new Error(`[ResourceManager] Failed to load image: "${asset.src}")`));
      img.src = asset.src;
    });
  }

  // Returns a cached image. Throws if not yet loaded.
  getImage(key: string): HTMLImageElement {
    const img = this.images.get(key);
    if (!img) throw new Error(`[ResourceManager] Image not loaded: "${key}"`);
    return img;
  }

  // ---- Fonts -------------------------------------------------

  // Loads an array of FontAssets using the CSS Font Loading API.
  loadFonts(assets: FontAsset[]): Promise<FontFace[]> {
    const pending = assets.map(a => {
      const face = new FontFace(a.family, `url(${a.src})`);
      return face.load().then(loaded => {
        document.fonts.add(loaded);
        return loaded;
      });
    });
    return Promise.all(pending);
  }

  // ---- Convenience -------------------------------------------

  // Loads images and fonts in parallel. Make a screen's onEnter() async
  // and await this so that getImage() calls are safe once the screen starts.
  async loadAll(
    images: Array<{ key: string; src: string }> = [],
    fonts:  FontAsset[] = []
  ): Promise<void> {
    await Promise.all([
      this.loadImages(images),
      this.loadFonts(fonts),
    ]);
  }
}
