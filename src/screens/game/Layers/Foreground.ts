// ============================================================
// Foreground.ts  —  Active play layer: player, enemies,
//                        items, projectiles
// ============================================================

import { Layer } from "../../Layer";
import { EventBus }        from '../../../events/EventBus';
import { ResourceManager } from '../../../managers/ResourceManager';
import { ButtonObject }    from '../../../objects/ButtonObject';
import { SymbolStrip, SYMBOL_SPEED, SYMBOL_COUNT } from '../../../objects/SymbolStrip';
import { SYMBOL_IDS } from '../../../Symbols';
import type { SymbolId } from '../../../Symbols';

export class Foreground extends Layer  {
  private strips: SymbolStrip[];

  constructor(
    private readonly eventBus:  EventBus,
    private readonly resources: ResourceManager,
  ) {
    super(eventBus);
    this.strips = [];
    this.add(new ButtonObject('Spin', () => this.onSpin(), this.eventBus, 50, 200));
    this.add(new ButtonObject('Stop', () => this.onStop(), this.eventBus, 50, 300));
    
    const stripCount  = 5;
    const stripWidth  = 100;
    const stripGap    = 120;
    const totalWidth  = (stripCount - 1) * stripGap + stripWidth;
    const startX      = this.vpWidth / 2 - totalWidth / 2;

    for (let i = 0; i < stripCount; i++) {
      const strip = new SymbolStrip(this.resources, startX + i * stripGap, 400, stripWidth, 400);
      this.add(strip);
      this.strips.push(strip);
    }
  }

  override step(dt: number): void {
    super.step(dt);
    // update strip positions dynamically 
    this.updateStripLocations();
  }

  updateStripLocations(): void {
    const n = this.strips.length;
    if (n === 0) return;

    // Spread strips across 80% of the viewport width.
    // Reduce inter-strip spacing on smaller screens to keep symbols readable.
    const smallScreenRatio = 0.08;
    const largeScreenRatio = 0.2;
    const smallScreenWidth = 430;
    const largeScreenWidth = 1280;
    const t = Math.max(0, Math.min(1, (this.vpWidth - smallScreenWidth) / (largeScreenWidth - smallScreenWidth)));
    const gapRatio = smallScreenRatio + (largeScreenRatio - smallScreenRatio) * t;

    // Keep a safe area for future UI elements on all sides.
    const minHorizontalPadding = 8;
    const maxHorizontalPadding = 140;
    const minTopPadding        = 24;
    const maxTopPadding        = 100;
    const minBottomPadding     = 40;
    const maxBottomPadding     = 180;

    const narrowPaddingScreenWidth = 430;
    const widePaddingScreenWidth   = 1280;
    const narrowPaddingRatio       = 0.03;
    const widePaddingRatio         = 0.12;
    const paddingT = Math.max(0, Math.min(1, (this.vpWidth - narrowPaddingScreenWidth) / (widePaddingScreenWidth - narrowPaddingScreenWidth)));
    const horizontalPaddingRatio = narrowPaddingRatio + (widePaddingRatio - narrowPaddingRatio) * paddingT;

    const leftPadding   = Math.max(minHorizontalPadding, Math.min(maxHorizontalPadding, this.vpWidth * horizontalPaddingRatio));
    const rightPadding  = leftPadding;
    const topPadding    = Math.max(minTopPadding, Math.min(maxTopPadding, this.vpHeight * 0.08));
    const bottomPadding = Math.max(minBottomPadding, Math.min(maxBottomPadding, this.vpHeight * 0.16));

    const availableWidth  = Math.max(0, this.vpWidth - leftPadding - rightPadding);
    const availableHeight = Math.max(0, this.vpHeight - topPadding - bottomPadding);

    const widthLimitedStripWidth  = availableWidth / (n + (n - 1) * gapRatio);
    const heightLimitedStripWidth = availableHeight / SYMBOL_COUNT;
    const stripWidth = Math.min(widthLimitedStripWidth, heightLimitedStripWidth);
    const stripGap   = stripWidth * (1 + gapRatio);
    const contentWidth = stripWidth * (n + (n - 1) * gapRatio);
    const startX       = leftPadding + (availableWidth - contentWidth) / 2;

    // Symbols are square; strip height = symbol size × row count.
    const stripHeight = stripWidth * SYMBOL_COUNT;
    const stripY      = topPadding + (availableHeight - stripHeight) / 2;

    for (let i = 0; i < n; i++) {
      this.strips[i].x     = startX + i * stripGap;
      this.strips[i].y     = stripY;
      this.strips[i].width = stripWidth;
      this.strips[i].resize(stripHeight);
    }
  }

  private onSpin(): void {
    this.strips.forEach(strip => {
      strip.start();
      strip.setSpeed(SYMBOL_SPEED, 500, 'ease-out');
    });
  }

  private onStop(): void {
    // Generate a random predetermined outcome per reel (placeholder for server RNG).
    const outcomes: SymbolId[][] = this.strips.map(() =>
      Array.from({ length: 4 }, () => SYMBOL_IDS[Math.floor(Math.random() * SYMBOL_IDS.length)]),
    );

    // Stop reels one-by-one with a 300 ms stagger.
    this.strips.forEach((strip, i) => {
      setTimeout(() => strip.stopAligned(outcomes[i]), i * 300);
    });
  }
}
