import { Input } from '../Input';
import { Audio } from '../Audio';

type Mode = 'title' | 'mode_select';
export type GameMode = 'novice' | 'expert';

interface Star {
  x: number;
  y: number;
  r: number;
  twinkle: number;
  speed: number;
}

export class TitleScene {
  done = false;
  selectedMode: GameMode = 'novice';

  private mode: Mode = 'title';
  private stars: Star[] = [];
  private enterHover = false;
  private noviceHover = false;
  private expertHover = false;
  private time = 0;
  private enterBtnRect = { x: 421, y: 420, w: 182, h: 50 };
  private noviceBtnRect = { x: 300, y: 380, w: 182, h: 50 };
  private expertBtnRect = { x: 542, y: 380, w: 182, h: 50 };
  private musicStarted = false;

  constructor(private audio: Audio) {
    for (let i = 0; i < 150; i++) {
      this.stars.push({
        x: Math.random() * 1024,
        y: Math.random() * 768,
        r: 0.5 + Math.random() * 2,
        twinkle: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.04,
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

    for (const s of this.stars) {
      s.twinkle += s.speed;
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
    ctx.fillStyle = '#000008';
    ctx.fillRect(0, 0, 1024, 768);

    for (const s of this.stars) {
      const alpha = 0.4 + 0.6 * ((Math.sin(s.twinkle) + 1) / 2);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const pulse = Math.sin(this.time * 0.03) * 0.15 + 0.85;

    ctx.save();
    ctx.textAlign = 'center';

    ctx.font = 'bold 68px monospace';
    const glowAlpha = 0.4 + 0.3 * Math.sin(this.time * 0.04);
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 30 * pulse;
    ctx.fillStyle = '#ff6600';
    ctx.fillText('ZORG88', 512, 160);

    ctx.shadowColor = '#0088ff';
    ctx.shadowBlur = 20;
    ctx.font = 'bold 42px monospace';
    ctx.fillStyle = '#88ccff';
    ctx.fillText('SPACE LANDER', 512, 220);

    ctx.shadowBlur = 0;
    ctx.font = '16px monospace';
    ctx.fillStyle = `rgba(100,180,255,${glowAlpha})`;
    ctx.fillText('A game of skill and survival', 512, 265);

    this.drawLanderDeco(ctx, 512, 330, this.time);

    if (this.mode === 'title') {
      const bAlpha = 0.7 + 0.3 * Math.sin(this.time * 0.06);
      this.drawButton(ctx, this.enterBtnRect, 'ENTER', this.enterHover, `rgba(0,200,120,${bAlpha})`);

      ctx.font = '13px monospace';
      ctx.fillStyle = 'rgba(120,120,120,0.8)';
      ctx.fillText('or press ENTER / SPACE', 512, 490);
    } else {
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 10;
      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = '#ffdd88';
      ctx.fillText('SELECT DIFFICULTY', 512, 340);
      ctx.shadowBlur = 0;

      this.drawButton(ctx, this.noviceBtnRect, '[N] NOVICE', this.noviceHover, '#00cc66');
      this.drawButton(ctx, this.expertBtnRect, '[E] EXPERT', this.expertHover, '#ff4422');

      ctx.font = '12px monospace';
      ctx.fillStyle = 'rgba(120,200,120,0.8)';
      ctx.fillText('More fuel · Slower gravity · Fewer hazards', this.noviceBtnRect.x + 91, 450);
      ctx.fillStyle = 'rgba(255,120,80,0.8)';
      ctx.fillText('Less fuel · Faster gravity · More hazards', this.expertBtnRect.x + 91, 450);
    }

    ctx.font = '11px monospace';
    ctx.fillStyle = 'rgba(80,80,80,0.7)';
    ctx.fillText('Arrow keys: thrust & rotate  |  M: mute music', 512, 740);

    ctx.restore();
  }

  private drawButton(
    ctx: CanvasRenderingContext2D,
    r: { x: number; y: number; w: number; h: number },
    label: string,
    hover: boolean,
    color: string
  ): void {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = hover ? 20 : 8;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(r.x, r.y, r.w, r.h);

    if (hover) {
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.globalAlpha = 1;
    }

    ctx.shadowBlur = hover ? 12 : 0;
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = hover ? '#ffffff' : color;
    ctx.textAlign = 'center';
    ctx.fillText(label, r.x + r.w / 2, r.y + r.h / 2 + 6);
    ctx.restore();
  }

  private drawLanderDeco(ctx: CanvasRenderingContext2D, x: number, y: number, t: number): void {
    const bobY = Math.sin(t * 0.04) * 5;
    ctx.save();
    ctx.translate(x, y + bobY);

    const thrustOn = Math.floor(t / 20) % 3 !== 0;
    if (thrustOn) {
      ctx.fillStyle = `rgba(255, ${100 + Math.random() * 80}, 0, 0.8)`;
      ctx.beginPath();
      ctx.moveTo(-5, 14);
      ctx.lineTo(5, 14);
      ctx.lineTo(0, 28 + Math.random() * 8);
      ctx.closePath();
      ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(-12, 12);
    ctx.lineTo(12, 12);
    ctx.closePath();
    ctx.fillStyle = '#cccccc';
    ctx.fill();
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.strokeStyle = '#aaaaaa';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-12, 12);
    ctx.lineTo(-18, 20);
    ctx.moveTo(12, 12);
    ctx.lineTo(18, 20);
    ctx.stroke();

    ctx.restore();
  }

  destroy(): void {
    window.removeEventListener('mousemove', (e) => this.onMouseMove(e));
    window.removeEventListener('click', (e) => this.onClick(e));
  }
}
