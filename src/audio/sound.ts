/** Small synthesized sound effects via WebAudio — no audio files needed. */
export class SoundKit {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  muted = false;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  launch(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.16);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.35, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    osc.connect(gain).connect(this.master);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  bounce(intensity = 1): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    const freq = 700 + Math.random() * 260;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.09);
    const vol = Math.min(0.28, 0.08 + intensity * 0.22);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(vol, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    osc.connect(gain).connect(this.master);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  result(kind: "cara" | "cruz" | "lado"): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return;
    const now = ctx.currentTime;
    const notes = kind === "lado" ? [523.25, 622.25, 830.6] : [659.25, 830.6];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + i * 0.07;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
      osc.connect(gain).connect(this.master!);
      osc.start(start);
      osc.stop(start + 0.55);
    });
  }
}
