# PureTS Game

A TypeScript + SCSS browser game template. No frameworks — just Vite, TypeScript, and vanilla browser APIs.

---

## Tech Stack

| Concern | Tool |
|---|---|
| Language | TypeScript |
| Styles | SCSS (compiled by Vite) |
| Bundler | [Vite](https://vitejs.dev/) |
| Rendering | HTML5 Canvas + HTML overlay for UI |
| Runtime | Vanilla browser — no frameworks |

---

## Getting Started

### Requirements

- [Node.js](https://nodejs.org/)

### Install dependencies

Run once after cloning:

```
npm install
```

### Develop

```
npm run dev
```

Starts the Vite dev server with hot reload. TypeScript and SCSS are compiled automatically. Open the URL printed in the terminal (default: `http://localhost:5173`).

### Build for production

```
npm run build
```

Outputs an optimised bundle to `dist/`.

### Preview production build

```
npm run preview
```

### Type check only (no build)

```
npm run typecheck
```

---

## Project Structure

```
PureTS/
├── index.html               # Single HTML file — canvas + UI overlay
├── vite.config.ts           # Vite bundler config
├── tsconfig.json            # TypeScript compiler config
├── package.json
├── .gitignore
├── .vscode/
│   └── tasks.json           # Optional VS Code build tasks
│
├── assets/
│   ├── images/
│   ├── audio/
│   └── fonts/
│
├── styles/                  # Base tokens only — screen SCSS lives in src/screens/
│   ├── main.scss            # Imported by main.ts; Vite bundles everything from here
│   ├── _reset.scss
│   └── _variables.scss      # Colors, sizes, z-index tokens
│
├── dist/                    # Production build output (git-ignored)
│
└── src/
    ├── main.ts              # Entry point — imports styles, bootstraps the app
    ├── Config.ts            # Global constants and flags (e.g. debug mode)
    │
    ├── types/
    │   ├── index.ts         # Shared interfaces — includes GameEvents map
    │   └── scss.d.ts        # Ambient declaration allowing .scss imports in TS
    │
    ├── objects/
    │   ├── GameObject.ts    # Base class for every object in the game world
    │   ├── ButtonObject.ts  # Canvas-rendered clickable button
    │   ├── Column.ts        # Scrolling dot column
    │   └── ColumnDot.ts     # Single scrolling dot used by Column
    │
    ├── systems/             # Per-frame processors — run every game loop tick
    │   ├── InputSystem.ts   # Keyboard, mouse, gamepad input
    │   ├── PhysicsSystem.ts # Movement, gravity, collision detection
    │   ├── RenderSystem.ts  # Clears canvas, draws layers bottom to top
    │   └── debug/
    │       ├── DebugSystem.ts    # Hitboxes, vectors, FPS overlay (debug only)
    │       ├── DebugPanel.ts
    │       ├── InfoPanel.ts
    │       ├── EventLogPanel.ts
    │       └── PanelRow.ts
    │
    ├── managers/            # Stateful coordinators — not per-frame processors
    │   ├── ScreenManager.ts # Holds active screen, handles transitions
    │   ├── AudioManager.ts  # Music and sound effects
    │   └── ResourceManager.ts  # Loads and caches images, audio, fonts
    │
    ├── screens/             # Each screen is a self-contained folder
    │   ├── Screen.ts        # Base screen — owns an ordered layer stack
    │   ├── Layer.ts         # Base layer — owns a list of GameObjects
    │   │
    │   ├── game/
    │   │   ├── GameScreen.ts
    │   │   ├── GameScreen.scss
    │   │   └── Layers/
    │   │       ├── BackgroundLayer.ts   # Sky, distant scenery, parallax
    │   │       ├── MidgroundLayer.ts    # Terrain, platforms, structures
    │   │       ├── ForegroundLayer.ts   # Player, enemies, items
    │   │       └── UILayer.ts           # HTML overlay — HUD, dialogue, menus
    │   │
    │   ├── mainMenu/
    │   │   ├── MainMenuScreen.ts
    │   │   └── Layers/
    │   │       └── MainMenuLayer.ts
    │   │
    │   ├── gameOver/
    │   │   ├── GameOverScreen.ts
    │   │   └── Layers/
    │   │
    │   └── intro/
    │       ├── IntroScreen.ts       # Three-state fade-in / wait / fade-out
    │       └── Layers/
    │           └── IntroForegroundLayer.ts  # Full-screen black overlay
    │
    ├── events/
    │   └── EventBus.ts      # Typed pub/sub bus — decouples systems
    │
    ├── api/                 # Network layer
    │   ├── ApiClient.ts     # Base HTTP wrapper
    │   ├── ScoreApi.ts      # Leaderboard and score submission
    │   └── PlayerApi.ts     # Player profile and save data
    │
    └── utils/
        ├── helpers.ts       # General utility functions
        ├── Logger.ts        # Structured logger (silenced in production)
        └── Strings.ts       # Localised string lookup — t('key')
```

---

## Architecture

### Rendering Model

The game uses a **hybrid canvas + HTML** approach:

- **`<canvas id="world">`** — the game world. `RenderSystem` draws Background, Midground, and Foreground layers to this each frame.
- **`<div id="ui-layer">`** — HTML overlay above the canvas (`z-index: 10`). Used for all text-heavy UI: HUD, dialogue, menus, tooltips. Styled with SCSS.
- **`<div id="debug-layer">`** — HTML overlay above everything (`z-index: 100`), shown only when `Config.debug = true`. `DebugSystem` creates and manages all children here at runtime — nothing is hard-coded in the HTML.

### Game Loop

Each frame the game loop calls:

```
InputSystem.step(dt)
PhysicsSystem.step(dt)   →   Screen.step(dt)   →   Layer.step(dt)   →   GameObject.step(dt)
RenderSystem.draw(ctx)   →   Screen.draw(ctx)  →   Layer.draw(ctx)  →   GameObject.draw(ctx)
DebugSystem.draw(...)    →   (overlays, only when Config.debug = true)
```

### Screen / Layer Pattern

Each screen folder is self-contained — its TypeScript and SCSS live together. SCSS files are imported directly in the TypeScript layer file; Vite picks them up automatically:

```
screens/game/
  GameScreen.ts       ← extends Screen, adds its layers in onEnter()
  GameScreen.scss
  Layers/
    BackgroundLayer.ts  ← extends Layer, canvas draw calls
    ForegroundLayer.ts
    UILayer.ts          ← import './UILayer.scss' at the top
    UILayer.scss
```

Adding a new screen means adding a new folder. Nothing central changes.

### Events

Systems and objects never call each other directly. They communicate through `EventBus`:

```ts
// anywhere
eventBus.emit('player:died', { score: 100 });

// api layer
eventBus.on('player:died', (data) => scoreApi.submit(data.score));
```

All valid event names and their payload types are defined in `src/types/index.ts` (`GameEvents`). Built-in events:

| Event | Payload | Emitted by |
|---|---|---|
| `screen:transition` | `{ to: string }` | external callers (advisory) |
| `screen:entered` | `{ name: string }` | `ScreenManager` after `onEnter()` resolves |
| `player:died` | `{ score: number }` | game logic |
| `player:scored` | `{ points: number }` | game logic |

### Game State

State has three natural homes depending on its scope:

**Object-local** (health, ammo, cooldowns) — properties on the `GameObject` subclass. Changes are announced outward via `EventBus`; nothing else reaches in to read them directly:

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

**Screen-wide** (score, level, wave) — properties on the `Screen`. Pass the screen (or a context object) into layers and objects that need it:

```ts
class GameScreen extends Screen {
  score = 0;

  async onEnter(): Promise<void> {
    this.addLayer(new ForegroundLayer(this.eventBus, this));
    eventBus.on('player:scored', ({ points }) => { this.score += points; });
  }
}
```

**Persisted / cross-screen** (high score, player name, settings) — a plain session object created in `main.ts` and forwarded into screens that need it:

```ts
// main.ts
const session = { highScore: 0, playerName: '' };
screenManager.transition(new IntroScreen(eventBus, audio, screenManager, session));
```

Any new event names used for state changes (e.g. `'player:health-changed'`) must be added to `GameEvents` in `src/types/index.ts` before emitting.

### Layer flags

| Property | Default | Purpose |
|---|---|---|
| `active` | `true` | When false, `step()` is skipped for all objects in the layer |
| `visible` | `true` | When false, `draw()` is skipped for all objects in the layer |
| `alpha` | `1` | Multiplies `ctx.globalAlpha` for every object in the layer — use for layer-wide fades |

### GameObject flags

| Property | Default | Purpose |
|---|---|---|
| `active` | `true` | When false, `step()` is skipped |
| `visible` | `true` | When false, `draw()` is skipped |
| `alpha` | `1` | Multiplies `ctx.globalAlpha` for this object's draw call |
| `clipToBounds` | `false` | When true, `draw()` is clipped to the object's `x/y/width/height` rect |

### Localisation

`src/utils/Strings.ts` provides a minimal `t(key)` lookup:

```ts
import { t } from '../utils/Strings';

t('play') // → 'Play'
```

Add new keys to the `locales.en` object in `Strings.ts`. Add new languages as additional locale entries. Call `setLocale('fr')` to switch at runtime.

### Debug Mode

Set `Config.debug = false` in `src/Config.ts` before a production build. This silences `Logger.info/warn` and disables all `DebugSystem` overlays. Errors always log regardless.

When `Config.debug = true`, `DebugSystem` renders two panels inside `#debug-layer`:

- **Info panel** (top-left) — FPS counter, active screen name.
- **Event panel** (top-right) — live log of every `EventBus.emit()` call, newest first. Capped at 8 rows.

Canvas overlays (hitboxes, velocity vectors, object id/tags) are drawn on top of the world canvas after `RenderSystem`.
