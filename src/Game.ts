import { Input } from './Input';
import { Audio } from './Audio';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';
import type { GameMode } from './scenes/TitleScene';

type SceneTag = 'title' | 'game';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private input: Input;
  private audio: Audio;
  private scene: SceneTag = 'title';
  private titleScene: TitleScene | null = null;
  private gameScene: GameScene | null = null;
  private rafId = 0;

  constructor() {
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.canvas.width = 1024;
    this.canvas.height = 768;
    this.ctx = this.canvas.getContext('2d')!;
    this.input = new Input();
    this.audio = new Audio();
    this.loadAudio();
    this.scaleCanvas();
    window.addEventListener('resize', () => this.scaleCanvas());
  }

  private scaleCanvas(): void {
    const scaleX = window.innerWidth / 1024;
    const scaleY = window.innerHeight / 768;
    const scale = Math.min(scaleX, scaleY);
    this.canvas.style.width = `${1024 * scale}px`;
    this.canvas.style.height = `${768 * scale}px`;
  }

  private async loadAudio(): Promise<void> {
    const sounds = [
      ['lunarmove', '/sounds/snd_lunarmove.ogg'],
      ['explo', '/sounds/snd_explo.ogg'],
      ['fuel', '/sounds/snd_fuel.ogg'],
      ['landed', '/sounds/snd_landed.ogg'],
      ['button_click', '/sounds/snd_button_click.ogg'],
      ['button_over', '/sounds/snd_button_over.ogg'],
      ['teleport', '/sounds/snd_teleport.ogg'],
      ['backmusic', '/sounds/snd_backmusic.ogg'],
      ['quake', '/sounds/snd_quake.ogg'],
      ['alert', '/sounds/snd_alert.ogg'],
    ];
    await Promise.all(sounds.map(([name, path]) => this.audio.load(name, path)));
  }

  start(): void {
    this.goToTitle();
    this.loop();
  }

  private goToTitle(): void {
    this.scene = 'title';
    this.gameScene = null;
    this.titleScene = new TitleScene(this.audio);
  }

  private goToGame(mode: GameMode): void {
    this.audio.stopMusic();
    this.scene = 'game';
    this.titleScene = null;
    this.gameScene = new GameScene(mode, this.audio, this.input);
  }

  private loop = (): void => {
    this.rafId = requestAnimationFrame(this.loop);
    this.update();
    this.draw();
    this.input.flush();
  };

  private update(): void {
    if (this.input.wasPressed('KeyM')) {
      this.audio.toggleMute();
    }

    if (this.scene === 'title' && this.titleScene) {
      this.titleScene.update(this.input);
      if (this.titleScene.done) {
        this.goToGame(this.titleScene.selectedMode);
      }
    } else if (this.scene === 'game' && this.gameScene) {
      this.gameScene.update();
      if (this.gameScene.done) {
        this.goToTitle();
      }
    }
  }

  private draw(): void {
    if (this.scene === 'title' && this.titleScene) {
      this.titleScene.draw(this.ctx);
    } else if (this.scene === 'game' && this.gameScene) {
      this.gameScene.draw(this.ctx);
    }
  }
}
