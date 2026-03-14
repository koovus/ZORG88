import { Input } from '../Input';
import { Audio } from '../Audio';

type Mode = 'title' | 'mode_select';
export type GameMode = 'novice' | 'expert';

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
}

export class TitleScene {
  done = false;
  selectedMode: GameMode = 'novice';

  private mode: Mode = 'title';
  private dots: Dot[] = [];
  private enterHover = false;
  private noviceHover = false;
  private expertHover = false;
  private time = 0;
  private enterBtnRect = { x: 421, y: 430, w: 182, h: 52 };
  private noviceBtnRect = { x: 280, y: 390, w: 200, h: 54 };
  private expertBtnRect = { x: 544, y: 390, w: 200, h: 54 };
  private musicStarted = false;

  private dotColors = ['#ff4500', '#ff8c00', '#1e90ff', '#00c853', '#9c27b0', '#e91e63'];

  constructor(private audio: Audio) {
    for (let i = 0; i < 28; i++) {
      this.dots.push({
        x: Math.random() * 1024,
        y: Math.random() * 768,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        r: 4 + Math.random() * 14,
        color: this.dotColors[Math.floor(Math.random() * this.dotColors.length)],
      });
    }

    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('click', (e) => this.onClick(e));
  }

  private getCanvasPos(e: MouseEvent): { x: number; y: number } {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1024 / rect.width;
    const scaleY = 768 / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  private inRect(pos: { x: number; y: number }, r: { x: number; y: number; w: number; h: number }): boolean {
    return pos.x >= r.x && pos.x <= r.x + r.w && pos.y >= r.y && pos.y <= r.y + r.h;
  }

  private onMouseMove(e: MouseEvent): void {
    const pos = this.getCanvasPos(e);
    if (this.mode === 'title') {
      this.enterHover = this.inRect(pos, this.enterBtnRect);
    } else {
      this.noviceHover = this.inRect(pos, this.noviceBtnRect);
      this.expertHover = this.inRect(pos, this.expertBtnRect);
    }
  }

  private onClick(e: MouseEvent): void {
    const pos = this.getCanvasPos(e);
    if (this.mode === 'title') {
      if (this.inRect(pos, this.enterBtnRect)) {
        this.audio.play('button_click');
        this.mode = 'mode_select';
      }
    } else {
      if (this.inRect(pos, this.noviceBtnRect)) {
        this.audio.play('button_click');
        this.selectedMode = 'novice';
        this.done = true;
      }
      if (this.inRect(pos, this.expertBtnRect)) {
        this.audio.play('button_click');
        this.selectedMode = 'expert';
        this.done = true;
      }
    }
  }

  update(input: Input): void {
    this.time++;

    if (!this.musicStarted) {
      this.musicStarted = true;
      this.audio.play('backmusic', true);
    }

    for (const d of this.dots) {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < -d.r) d.x = 1024 + d.r;
      if (d.x > 1024 + d.r) d.x = -d.r;
      if (d.y < -d.r) d.y = 768 + d.r;
      if (d.y > 768 + d.r) d.y = -d.r;
    }

    if (input.wasPressed('Enter') || input.wasPressed('Space')) {
      if (this.mode === 'title') {
        this.audio.play('button_click');
        this.mode = 'mode_select';
      }
    }
    if (input.wasPressed('KeyN') && this.mode === 'mode_select') {
      this.selectedMode = 'novice';
      this.done = true;
    }
    if (input.wasPressed('KeyE') && this.mode === 'mode_select') {
      this.selectedMode = 'expert';
      this.done = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#f0f2f5';
    ctx.fillRect(0, 0, 1024, 768);

    for (const d of this.dots) {
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.08)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 8;
    const cardX = 262, cardY = 90, cardW = 500, cardH = 480;
    ctx.beginPath();
    ctx.rect(cardX, cardY, cardW, cardH);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    const accentH = 8;
    const grad = ctx.createLinearGradient(cardX, 0, cardX + cardW, 0);
    grad.addColorStop(0, '#ff4500');
    grad.addColorStop(0.5, '#ff8c00');
    grad.addColorStop(1, '#1e90ff');
    ctx.fillStyle = grad;
    ctx.fillRect(cardX, cardY, cardW, accentH);

    ctx.save();
    ctx.textAlign = 'center';

    ctx.font = 'bold 72px monospace';
    ctx.fillStyle = '#1a1a2e';
    ctx.fillText('ZORG88', 512, 220);

    ctx.font = 'bold 28px monospace';
    const subGrad = ctx.createLinearGradient(350, 0, 674, 0);
    subGrad.addColorStop(0, '#ff4500');
    subGrad.addColorStop(1, '#1e90ff');
    ctx.fillStyle = subGrad;
    ctx.fillText('SPACE LANDER', 512, 265);

    ctx.fillStyle = '#888';
    ctx.font = '15px monospace';
    ctx.fillText('A game of skill and survival', 512, 298);

    this.drawLanderDeco(ctx, 512, 360);

    if (this.mode === 'title') {
      this.drawFlatButton(ctx, this.enterBtnRect, 'PLAY', this.enterHover, '#1e90ff');
      ctx.font = '12px monospace';
      ctx.fillStyle = '#aaa';
      ctx.fillText('or press ENTER / SPACE', 512, 510);
    } else {
      ctx.font = 'bold 18px monospace';
      ctx.fillStyle = '#333';
      ctx.fillText('SELECT DIFFICULTY', 512, 360);

      this.drawFlatButton(ctx, this.noviceBtnRect, '[N] NOVICE', this.noviceHover, '#00c853');
      this.drawFlatButton(ctx, this.expertBtnRect, '[E] EXPERT', this.expertHover, '#f44336');

      ctx.font = '11px monospace';
      ctx.fillStyle = '#777';
      ctx.fillText('More fuel  ·  Slower fall', this.noviceBtnRect.x + 100, 462);
      ctx.fillText('Less fuel  ·  Faster fall', this.expertBtnRect.x + 100, 462);
    }

    ctx.restore();

    ctx.font = '11px monospace';
    ctx.fillStyle = '#bbb';
    ctx.textAlign = 'center';
    ctx.fillText('↑ Thrust   ← → Rotate   M: Mute', 512, 740);
  }

  private drawFlatButton(
    ctx: CanvasRenderingContext2D,
    r: { x: number; y: number; w: number; h: number },
    label: string,
    hover: boolean,
    color: string
  ): void {
    ctx.save();
    ctx.shadowColor = hover ? color : 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = hover ? 18 : 4;
    ctx.shadowOffsetY = hover ? 4 : 2;

    ctx.fillStyle = hover ? color : '#ffffff';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(r.x, r.y, r.w, r.h);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = hover ? '#ffffff' : color;
    ctx.textAlign = 'center';
    ctx.fillText(label, r.x + r.w / 2, r.y + r.h / 2 + 5);
    ctx.restore();
  }

  private drawLanderDeco(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const bob = Math.sin(this.time * 0.04) * 4;
    const thrustOn = Math.floor(this.time / 18) % 4 !== 0;

    ctx.save();
    ctx.translate(x, y + bob);

    if (thrustOn) {
      ctx.fillStyle = `rgba(255, ${100 + Math.floor(Math.random() * 80)}, 0, 0.85)`;
      ctx.beginPath();
      ctx.moveTo(-6, 15);
      ctx.lineTo(6, 15);
      ctx.lineTo(0, 30 + Math.random() * 8);
      ctx.closePath();
      ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(-13, 13);
    ctx.lineTo(13, 13);
    ctx.closePath();
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();

    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-13, 13);
    ctx.lineTo(-20, 22);
    ctx.moveTo(13, 13);
    ctx.lineTo(20, 22);
    ctx.stroke();

    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-20, 22);
    ctx.lineTo(-27, 22);
    ctx.moveTo(20, 22);
    ctx.lineTo(27, 22);
    ctx.stroke();

    ctx.fillStyle = '#1e90ff';
    ctx.beginPath();
    ctx.arc(0, -4, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  destroy(): void {
    window.removeEventListener('mousemove', (e) => this.onMouseMove(e));
    window.removeEventListener('click', (e) => this.onClick(e));
  }
}
