export class Laser {
  x: number;
  y: number;
  direction: number;
  private beamLength = 0;
  private maxBeam: number;
  private firing = false;
  private cooldown = 0;
  private cooldownMax: number;
  private warmup = 0;
  private warmupMax = 90;
  active = true;

  constructor(x: number, y: number, direction: number, cooldown: number) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.maxBeam = direction === 1 ? 1024 - x : x;
    this.cooldownMax = cooldown;
    this.cooldown = Math.floor(Math.random() * cooldown);
  }

  update(): void {
    if (this.firing) {
      this.warmup++;
      if (this.warmup > this.warmupMax) {
        this.beamLength = this.maxBeam;
      } else {
        this.beamLength = (this.warmup / this.warmupMax) * this.maxBeam;
      }
      if (this.warmup >= this.warmupMax + 30) {
        this.firing = false;
        this.warmup = 0;
        this.beamLength = 0;
        this.cooldown = this.cooldownMax;
      }
    } else {
      this.cooldown--;
      if (this.cooldown <= 0) {
        this.firing = true;
        this.warmup = 0;
      }
    }
  }

  isBeamActive(): boolean {
    return this.firing && this.beamLength > 10;
  }

  getBeamRect(): { x1: number; x2: number; y: number } {
    if (this.direction === 1) {
      return { x1: this.x, x2: this.x + this.beamLength, y: this.y };
    } else {
      return { x1: this.x - this.beamLength, x2: this.x, y: this.y };
    }
  }

  collidesWithLander(lx: number, ly: number, lr: number): boolean {
    if (!this.isBeamActive()) return false;
    const beam = this.getBeamRect();
    if (ly < beam.y - lr || ly > beam.y + lr) return false;
    return lx + lr > beam.x1 && lx - lr < beam.x2;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    ctx.fillStyle = this.firing && this.warmup < this.warmupMax ? '#ff4400' : '#cc2200';
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 1.5;

    const dir = this.direction;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - 10);
    ctx.lineTo(this.x + dir * 20, this.y - 6);
    ctx.lineTo(this.x + dir * 20, this.y + 6);
    ctx.lineTo(this.x, this.y + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.x + dir * 12, this.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = this.firing ? '#ff8800' : '#660000';
    ctx.fill();

    if (this.isBeamActive()) {
      const beam = this.getBeamRect();
      const alpha = this.warmup >= this.warmupMax ? 1 : this.warmup / this.warmupMax;

      const grad = ctx.createLinearGradient(beam.x1, 0, beam.x2, 0);
      grad.addColorStop(0, `rgba(255, 0, 0, ${alpha})`);
      grad.addColorStop(0.5, `rgba(255, 120, 0, ${alpha * 0.8})`);
      grad.addColorStop(1, `rgba(255, 0, 0, ${alpha * 0.2})`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(beam.x1, beam.y);
      ctx.lineTo(beam.x2, beam.y);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 200, 0, ${alpha * 0.4})`;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(beam.x1, beam.y);
      ctx.lineTo(beam.x2, beam.y);
      ctx.stroke();
    }

    ctx.restore();
  }
}
