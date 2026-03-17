// ============================================================
// Layer.ts  —  Base class for all rendering layers.
//              Layers stack inside a Screen and are drawn
//              in ascending z-order each frame.
//
//              Canvas layers (Background, Midground, Foreground):
//                override draw(ctx) to paint to the canvas.
//
//              HTML layer (UI):
//                overrides draw(ctx) as a no-op and manages
//                DOM elements directly instead.
// ============================================================

import { GameObject } from '../objects/GameObject';

export class Layer {
  active:  boolean = true;
  visible: boolean = true;
  alpha:   number  = 1;

  protected objects: GameObject[] = [];

  // Adds an object to this layer and calls its init hook.
  add(object: GameObject): void {
    this.objects.push(object);
    object.__init();
  }

  // Removes an object from this layer by id.
  remove(object: GameObject): void {
    this.objects = this.objects.filter(o => o.id !== object.id);
  }

  // Called every frame by PhysicsSystem.
  // Iterates active objects and calls step(dt) on each.
  step(dt: number): void {
    if (!this.active) return;
    for (const o of this.objects) {
      if (o.active) o.__step(dt);
    }
  }

  // Called every frame by RenderSystem.
  // Iterates visible objects sorted by depth (ascending) and calls draw(ctx) on each.
  // UILayer overrides this as a no-op.
  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.visible) return;
    const sorted = this.objects.slice().sort((a, b) => a.depth - b.depth);
    if (this.alpha === 1) {
      for (const o of sorted) {
        if (o.visible) o.__draw(ctx);
      }
      return;
    }
    const prev = ctx.globalAlpha;
    ctx.globalAlpha = prev * this.alpha;
    for (const o of sorted) {
      if (o.visible) o.__draw(ctx);
    }
    ctx.globalAlpha = prev;
  }

  // Returns a read-only view of this layer's objects.
  // Used by PhysicsSystem and DebugSystem for collision detection / overlays.
  getObjects(): readonly GameObject[] {
    return this.objects;
  }

  // Destroys all objects and empties the layer.
  // Called on screen transitions.
  clear(): void {
    for (const o of this.objects) o.__destroy();
    this.objects = [];
  }
}
