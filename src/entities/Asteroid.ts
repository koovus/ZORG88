export class Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  private angle = 0;
  private spin: number;
  private shape: number[];

  constructor(x: number, y: number, speed: number) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const s = speed * (0.7 + Math.random() * 0.6);
    this.vx = Math.cos(angle) * s;
    this.vy = Math.sin(angle) * s;
    this.radius = 18 + Math.random() * 14;
    this.spin = (Math.random() - 0.5) * 0.04;
    this.shape = [];
    const pts = 10 + Math.floor(Math.random() * 4);
    for (let i = 0; i < pts; i++) {
      this.shape.push(0.7 + Math.random() * 0.5);
    }
  }

  update(canvasW: number, canvasH: number): void {
    this.x += this.vx;
    this.y += this.vy;
    this.angle += this.spin;

    if (this.x - this.radius < 0) { this.x = this.radius; this.vx = Math.abs(this.vx); }
    if (this.x + this.radius > canvasW) { this.x = canvasW - this.radius; this.vx = -Math.abs(this.vx); }
    if (this.y - this.radius < 30) { this.y = 30 + this.radius; this.vy = Math.abs(this.vy); }
    if (this.y + this.radius > canvasH - 100) { this.y = canvasH - 100 - this.radius; this.vy = -Math.abs(this.vy); }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.beginPath();
    const pts = this.shape.length;
    for (let i = 0; i < pts; i++) {
      const a = (i / pts) * Math.PI * 2;
      const r = this.radius * this.shape[i];
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fillStyle = '#555544';
    ctx.fill();
    ctx.strokeStyle = '#aaa888';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  collidesWith(x: number, y: number, r: number): boolean {
    const dx = this.x - x;
    const dy = this.y - y;
    return Math.sqrt(dx * dx + dy * dy) < this.radius + r;
  }
}
