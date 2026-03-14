export class Astronaut {
  x: number;
  y: number;
  collected = false;
  private bobOffset = Math.random() * Math.PI * 2;
  private waveTime = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(): void {
    this.waveTime += 0.05;
  }

  collidesWith(lx: number, ly: number, lr: number): boolean {
    const dx = this.x - lx;
    const dy = this.y - ly;
    return Math.sqrt(dx * dx + dy * dy) < lr + 16;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.collected) return;
    const bob = Math.sin(this.waveTime + this.bobOffset) * 2;
    const y = this.y + bob;

    ctx.save();
    ctx.translate(this.x, y);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -16, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#aaccff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ddddee';
    ctx.beginPath();
    ctx.rect(-7, -9, 14, 14);
    ctx.fill();
    ctx.stroke();

    const armAngle = Math.sin(this.waveTime * 2) * 0.4;
    ctx.strokeStyle = '#ddddee';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-7, -7);
    ctx.lineTo(-12 + Math.cos(armAngle) * 2, -3 + Math.sin(armAngle) * 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(7, -7);
    ctx.lineTo(12, -3 + Math.sin(this.waveTime * 2) * 3);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-4, 5);
    ctx.lineTo(-4, 14);
    ctx.moveTo(4, 5);
    ctx.lineTo(4, 14);
    ctx.stroke();

    ctx.fillStyle = '#00ffcc';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('+FUEL', 0, -28);

    ctx.restore();
  }
}
