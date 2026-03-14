export class Audio {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private musicEl: HTMLAudioElement | null = null;
  private muted = false;

  async load(name: string, path: string): Promise<void> {
    const el = document.createElement('audio');
    el.src = path;
    el.preload = 'auto';
    this.sounds.set(name, el);
  }

  play(name: string, loop = false): void {
    if (this.muted) return;
    const el = this.sounds.get(name);
    if (!el) return;
    const clone = el.cloneNode(true) as HTMLAudioElement;
    clone.loop = loop;
    clone.volume = 0.6;
    clone.play().catch(() => { /* autoplay blocked */ });
    if (loop) this.musicEl = clone;
  }

  stopMusic(): void {
    if (this.musicEl) {
      this.musicEl.pause();
      this.musicEl.currentTime = 0;
      this.musicEl = null;
    }
  }

  toggleMute(): void {
    this.muted = !this.muted;
    if (this.muted) this.stopMusic();
  }

  isMuted(): boolean { return this.muted; }
}
