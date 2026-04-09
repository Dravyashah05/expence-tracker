import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  private platformId = inject(PLATFORM_ID);
  private audioContext: AudioContext | null = null;
  private readonly incomeSoundPath = '/sounds/coin-collect.mp3';
  private readonly expenseSoundPath = '/sounds/coin-drop.mp3';
  private soundEnabledByFile = {
    income: true,
    expense: true,
  };
  private cachedAudio = new Map<string, HTMLAudioElement>();

  playIncomeCoin(): void {
    if (this.tryPlayFileSound(this.incomeSoundPath, 'income', () => this.playIncomeSynth())) {
      return;
    }

    this.playIncomeSynth();
  }

  playExpenseCoin(): void {
    if (this.tryPlayFileSound(this.expenseSoundPath, 'expense', () => this.playExpenseSynth())) {
      return;
    }

    this.playExpenseSynth();
  }

  private playIncomeSynth(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const start = ctx.currentTime + 0.01;
    this.scheduleTone(ctx, start, {
      type: 'triangle',
      fromHz: 900,
      toHz: 1320,
      duration: 0.08,
      peakGain: 0.09,
    });
    this.scheduleTone(ctx, start + 0.085, {
      type: 'triangle',
      fromHz: 1320,
      toHz: 1850,
      duration: 0.1,
      peakGain: 0.08,
    });
  }

  private playExpenseSynth(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const start = ctx.currentTime + 0.01;
    this.scheduleTone(ctx, start, {
      type: 'sine',
      fromHz: 760,
      toHz: 420,
      duration: 0.14,
      peakGain: 0.1,
    });
    this.scheduleTone(ctx, start + 0.1, {
      type: 'sine',
      fromHz: 360,
      toHz: 200,
      duration: 0.16,
      peakGain: 0.07,
    });
  }

  private ensureContext(): AudioContext | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    if (!this.audioContext) {
      const AudioContextCtor =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) {
        return null;
      }
      this.audioContext = new AudioContextCtor();
    }

    if (this.audioContext.state === 'suspended') {
      void this.audioContext.resume();
    }

    return this.audioContext;
  }

  private scheduleTone(
    ctx: AudioContext,
    startAt: number,
    config: {
      type: OscillatorType;
      fromHz: number;
      toHz: number;
      duration: number;
      peakGain: number;
    },
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = config.type;
    osc.frequency.setValueAtTime(config.fromHz, startAt);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(10, config.toHz),
      startAt + config.duration,
    );

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(config.peakGain, startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + config.duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + config.duration + 0.01);
  }

  private tryPlayFileSound(
    path: string,
    type: 'income' | 'expense',
    fallback: () => void,
  ): boolean {
    if (!isPlatformBrowser(this.platformId) || !this.soundEnabledByFile[type]) {
      return false;
    }

    let source = this.cachedAudio.get(path);
    if (!source) {
      source = new Audio(path);
      source.preload = 'auto';
      this.cachedAudio.set(path, source);
    }

    const audio = source.cloneNode(true) as HTMLAudioElement;
    audio.volume = 1;
    const playPromise = audio.play();
    if (!playPromise) {
      return true;
    }

    void playPromise.catch(() => {
      this.soundEnabledByFile[type] = false;
      fallback();
    });
    return true;
  }
}
