// ============================================================
// PhysicsSystem.ts  —  Advances simulation and detects collisions.
//
// Each frame:
//   1. Gravity is applied to every non-static object (vy += gravity * dt).
//   2. screen.step(dt) is called — this propagates to every Layer and
//      every GameObject, integrating velocity into position.
//   3. AABB overlap is tested for every active pair; onCollide() is
//      called on both objects when they intersect.
//
// Tag conventions:
//   'static' — immovable (platforms, walls). Gravity is skipped and
//              they are not moved by collision resolution, but onCollide
//              is still called so objects can react to hitting them.
// ============================================================

import { EventBus }  from '../events/EventBus';
import { Screen }    from '../screens/Screen';
import { GameObject } from '../objects/GameObject';

export class PhysicsSystem {
  // Pixels per second² downward. Set to 0 to disable gravity globally.
  gravity = 980;

  constructor(private readonly eventBus: EventBus) {}

  // Called once per frame from the game loop.
  step(dt: number, screen: Screen | null): void {
    if (!screen) return;

    const objects = this.collectObjects(screen);

    // 1. Apply gravity before position integration.
    for (const obj of objects) {
      if (!obj.tags.includes('static')) {
        obj.vy += this.gravity * dt;
      }
    }

    // 2. Integrate velocity → position and call each object's step().
    screen.step(dt);

    // 3. Broad-phase AABB collision detection.
    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        const a = objects[i];
        const b = objects[j];
        if (this.overlaps(a, b)) {
          a.onCollide(b);
          b.onCollide(a);
        }
      }
    }
  }

  // ---- Private helpers -----------------------------------------

  // Flattens all active objects from every layer into a single array.
  private collectObjects(screen: Screen): GameObject[] {
    const result: GameObject[] = [];
    for (const layer of screen.layers) {
      if (!layer.active) continue;
      for (const obj of layer.getObjects()) {
        if (obj.active) result.push(obj);
      }
    }
    return result;
  }

  // Axis-aligned bounding box overlap test.
  private overlaps(a: GameObject, b: GameObject): boolean {
    return (
      a.x             < b.x + b.width  &&
      a.x + a.width   > b.x            &&
      a.y             < b.y + b.height &&
      a.y + a.height  > b.y
    );
  }
}
