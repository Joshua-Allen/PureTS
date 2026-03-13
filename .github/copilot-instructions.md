# PureTS — LLM Coding Instructions

This is a vanilla TypeScript web app / browser game template. No React, no Angular, no runtime framework of any kind. The stack is **Vite + TypeScript + SCSS**, targeting the browser directly.

Read this file fully before making any changes. It defines the conventions that keep the codebase consistent.

---

## Tech Stack

| Concern | Tool |
|---|---|
| Language | TypeScript (strict mode) |
| Bundler | Vite — `npm run dev` / `npm run build` |
| Styles | SCSS, imported directly into TypeScript files |
| Rendering | HTML5 Canvas (`#world`) + HTML overlay (`#ui-layer`) |
| Events | `EventBus` — typed pub/sub, no direct cross-system calls |

There is no Node.js runtime at play time. Everything runs in the browser.

---

## Project Layout

```
src/
  main.ts              ← entry point; imports styles, wires systems, starts loop
  Config.ts            ← global flags (debug, maxDeltaTime, clearColor)
  types/
    index.ts           ← all shared interfaces and the GameEvents map
    scss.d.ts          ← ambient module declaration for .scss imports
  objects/
    GameObject.ts      ← base class for every world object
  systems/             ← per-frame processors (called every tick from main.ts)
  managers/            ← stateful coordinators (not per-frame)
  screens/             ← one folder per screen, self-contained
  events/
    EventBus.ts        ← typed pub/sub bus
  api/                 ← HTTP wrappers; only these files touch the network
  utils/               ← pure helpers and Logger
styles/
  main.scss            ← imported by main.ts; pulls in _reset and _variables
  _reset.scss
  _variables.scss      ← SCSS design tokens
```

---

## Core Patterns

### 1. The Game Loop (main.ts)

```
InputSystem.step(dt)
PhysicsSystem.step(dt, screen)  →  Screen.step(dt)  →  Layer.step(dt)  →  GameObject.step(dt)
RenderSystem.draw(screen)       →  Screen.draw(ctx)  →  Layer.draw(ctx)  →  GameObject.draw(ctx)
DebugSystem.draw(ctx, layers, dt)
```

`dt` is capped at `Config.maxDeltaTime` (0.05 s) to prevent spiral-of-death on slow frames.

### 2. Screens

- Extend `Screen` (`src/screens/Screen.ts`).
- Each screen lives in its own folder: `src/screens/<name>/`.
- Build the layer stack inside `onEnter()`. It can be `async` — `ScreenManager` awaits it before the loop interacts with the screen.
- Tear down (stop audio, clear timers) in `onExit()`. `ScreenManager` calls `clear()` automatically which destroys all layers and their objects.
- Navigate between screens by calling `screenManager.transition(new NextScreen(...))` — never instantiate a screen and use it directly.

```ts
export class MyScreen extends Screen {
  async onEnter(): Promise<void> {
    this.addLayer(new BackgroundLayer());
    this.addLayer(new UILayer());
  }
  onExit(): void { /* stop audio, clear timers */ }
}
```

### 3. Layers

- Extend `Layer` (`src/screens/Layer.ts`).
- Canvas layers override `draw(ctx)` to paint. Objects are iterated automatically via the base `draw()`.
- HTML overlay layers (e.g. `UILayer`, `IntroUILayer`) override `draw()` as a no-op and manage DOM elements directly.
- Import the layer's `.scss` file at the top of the `.ts` file — Vite bundles it:
  ```ts
  import './MyLayer.scss';
  ```
- Place the layer's `.scss` file in the same folder as the `.ts` file.
- Call `layer.add(gameObject)` to register objects — this calls `object.__init()`.

### 4. GameObjects

- Extend `GameObject` (`src/objects/GameObject.ts`).
- Override `init()`, `step(dt)`, `draw(ctx)`, `onCollide(other)`, `onDestroy()`. Never override the `__` prefixed methods — those are internal lifecycle wrappers.
- `vx` / `vy` (px/s) are integrated into `x` / `y` automatically by `__step` before `step()` is called.
- Use `tags` (`string[]`) to categorise objects. The `'static'` tag skips gravity in `PhysicsSystem`. Other tags are free-form.
- To remove an object during gameplay, call `obj.destroy()` and then `layer.remove(obj)`.

### 5. EventBus

All cross-system communication goes through `EventBus`. **Systems never import or call each other directly.**

- All valid event names and payload types are declared in `GameEvents` in `src/types/index.ts`. Add new events there before using them.
- Use `eventBus.on(event, handler)` to subscribe. Use `eventBus.off(event, handler)` to unsubscribe on cleanup.
- Use `eventBus.emit(event, data)` to publish.

```ts
// Declare in src/types/index.ts:
export interface GameEvents {
  'enemy:killed': { id: number; points: number };
}

// Subscribe:
eventBus.on('enemy:killed', ({ id, points }) => { ... });

// Emit:
eventBus.emit('enemy:killed', { id: enemy.id, points: 100 });
```

### 6. SCSS / Styles

- `styles/main.scss` is the global stylesheet and is imported once in `main.ts`.
- Each layer or screen that needs CSS creates a `.scss` file alongside its `.ts` file and imports it at the top of the `.ts` file.
- Design tokens (colors, z-index values, sizes) go in `styles/_variables.scss`. Use `@use '../../../styles/variables' as *;` in component SCSS files — adjust the relative path as needed.
- Do not add a `<link>` tag to `index.html`; Vite injects CSS automatically from imports.

### 7. Assets (images, audio, fonts)

Static files live in `assets/`. Reference them in TypeScript using root-relative paths:

```ts
resources.register({ key: 'hero', src: '/assets/images/hero.png' });
audio.register({ key: 'bgm', src: '/assets/audio/theme.mp3', loop: true, volume: 0.7 });
```

Await asset loading in `onEnter()` before building layers so `getImage()` calls are safe:

```ts
async onEnter(): Promise<void> {
  await resources.loadAll(
    [{ key: 'hero', src: '/assets/images/hero.png' }],
    []
  );
  this.addLayer(new ForegroundLayer(resources));
}
```

### 8. API Layer

- Only files in `src/api/` make network requests.
- API classes receive `EventBus` in their constructor and react to events — they are never called directly from game systems.
- `ApiClient` (`src/api/ApiClient.ts`) is the shared HTTP base. All `fetch` calls go through it.
- Add new events to `GameEvents` when a game action should trigger an API call.

### 9. Config

`Config.ts` is the single source of truth for global flags:

| Property | Default | Purpose |
|---|---|---|
| `Config.debug` | `true` | Enables `DebugSystem` overlays and `Logger.info/warn` output |
| `Config.maxDeltaTime` | `0.05` | Caps the physics step in seconds |
| `Config.clearColor` | `'#ffffff'` | Canvas clear color each frame |

Set `Config.debug = false` before a production build.

### 10. Logger

Use `Logger` instead of `console.log` directly:

```ts
Logger.info('MySystem', 'initialised', { value });   // silenced when debug=false
Logger.warn('MySystem', 'something odd');             // silenced when debug=false
Logger.error('MySystem', 'fatal', error);             // always logs
```

---

## How to Add Things

### New screen

1. Create `src/screens/<name>/<Name>Screen.ts` extending `Screen`.
2. Create `src/screens/<name>/Layers/` for its layer files.
3. Transition to it: `screenManager.transition(new NameScreen(eventBus, audio, screenManager))`.

### New layer

1. Create `src/screens/<screen>/Layers/<Name>Layer.ts` extending `Layer`.
2. If it needs styles, create `<Name>Layer.scss` alongside it and import it at the top of the `.ts` file.
3. Add it to the screen's `onEnter()` via `this.addLayer(new NameLayer(...))`. Order determines draw order — first added = furthest back.

### New game object

1. Create a class extending `GameObject` anywhere under `src/`.
2. Override `init()`, `step(dt)`, `draw(ctx)` as needed.
3. Add it to a layer: `layer.add(new MyObject(...))`.

### New event

1. Add the event name and payload type to `GameEvents` in `src/types/index.ts`.
2. Emit with `eventBus.emit(...)` and subscribe with `eventBus.on(...)`.

### Game state

State has three natural homes depending on its scope:

**Object-local** (health, ammo, cooldowns) — properties on the `GameObject` subclass. Announce changes outward via `EventBus`; never let other systems reach in and read them directly:

```ts
class Player extends GameObject {
  health = 100;

  takeDamage(amount: number): void {
    this.health -= amount;
    eventBus.emit('player:health-changed', { health: this.health });
    if (this.health <= 0) eventBus.emit('player:died', { score: this.score });
  }
}
```

**Screen-wide** (score, level, wave) — properties on the `Screen`. Pass the screen (or a context object) into layers and objects that need to read or mutate it:

```ts
class GameScreen extends Screen {
  score = 0;

  async onEnter(): Promise<void> {
    this.addLayer(new ForegroundLayer(this.eventBus, this));
    eventBus.on('player:scored', ({ points }) => { this.score += points; });
  }
}
```

**Persisted / cross-screen** (high score, player name, settings) — a plain session object created in `main.ts` and passed into screens that need it:

```ts
// main.ts
const session = { highScore: 0, playerName: '' };
screenManager.transition(new IntroScreen(eventBus, audio, screenManager, session));
```

Remember to add any new event names and payloads (e.g. `'player:health-changed'`) to `GameEvents` in `src/types/index.ts` before emitting them.

### New API endpoint

1. Implement it in the appropriate `src/api/*.ts` class.
2. Use `ApiClient` for the actual `fetch` call.
3. Wire it to an event in the class constructor — do not call it directly from a system.

---

## What NOT to Do

- Do not import one system from another (e.g. `InputSystem` into `PhysicsSystem`). Use `EventBus` instead.
- Do not add `<link>` or `<script>` tags to `index.html` for CSS or runtime JS — Vite handles this.
- Do not call `fetch` outside of `src/api/`.
- Do not skip `onExit()` cleanup — unreleased timers and listeners will persist across screen transitions.
- Do not override `__init`, `__step`, `__draw`, or `__destroy` on `GameObject` — override the unhooky hooks (`init`, `step`, `draw`, `onDestroy`).
- Do not emit events whose names are not in `GameEvents`. Add them to the type map first.
