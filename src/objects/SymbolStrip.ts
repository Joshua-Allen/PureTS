// ============================================================
// objects/SymbolStrip.ts  —  A column whose symbols scroll downward and wrap
// ============================================================

import { GameObject } from './GameObject';
import { ResourceManager } from '../managers/ResourceManager';
import { type SymbolId, SYMBOL_IDS } from '../Symbols';
import { lerp, clamp, resolveEasing, type Easing, type EasingFn } from '../utils/helpers';

export const SYMBOL_COUNT = 4;
export const SYMBOL_SPEED = 1300; // px/s

/**
 * Position easing for the stop phase: ease-out cubic.
 * p(0)=0, p(1)=1, p'(0)=3 (fast start), p'(1)=0 (smooth stop).
 * Integral ∫₀¹ p'(t) dt = 1 ← position, not speed, so no integration error accumulates.
 */
function stopPosEasing(t: number): number {
  return 1 - (1 - t) * (1 - t) * (1 - t);
}

function randomSymbolId(): SymbolId {
  return SYMBOL_IDS[Math.floor(Math.random() * SYMBOL_IDS.length)];
}

export class SymbolStrip extends GameObject {
  private readonly slots: SlotSymbol[];
  private get symbolHeight(): number { return this.height / SYMBOL_COUNT; }
  private spinning = false;
  private speed = 0;
  private tween: SpeedTween | null = null;
  private stopTween: StopTween | null = null;

  constructor(
    private readonly resources: ResourceManager,
    x = 0, y = 0, width = 60, height = 300,
  ) {
    super(['static'], x, y, width, height);
    this.clipToBounds = true;

    // SYMBOL_COUNT+1 slots so one is always above the strip to fill the gap on wrap.
    this.slots = Array.from(
      { length: SYMBOL_COUNT + 1 },
      (_, i) => new SlotSymbol((i - 1) * (height / SYMBOL_COUNT)),
    );
  }

  start(): void { this.spinning = true; }
  stop():  void { this.spinning = false; this.stopTween = null; this.tween = null; }

  /** Resize the strip, scaling slot positions to match the new height. */
  resize(newHeight: number): void {
    if (newHeight === this.height) return;
    const scale = newHeight / this.height;
    for (const slot of this.slots) slot.yOffset *= scale;
    this.height = newHeight;
  }

  /**
   * Decelerate to a grid-aligned stop so that `finalSymbols[row]` lands in each visible row.
   *
   * Uses a position tween to drive slot positions, so the total
   * scroll distance equals `scrollDistance` exactly.
   * The final teleport to grid-aligned positions corrects only floating-point residue
   * (sub-pixel) and is invisible.
   *
   * @param finalSymbols  SYMBOL_COUNT SymbolIds, top-to-bottom, for the outcome.
   * @param minExtraLaps  Minimum full strip-heights to scroll before stopping (default 1).
   */
  stopAligned(finalSymbols: SymbolId[], minExtraLaps = 1): void {
    if (!this.spinning) return;

    // Cancel any speed tween (spin-up) that may still be running.
    this.tween = null;

    const effectiveSpeed = Math.max(this.speed, SYMBOL_SPEED * 0.1);

    // Align scroll distance to the nearest grid boundary.
    const phase = ((this.slots[0].yOffset % this.symbolHeight) + this.symbolHeight) % this.symbolHeight;
    const distanceToAlign = (this.symbolHeight - phase) % this.symbolHeight;
    const scrollDistance = distanceToAlign + minExtraLaps * this.height;

    // Duration: initial speed of stopPosEasing = p'(0) = 3, so T = 3·d / v₀.
    const durationMs = (scrollDistance * 2000) / effectiveSpeed;

    this.stopTween = {
      scrollDistance,
      durationMs,
      elapsed:      0,
      prevProgress: 0,
      finalMap:     this.computeFinalMap(scrollDistance, finalSymbols),
    };
  }

  /**
   * Precompute the exact grid-aligned final yOffset and symbolId for every slot
   * after scrolling `scrollDistance` pixels.
   */
  private computeFinalMap(
    scrollDistance: number,
    finalSymbols: SymbolId[],
  ): Map<number, { yOffset: number; symbolId: SymbolId }> {
    const period = this.height + this.symbolHeight;
    const map = new Map<number, { yOffset: number; symbolId: SymbolId }>();
    for (let i = 0; i < this.slots.length; i++) {
      const rawY = ((this.slots[i].yOffset + scrollDistance + this.symbolHeight) % period) - this.symbolHeight;
      const row  = Math.round(rawY / this.symbolHeight);
      map.set(i, {
        yOffset:  row * this.symbolHeight, // exactly grid-aligned
        symbolId: (row >= 0 && row < SYMBOL_COUNT) ? finalSymbols[row] : randomSymbolId(),
      });
    }
    return map;
  }

  /**
   * Set the scroll speed (px/s).
   * @param target     Target speed in px/s.
   * @param durationMs Transition time in ms. Defaults to 0 (instant).
   * @param easing     Named easing or custom (t: number) => number function.
   */
  setSpeed(target: number, durationMs = 0, easing: Easing = 'linear'): void {
    if (durationMs <= 0) {
      this.speed = target;
      this.tween = null;
      return;
    }
    this.tween = {
      fromSpeed:  this.speed,
      targetSpeed: target,
      durationMs,
      elapsed:    0,
      easingFn:   resolveEasing(easing),
    };
  }

  /** Returns the SYMBOL_COUNT visible symbols ordered top-to-bottom. */
  getSymbols(): SymbolId[] {
    return this.slots
      .filter(s => s.yOffset >= 0)
      .sort((a, b) => a.yOffset - b.yOffset)
      .slice(0, SYMBOL_COUNT)
      .map(s => s.symbolId);
  }

  override step(dt: number): void {
    // ── Stop phase: position-driven tween
    if (this.stopTween !== null) {
      this.stopTween.elapsed += dt * 1000;
      const t           = clamp(this.stopTween.elapsed / this.stopTween.durationMs, 0, 1);
      const newProgress = stopPosEasing(t);
      const delta       = (newProgress - this.stopTween.prevProgress) * this.stopTween.scrollDistance;
      this.stopTween.prevProgress = newProgress;
      this.speed = delta / dt; // keep speed field approximately accurate

      const period = this.height + this.symbolHeight;
      for (let i = 0; i < this.slots.length; i++) {
        const slot = this.slots[i];
        let y = slot.yOffset + delta;
        if (y >= this.height) {
          // Use the predetermined symbol whenever this slot wraps.
          slot.symbolId = this.stopTween.finalMap.get(i)?.symbolId ?? randomSymbolId();
          y -= period;
        }
        slot.yOffset = y;
      }

      if (t >= 1) {
        // Place slots at exact precomputed grid positions — only fp residue remains.
        for (const [i, { yOffset, symbolId }] of this.stopTween.finalMap) {
          this.slots[i].yOffset  = yOffset;
          this.slots[i].symbolId = symbolId;
        }
        this.stopTween = null;
        this.speed     = 0;
        this.spinning  = false;
      }
      return;
    }

    if (!this.spinning) return;

    // ── Free-spin phase: speed tween ──
    if (this.tween !== null) {
      this.tween.elapsed += dt * 1000;
      const t = clamp(this.tween.elapsed / this.tween.durationMs, 0, 1);
      this.speed = lerp(this.tween.fromSpeed, this.tween.targetSpeed, this.tween.easingFn(t));
      if (t >= 1) this.tween = null;
    }

    for (let i = 0; i < this.slots.length; i++) {
      this.slots[i].step(dt, this.speed, this.height, this.symbolHeight);
    }
  }

  override draw(ctx: CanvasRenderingContext2D): void {
    const { x, y, width, height } = this;

    // Background
    ctx.fillStyle = '#333333';
    ctx.fillRect(x, y, width, height);

    // Symbols
    for (const slot of this.slots) {
      slot.draw(ctx, x, y, width, this.symbolHeight, this.resources);
    }
  }
}

class SlotSymbol {
  /** y offset relative to the strip's top edge (0 … stripHeight) */
  yOffset: number;
  symbolId: SymbolId;

  constructor(yOffset: number) {
    this.yOffset  = yOffset;
    this.symbolId = randomSymbolId();
  }

  /** Move downward; when the symbol leaves the bottom, place it above the strip. */
  step(dt: number, speed: number, stripHeight: number, symbolHeight: number): void {
    const next = this.yOffset + speed * dt;
    if (next >= stripHeight) {
      this.symbolId = randomSymbolId();
      this.yOffset  = next - stripHeight - symbolHeight;
    } else {
      this.yOffset = next;
    }
  }

  draw(
    ctx: CanvasRenderingContext2D,
    stripX: number,
    stripY: number,
    width: number,
    symbolHeight: number,
    resources: ResourceManager,
  ): void {
    const img  = resources.getImage(this.symbolId);
    const size = Math.min(width, symbolHeight);
    const dx   = stripX + (width        - size) / 2;
    const dy   = stripY + (symbolHeight - size) / 2 + this.yOffset;
    ctx.drawImage(img, dx, dy, size, size);
  }
}

interface SpeedTween {
  fromSpeed:   number;
  targetSpeed: number;
  durationMs:  number;
  elapsed:     number;
  easingFn:    EasingFn;
}

interface StopTween {
  scrollDistance: number;
  durationMs:     number;
  elapsed:        number;
  prevProgress:   number;
  finalMap:       Map<number, { yOffset: number; symbolId: SymbolId }>;
}


