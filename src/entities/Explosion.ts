interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  color: string;
}

export class Explosion {
  x: number;
  y: number;
  done = false;
  private particles: Particle[] = [];

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    const colors = ['#ff6600', '#ffaa00', '#ffdd00', '#ff2200', '#ffffff'];
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 5;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 30 + Math.random() * 30,
        maxLife: 60,
        radius: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  update(): void {
    let alive = 0;
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.life--;
      if (p.life > 0) alive++;
    }
    if (alive === 0) this.done = true;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      if (p.life <= 0) continue;
      const alpha = p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
