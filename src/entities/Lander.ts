import { Input } from '../Input';
import { Audio } from '../Audio';

export interface LanderConfig {
  fuel: number;
  gravity: number;
  thrustPower: number;
  rotSpeed: number;
  maxAngle: number;
}

export const NOVICE_CONFIG: LanderConfig = {
  fuel: 200,
  gravity: 0.06,
  thrustPower: 0.18,
  rotSpeed: 1.8,
  maxAngle: 60,
};

export const EXPERT_CONFIG: LanderConfig = {
  fuel: 80,
  gravity: 0.1,
  thrustPower: 0.16,
  rotSpeed: 2.2,
  maxAngle: 50,
};

export class Lander {
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  angle = 0;
  fuel: number;
  maxFuel: number;
  thrusting = false;
  dead = false;
  landed = false;
  radius = 18;

  private config: LanderConfig;
  private thrustSound = false;
  private frameCount = 0;
  private flameParticles: { x: number; y: number; vx: number; vy: number; life: number }[] = [];

  constructor(x: number, y: number, config: LanderConfig) {
    this.x = x;
    this.y = y;
    this.config = config;
    this.fuel = config.fuel;
    this.maxFuel = config.fuel;
  }

  update(input: Input, audio: Audio): void {
    this.frameCount++;
    this.thrusting = false;

    if (!this.dead && !this.landed) {
      if (input.isDown('ArrowLeft')) {
        this.angle -= this.config.rotSpeed;
        if (this.angle < -this.config.maxAngle) this.angle = -this.config.maxAngle;
      }
      if (input.isDown('ArrowRight')) {
        this.angle += this.config.rotSpeed;
        if (this.angle > this.config.maxAngle) this.angle = this.config.maxAngle;
      }

      if (input.isDown('ArrowUp') && this.fuel > 0) {
        this.thrusting = true;
        const rad = (this.angle - 90) * Math.PI / 180;
        this.vx += Math.cos(rad) * this.config.thrustPower;
        this.vy += Math.sin(rad) * this.config.thrustPower;
        this.fuel = Math.max(0, this.fuel - 1);
        if (!this.thrustSound) {
          audio.play('fuel', true);
          this.thrustSound = true;
        }
      } else {
        this.thrustSound = false;
      }

      this.vy += this.config.gravity;
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < this.radius) { this.x = this.radius; this.vx = Math.abs(this.vx) * 0.5; }
      if (this.x > 1024 - this.radius) { this.x = 1024 - this.radius; this.vx = -Math.abs(this.vx) * 0.5; }

      if (this.thrusting) {
        const rad = (this.angle + 90) * Math.PI / 180;
        for (let i = 0; i < 2; i++) {
          this.flameParticles.push({
            x: this.x + Math.cos(rad) * 18,
            y: this.y + Math.sin(rad) * 18,
            vx: Math.cos(rad) * (1 + Math.random() * 2) + (Math.random() - 0.5),
            vy: Math.sin(rad) * (1 + Math.random() * 2) + (Math.random() - 0.5),
            life: 8 + Math.floor(Math.random() * 8),
          });
        }
      }
    }

    this.flameParticles = this.flameParticles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      return p.life > 0;
    });
  }

  getSpeed(): number {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const p of this.flameParticles) {
      const alpha = p.life / 16;
      ctx.save();
      ctx.globalAlpha = alpha;
      const t = 1 - alpha;
      ctx.fillStyle = `rgb(${255}, ${Math.floor(180 * (1 - t))}, 0)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 * alpha + 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle * Math.PI / 180);

    const isLowFuel = this.fuel < this.maxFuel * 0.25;
    const bodyColor = isLowFuel && Math.floor(this.frameCount / 15) % 2 === 0 ? '#ff4444' : '#dddddd';

    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(-14, 14);
    ctx.lineTo(14, 14);
    ctx.closePath();
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.strokeStyle = '#aaaaaa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-14, 14);
    ctx.lineTo(-20, 24);
    ctx.moveTo(14, 14);
    ctx.lineTo(20, 24);
    ctx.stroke();

    ctx.strokeStyle = '#aaaaaa';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-20, 24);
    ctx.lineTo(-27, 24);
    ctx.moveTo(20, 24);
    ctx.lineTo(27, 24);
    ctx.stroke();

    ctx.fillStyle = '#00ccff';
    ctx.beginPath();
    ctx.arc(0, -4, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
