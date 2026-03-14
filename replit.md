# ZORG88 Space Lander

## Overview
A 2D lunar lander arcade game rebuilt from scratch in TypeScript using the Canvas 2D API and Vite. The player navigates a lander to land on designated pads while managing fuel and avoiding asteroids and lasers.

The original GameMaker Studio HTML5 export still lives in `ZORG88-LANDER/` for reference (sounds are reused from it).

## Running
```
npm run dev
```
Served via Vite on port 5000.

## Project Structure
```
index.html              - Entry point
src/
  main.ts               - Entry: creates and starts the Game
  Game.ts               - Main game loop, scene manager, canvas setup
  Input.ts              - Keyboard input (keydown/keyup tracking)
  Audio.ts              - HTML5 audio wrapper (play, loop, mute)
  scenes/
    TitleScene.ts       - Title screen + mode selection (NOVICE / EXPERT)
    GameScene.ts        - Main gameplay (lander, hazards, HUD, scoring)
  entities/
    Lander.ts           - Player ship: physics, thrust, fuel, drawing
    Asteroid.ts         - Bouncing asteroid hazard
    Laser.ts            - Laser turret with cooldown/fire cycle
    Astronaut.ts        - Rescuable astronaut (grants +50 fuel)
    Explosion.ts        - Particle explosion effect
  systems/
    Terrain.ts          - Procedural height-map terrain + landing zones
public/
  sounds/               - OGG sound effects (from original game)
```

## Game Modes
- **Novice**: 200 fuel, 0.06 gravity, 1 asteroid/level, fewer lasers
- **Expert**: 80 fuel, 0.10 gravity, 3+ asteroids/level, more lasers, smaller zones

## Controls
- **Arrow Up** — Thrust
- **Arrow Left/Right** — Rotate
- **M** — Toggle music mute
- **Enter/Space** — Confirm / restart

## Scoring
- Zone A (large): 200 pts
- Zone B (medium): 400 pts
- Zone C (small): 600 pts
- Bonus for perfect angle (<5°): ×1.5 multiplier
- Bonus for soft touch (<1 px/frame): ×1.25 multiplier
- Astronaut rescue: +150 pts + 50 fuel

## Landing Requirements
- Angle: ≤ 20°
- Vertical speed: < 4 px/frame
- Horizontal speed: < 3 px/frame

## Architecture Notes
- Canvas fixed at 1024×768, CSS-scaled to fill viewport
- Terrain generated with a seeded RNG per level (seed = level × 7)
- 5 levels before victory; each level increases hazard count/speed
- Vite HMR active during development (no manual refresh needed)
