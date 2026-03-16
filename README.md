# ZORG88 Space Lander

A 2D lunar lander arcade game rebuilt from scratch in **TypeScript + Vite**, replacing the original obfuscated GameMaker Studio HTML5 export with a clean, readable, fully modifiable codebase.

```
         /\
        /  \
       / /\ \
      /_/  \_\
     |  ●   |
    /|       |\
   / |       | \
  /__|_______|__\
     |  | |  |
    _|__|_|__|_
```

---

## What Changed from the Original

The original game (`ZORG88-LANDER/`) was exported from GameMaker Studio 2 as a single obfuscated JavaScript file (`LunarLander3.js` — ~2500 minified lines). It was served by a Python HTTP server and could not be meaningfully read or modified.

This rebuild:

- **Replaces** the entire GameMaker runtime with hand-written TypeScript using the Canvas 2D API
- **Preserves** all original sound effects (`.ogg` files reused directly from the export)
- **Restructures** the code into clearly named modules — one file per system or entity
- **Redesigns** the title screen with a bright card layout, floating animated dots, and a rainbow accent stripe (the original used a dark GameMaker UI)
- **Runs via Vite** dev server with hot module replacement, instead of a static Python server

The original game is kept in `ZORG88-LANDER/` for reference.

---

## Running the Game

```bash
npm run dev
```

Opens on **port 5000**. The canvas is fixed at 1024×768 and CSS-scaled to fill any window.

---

## How to Play

### Objective

Land your spacecraft on the marked pads on the lunar surface. Each level has three pads — land on all of them to advance. Complete all five levels to win.

### Controls

| Key | Action |
|-----|--------|
| `↑` Arrow Up | Fire main thruster |
| `←` `→` Arrow Left / Right | Rotate the lander |
| `M` | Toggle background music mute |
| `Enter` / `Space` | Confirm on title screen; restart after game over |
| `N` / `E` | Select Novice / Expert on difficulty screen |

### Landing Requirements

A landing only counts if **all three** conditions are met when you touch a pad:

| Parameter | Safe limit |
|-----------|-----------|
| Tilt angle | ≤ 20° from vertical |
| Vertical speed | < 4 px/frame |
| Horizontal speed | < 3 px/frame |

If you hit the terrain too hard, at the wrong angle, or land outside a pad — you explode.

---

## Scoring

### Landing Zones

Three pads appear on every level, each worth different points:

| Zone | Width | Base Points |
|------|-------|-------------|
| **A** (green) | 90 px | 200 |
| **B** (yellow) | 70 px | 400 |
| **C** (red) | 55 px | 600 |

Zone C is the smallest and hardest to hit — worth three times as much as Zone A.

### Bonuses

Both bonuses stack multiplicatively on top of the base zone score:

| Condition | Bonus |
|-----------|-------|
| Near-perfect angle (< 5°) | × 1.5 |
| Feather-soft touch (speed < 1 px/frame) | × 1.25 |

### Astronaut Rescue

Stranded astronauts appear on the terrain surface, waving for help. Flying close to one collects them automatically:

- **+150 points**
- **+50 fuel** (capped at your maximum)

Rescuing astronauts before landing is the best way to extend your run, especially in Expert mode where fuel is scarce.

---

## Hazards

### Asteroids

Irregularly-shaped rocks that bounce around the play area. Each has a randomised polygon shape and a slow tumbling spin. They bounce off the walls and ceiling but stay above the terrain.

- Novice: 2+ asteroids per level (1 + level number)
- Expert: 4+ asteroids per level (3 + level number), moving noticeably faster

### Laser Turrets

Ground-mounted turrets sit on the edges of the terrain. They cycle through a warm-up phase (the barrel glows orange), then fire a beam that sweeps across the screen. The beam fades in over about 1.5 seconds, giving you time to move.

- Lasers appear from level 2 onwards in Novice mode
- Expert mode has lasers from level 1, with more turrets and shorter cooldowns per level

---

## Difficulty Modes

Choose on the title screen. The mode affects every aspect of the challenge:

| Setting | Novice | Expert |
|---------|--------|--------|
| Starting fuel | 200 | 80 |
| Gravity | 0.06 px/frame² | 0.10 px/frame² |
| Thrust power | 0.18 | 0.16 |
| Rotation speed | 1.8°/frame | 2.2°/frame |
| Rotation limit | ±60° | ±50° |
| Asteroids per level | 1 + level | 3 + level |
| Laser cooldown | 300 frames | 180 − (level × 10) frames |
| Astronauts per level | 1 | 2 |

Expert is significantly harder — less fuel means every thrust counts, stronger gravity means you must thrust more often, and the tighter rotation limit makes precise corrections harder.

---

## Level Progression

The game has **five levels**. After landing on all three pads on a level, a new terrain is generated and the next level begins. Hazard count and speed increase with each level.

Each level's terrain is **procedurally generated** from a fixed seed (`level × 7`, adjusted for mode), so the layout is the same every run — you can learn it.

The three landing pads are placed at roughly 18%, 50%, and 78% across the terrain width. The terrain around each pad is flattened and smoothed so it is always reachable.

---

## HUD

The heads-up display runs along the top and bottom edges of the screen:

**Top bar**
- Ship icons showing remaining lives (start with 3)
- Current score (centre)
- Level number and mode label
- Fuel bar (right) — colour shifts green → orange → red as fuel drops

**Bottom-right corner (during flight)**
- `H:` — horizontal velocity (red if > 3)
- `V:` — vertical velocity (red if > 3)
- `A:` — current tilt angle in degrees (red if > 20°)

Watch the velocity and angle readouts when approaching a pad. All three indicators turning green means a safe landing is possible.

**Low fuel warning** — the lander body flashes red when fuel drops below 25% of maximum.

**Respawn invincibility** — after dying or completing a landing, the lander reappears with a brief invincibility window (shown by a blinking effect) so you are not immediately hit.

---

## Code Structure

```
index.html                  Entry point — registers service worker, loads main.ts
src/
  main.ts                   Creates the Game instance and calls start()
  Game.ts                   Main loop (requestAnimationFrame), scene manager
  Input.ts                  Keyboard state tracker (isDown / wasPressed)
  Audio.ts                  HTML5 audio wrapper — play, loop, mute toggle
  scenes/
    TitleScene.ts           Title card, animated dots, PLAY button, difficulty select
    GameScene.ts            All gameplay — phase state machine, collision, scoring, HUD
  entities/
    Lander.ts               Physics body: gravity, thrust, rotation, flame particles
    Asteroid.ts             Bouncing randomised polygon obstacle
    Laser.ts                Timed beam turret with warm-up animation
    Astronaut.ts            Collectible character — bobbing animation, waving arms
    Explosion.ts            Particle burst on death
  systems/
    Terrain.ts              Seeded procedural terrain, landing zone placement, draw
public/
  sounds/                   Original .ogg audio files from the GameMaker export
  sw.js                     Service worker — blocks the old cached game script
```

### Physics Summary (Lander.ts)

Each frame while thrusting:
```
rad = (angle − 90°) × π/180
vx += cos(rad) × thrustPower
vy += sin(rad) × thrustPower
fuel -= 1
```

Every frame:
```
vy += gravity
x  += vx
y  += vy
```

The lander bounces softly off the left and right walls (`vx` halved and reversed). Gravity is always downward; thrust direction is relative to the ship's current angle.

### Terrain Generation (Terrain.ts)

1. Generate 49 height samples using a linear congruential RNG seeded per level
2. Place three landing zones at fixed horizontal positions (~18%, 50%, 78%)
3. Flatten the height map at each zone and ramp the exit smoothly
4. Apply a 4-point average smooth pass (preserving the flat zones)
5. Build a polyline of `(x, y)` points and fill below it

Landing zone membership is tested by linear interpolation of adjacent height samples, so collision and rendering are always consistent.

---

## Browser Compatibility

Runs in any modern browser that supports:
- Canvas 2D API
- ES2020 modules (via Vite bundling)
- Web Audio / `<audio>` element
- Service Workers (for cache management)

---

## Original Game

The GameMaker Studio export is preserved in `ZORG88-LANDER/` and is no longer served. The Python server (`server.py`) that used to run it is still present but unused — `npm run dev` is the only server now.
