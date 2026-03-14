import { Input } from '../Input';
import { Audio } from '../Audio';
import { Lander, NOVICE_CONFIG, EXPERT_CONFIG } from '../entities/Lander';
import { Asteroid } from '../entities/Asteroid';
import { Laser } from '../entities/Laser';
import { Astronaut } from '../entities/Astronaut';
import { Explosion } from '../entities/Explosion';
import { generateTerrain, getTerrainY, drawTerrain, TerrainPoint, LandingZone } from '../systems/Terrain';
import type { GameMode } from './TitleScene';

const W = 1024;
const H = 768;

type Phase = 'playing' | 'dying' | 'respawning' | 'landing' | 'level_clear' | 'game_over' | 'victory';

interface Star {
  x: number;
  y: number;
  r: number;
  bright: number;
}

export class GameScene {
  done = false;
  private mode: GameMode;
  private score = 0;
  private lives: number;
  private level = 1;
  private phase: Phase = 'playing';
  private phaseTimer = 0;
  private lander!: Lander;
  private asteroids: Asteroid[] = [];
  private lasers: Laser[] = [];
  private astronauts: Astronaut[] = [];
  private explosions: Explosion[] = [];
  private terrainPoints: TerrainPoint[] = [];
  private landingZones: LandingZone[] = [];
  private stars: Star[] = [];
  private message = '';
  private messageTimer = 0;
  private messageColor = '#ffffff';
  private invincible = 0;
  private audio: Audio;
  private input: Input;

  constructor(mode: GameMode, audio: Audio, input: Input) {
    this.mode = mode;
    this.audio = audio;
    this.input = input;
    this.lives = 3;

    for (let i = 0; i < 180; i++) {
      this.stars.push({ x: Math.random() * W, y: Math.random() * H * 0.75, r: 0.4 + Math.random() * 1.5, bright: Math.random() });
    }

    this.setupLevel();
  }

  private setupLevel(): void {
    const seed = this.level * 7 + (this.mode === 'expert' ? 9999 : 0);
    const { points, zones } = generateTerrain(seed);
    this.terrainPoints = points;
    this.landingZones = zones;

    const config = this.mode === 'expert' ? EXPERT_CONFIG : NOVICE_CONFIG;
    this.lander = new Lander(W / 2, 80, config);

    this.asteroids = [];
    const numAsteroids = this.mode === 'expert' ? 3 + this.level : 1 + this.level;
    const asteroidSpeed = this.mode === 'expert' ? 1.8 + this.level * 0.3 : 1.0 + this.level * 0.2;

    for (let i = 0; i < numAsteroids; i++) {
      let ax: number, ay: number;
      do {
        ax = 80 + Math.random() * (W - 160);
        ay = 80 + Math.random() * (H - 300);
      } while (Math.abs(ax - W / 2) < 150 && ay < 200);
      this.asteroids.push(new Asteroid(ax, ay, asteroidSpeed));
    }

    this.lasers = [];
    if (this.mode === 'expert' || this.level >= 2) {
      const numLasers = this.mode === 'expert' ? 2 + this.level : 1;
      const cooldown = this.mode === 'expert' ? 180 - this.level * 10 : 300;
      for (let i = 0; i < numLasers; i++) {
        const side = i % 2;
        const laserX = side === 0 ? 30 : W - 30;
        const dir = side === 0 ? 1 : -1;
        const ty = getTerrainY(this.terrainPoints, laserX) - 20;
        this.lasers.push(new Laser(laserX, ty, dir, Math.max(90, cooldown)));
      }
    }

    this.astronauts = [];
    const numAstronauts = this.mode === 'expert' ? 2 : 1;
    for (let i = 0; i < numAstronauts; i++) {
      let ax: number;
      let attempts = 0;
      do {
        ax = 100 + Math.random() * (W - 200);
        attempts++;
      } while (this.isNearLandingZone(ax) && attempts < 20);
      const ay = getTerrainY(this.terrainPoints, ax) - 16;
      this.astronauts.push(new Astronaut(ax, ay));
    }

    this.explosions = [];
    this.phase = 'playing';
    this.invincible = 60;
    this.message = `LEVEL ${this.level}`;
    this.messageColor = '#88ccff';
    this.messageTimer = 120;
  }

  private isNearLandingZone(x: number): boolean {
    for (const z of this.landingZones) {
      if (x > z.x - 30 && x < z.x + z.width + 30) return true;
    }
    return false;
  }

  update(): void {
    if (this.phase === 'game_over' || this.phase === 'victory') {
      this.phaseTimer++;
      if (this.input.wasPressed('Enter') || this.input.wasPressed('Space') || this.input.wasPressed('KeyR')) {
        this.done = true;
      }
      return;
    }

    if (this.phase === 'dying') {
      this.phaseTimer++;
      this.explosions.forEach((e) => e.update());
      this.explosions = this.explosions.filter((e) => !e.done);
      if (this.phaseTimer > 90) {
        this.lives--;
        if (this.lives <= 0) {
          this.phase = 'game_over';
          this.phaseTimer = 0;
        } else {
          this.phase = 'respawning';
          this.phaseTimer = 0;
          const config = this.mode === 'expert' ? EXPERT_CONFIG : NOVICE_CONFIG;
          this.lander = new Lander(W / 2, 80, config);
          this.invincible = 120;
        }
      }
      return;
    }

    if (this.phase === 'landing') {
      this.phaseTimer++;
      if (this.phaseTimer > 120) {
        const allUsed = this.landingZones.every((z) => z.used);
        if (allUsed) {
          this.level++;
          if (this.level > 5) {
            this.phase = 'victory';
            this.phaseTimer = 0;
          } else {
            this.setupLevel();
          }
        } else {
          this.phase = 'playing';
          const config = this.mode === 'expert' ? EXPERT_CONFIG : NOVICE_CONFIG;
          this.lander = new Lander(W / 2, 80, config);
          this.invincible = 90;
        }
      }
      return;
    }

    if (this.phase === 'respawning') {
      this.phase = 'playing';
    }

    if (this.invincible > 0) this.invincible--;
    if (this.messageTimer > 0) this.messageTimer--;

    this.lander.update(this.input, this.audio);

    for (const a of this.asteroids) a.update(W, H);
    for (const l of this.lasers) l.update();
    for (const a of this.astronauts) a.update();
    this.explosions.forEach((e) => e.update());
    this.explosions = this.explosions.filter((e) => !e.done);

    if (this.invincible <= 0) {
      for (const ast of this.asteroids) {
        if (ast.collidesWith(this.lander.x, this.lander.y, this.lander.radius)) {
          this.killLander();
          return;
        }
      }
      for (const laser of this.lasers) {
        if (laser.collidesWithLander(this.lander.x, this.lander.y, this.lander.radius)) {
          this.killLander();
          return;
        }
      }
    }

    for (const astro of this.astronauts) {
      if (!astro.collected && astro.collidesWith(this.lander.x, this.lander.y, this.lander.radius)) {
        astro.collected = true;
        this.lander.fuel = Math.min(this.lander.maxFuel, this.lander.fuel + 50);
        this.audio.play('teleport');
        this.showMessage('+50 FUEL', '#00ffcc');
        this.score += 150;
      }
    }

    const ty = getTerrainY(this.terrainPoints, this.lander.x);
    if (this.lander.y + 24 >= ty) {
      const zone = this.getZoneAt(this.lander.x);
      if (zone && !zone.used) {
        const absAngle = Math.abs(this.lander.angle);
        const speed = this.lander.getSpeed();
        if (absAngle <= 20 && this.lander.vy < 4 && Math.abs(this.lander.vx) < 3) {
          this.onLand(zone, absAngle, speed);
        } else {
          this.killLander();
        }
      } else {
        if (this.lander.vy > 0.5) {
          this.killLander();
        }
      }
    }

    if (this.lander.y > H + 50) {
      this.killLander();
    }
  }

  private getZoneAt(x: number): LandingZone | null {
    for (const z of this.landingZones) {
      if (x >= z.x && x <= z.x + z.width) return z;
    }
    return null;
  }

  private killLander(): void {
    if (this.phase === 'dying') return;
    this.audio.play('explo');
    this.explosions.push(new Explosion(this.lander.x, this.lander.y));
    this.lander.dead = true;
    this.phase = 'dying';
    this.phaseTimer = 0;
  }

  private onLand(zone: LandingZone, angle: number, speed: number): void {
    zone.used = true;
    let pts = zone.score;
    if (angle < 5) pts = Math.round(pts * 1.5);
    if (speed < 1) pts = Math.round(pts * 1.25);
    this.score += pts;
    this.audio.play('landed');
    this.lander.landed = true;
    this.phase = 'landing';
    this.phaseTimer = 0;
    this.showMessage(`LANDED! +${pts}`, zone.color);
  }

  private showMessage(text: string, color: string): void {
    this.message = text;
    this.messageColor = color;
    this.messageTimer = 150;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#000008';
    ctx.fillRect(0, 0, W, H);

    for (const s of this.stars) {
      ctx.fillStyle = `rgba(255,255,255,${0.3 + s.bright * 0.7})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const a of this.asteroids) a.draw(ctx);
    for (const laser of this.lasers) laser.draw(ctx);
    for (const astro of this.astronauts) astro.draw(ctx);
    drawTerrain(ctx, this.terrainPoints, this.landingZones);
    for (const e of this.explosions) e.draw(ctx);

    if (!this.lander.dead) {
      if (this.invincible > 0 && Math.floor(this.invincible / 8) % 2 === 0) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        this.lander.draw(ctx);
        ctx.restore();
      } else {
        this.lander.draw(ctx);
      }
    }

    this.drawHUD(ctx);

    if (this.messageTimer > 0) {
      const alpha = Math.min(1, this.messageTimer / 30);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';
      ctx.font = 'bold 28px monospace';
      ctx.shadowColor = this.messageColor;
      ctx.shadowBlur = 15;
      ctx.fillStyle = this.messageColor;
      ctx.fillText(this.message, W / 2, H / 2 - 40);
      ctx.restore();
    }

    if (this.phase === 'game_over') {
      this.drawOverlay(ctx, 'GAME OVER', `SCORE: ${this.score}`, '#ff4444');
    } else if (this.phase === 'victory') {
      this.drawOverlay(ctx, 'YOU WIN!', `FINAL SCORE: ${this.score}`, '#ffdd00');
    }
  }

  private drawHUD(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, W, 36);

    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';

    for (let i = 0; i < this.lives; i++) {
      ctx.save();
      ctx.translate(16 + i * 28, 18);
      ctx.scale(0.7, 0.7);
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(-12, 12);
      ctx.lineTo(12, 12);
      ctx.closePath();
      ctx.fillStyle = '#dddddd';
      ctx.fill();
      ctx.restore();
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`SCORE: ${this.score}`, W / 2, 22);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '11px monospace';
    ctx.fillText(`LV ${this.level}  ${this.mode.toUpperCase()}`, W / 2 + 80, 22);

    const fuelPct = this.lander.fuel / this.lander.maxFuel;
    const fuelBarW = 140;
    const fuelX = W - fuelBarW - 16;

    ctx.fillStyle = '#333333';
    ctx.fillRect(fuelX, 10, fuelBarW, 14);

    const fuelColor = fuelPct > 0.5 ? '#00cc44' : fuelPct > 0.25 ? '#ffaa00' : '#ff2200';
    ctx.fillStyle = fuelColor;
    ctx.fillRect(fuelX, 10, fuelBarW * fuelPct, 14);

    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.strokeRect(fuelX, 10, fuelBarW, 14);

    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('FUEL', fuelX + fuelBarW / 2, 21);

    const zones = this.landingZones.filter((z) => !z.used);
    ctx.textAlign = 'right';
    ctx.font = '11px monospace';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(`PADS: ${zones.length}`, W - 16, 22);

    const velX = Math.abs(this.lander.vx);
    const velY = Math.abs(this.lander.vy);
    const dangerH = velY > 3;
    const dangerV = velX > 3;

    ctx.textAlign = 'left';
    ctx.font = '10px monospace';
    ctx.fillStyle = dangerV ? '#ff4400' : '#88aa88';
    ctx.fillText(`H: ${this.lander.vx.toFixed(1)}`, fuelX, H - 8);
    ctx.fillStyle = dangerH ? '#ff4400' : '#88aa88';
    ctx.fillText(`V: ${this.lander.vy.toFixed(1)}`, fuelX + 55, H - 8);
    ctx.fillStyle = Math.abs(this.lander.angle) > 20 ? '#ff4400' : '#88aa88';
    ctx.fillText(`A: ${this.lander.angle.toFixed(0)}°`, fuelX + 110, H - 8);

    ctx.restore();
  }

  private drawOverlay(ctx: CanvasRenderingContext2D, title: string, sub: string, color: string): void {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = 'center';
    ctx.shadowColor = color;
    ctx.shadowBlur = 30;
    ctx.font = 'bold 64px monospace';
    ctx.fillStyle = color;
    ctx.fillText(title, W / 2, H / 2 - 30);

    ctx.shadowBlur = 0;
    ctx.font = 'bold 28px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(sub, W / 2, H / 2 + 30);

    const blink = Math.floor(this.phaseTimer / 20) % 2 === 0;
    if (blink) {
      ctx.font = '18px monospace';
      ctx.fillStyle = '#aaaaaa';
      ctx.fillText('PRESS ENTER TO PLAY AGAIN', W / 2, H / 2 + 90);
    }
    ctx.restore();
  }
}
