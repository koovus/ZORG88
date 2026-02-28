# ZORG88 Space Lander

## Overview
A 2D lunar lander arcade game exported from GameMaker Studio as HTML5. The player navigates a spacecraft to land on designated pads while managing fuel and avoiding obstacles like asteroids and lasers.

## Structure
- `ZORG88-LANDER/index.html` - Entry point, loads the game canvas
- `ZORG88-LANDER/html5game/LunarLander3.js` - Main game logic (obfuscated GameMaker export)
- `ZORG88-LANDER/html5game/LunarLander3_texture_0.png` - Sprite texture atlas
- `ZORG88-LANDER/html5game/particles/` - Particle effect images (IDR_GIF2-15)
- `ZORG88-LANDER/html5game/snd_*.mp3|ogg` - Sound effects and music
- `server.py` - Simple Python HTTP server for serving the static game files

## Running
The game is served via `python server.py` on port 5000.

## Game Modes
- Novice (object_lander_easy) - 200 fuel, standard gravity
- Extreme (object_lander_extreme) - 50 fuel, same gravity, harder terrain/obstacles

## Key Game Properties (obfuscated names)
- `_1b` = gravity (0.1 default)
- `_8a` = fuel (Novice), `_Z9` = fuel (Extreme)
- `_Fc` = engine active flag (Novice), `_2b` = engine active flag (Extreme)
- `_Y9` = rotation/image_angle
- `_8b` = vertical speed, `_eb` = horizontal speed
