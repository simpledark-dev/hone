import unmuteIosAudio from 'unmute-ios-audio';
import { ALPHABET } from '../letters';

type LegacyWindow = Window & { webkitAudioContext?: typeof AudioContext };

export interface SequenceCallbacks {
  onLetter?: (index: number) => void;
  onEnd?: () => void;
  /** Playback was cut short (app went to the background). */
  onInterrupted?: () => void;
}

/** Silence before the first letter so the listener can settle. */
export const LEAD_IN_MS = 900;

/**
 * Plays pre-recorded letter clips through Web Audio with sample-accurate
 * scheduling. Using clips instead of speechSynthesis makes playback timing,
 * voice and reliability identical on every phone; the iOS silent switch is
 * handled by unmute-ios-audio.
 */
class LetterAudioEngine {
  private ctx: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private loading: Promise<void> | null = null;
  private active: { sources: AudioBufferSourceNode[]; timers: number[]; cb: SequenceCallbacks } | null = null;
  private initialized = false;
  soundEffects = true;

  init(): void {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;
    try {
      unmuteIosAudio();
    } catch {
      // Not on iOS, or the helper is unavailable; nothing to do.
    }
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.interrupt();
      else void this.ctx?.resume().catch(() => undefined);
    });
  }

  get supported(): boolean {
    return typeof window !== 'undefined' && !!(window.AudioContext ?? (window as LegacyWindow).webkitAudioContext);
  }

  get ready(): boolean {
    return this.buffers.size === ALPHABET.length;
  }

  private getContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext ?? (window as LegacyWindow).webkitAudioContext;
    if (!Ctor) return null;
    this.ctx = new Ctor();
    return this.ctx;
  }

  preload(): Promise<void> {
    if (this.ready) return Promise.resolve();
    if (this.loading) return this.loading;
    const ctx = this.getContext();
    if (!ctx) return Promise.reject(new Error('Web Audio is not supported in this browser.'));
    this.loading = Promise.all(
      ALPHABET.map(async (letter) => {
        const url = `${import.meta.env.BASE_URL}audio/letters/${letter.toLowerCase()}.mp3`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Could not load audio for ${letter}`);
        const buffer = await decode(ctx, await res.arrayBuffer());
        this.buffers.set(letter, buffer);
      }),
    )
      .then(() => undefined)
      .finally(() => {
        this.loading = null;
      });
    return this.loading;
  }

  /** Must be called from a user gesture (tap) before the first sound. */
  async unlock(): Promise<boolean> {
    const ctx = this.getContext();
    if (!ctx) return false;
    if (ctx.state !== 'running') {
      try {
        await ctx.resume();
      } catch {
        return false;
      }
    }
    return ctx.state === 'running';
  }

  async playSequence(letters: string[], intervalMs: number, cb: SequenceCallbacks): Promise<void> {
    this.stop();
    const ctx = this.getContext();
    if (!ctx) throw new Error('Web Audio is not supported in this browser.');
    // Kick off resume() synchronously, while we are still inside the tap
    // handler: iOS only honours it from a user gesture.
    const unlocking = this.unlock();
    if (!this.ready) await this.preload();
    if (!(await unlocking)) throw new Error('Audio is blocked. Tap play again.');

    const sources: AudioBufferSourceNode[] = [];
    const timers: number[] = [];
    const startAt = ctx.currentTime + LEAD_IN_MS / 1000;

    letters.forEach((letter, i) => {
      const buffer = this.buffers.get(letter.toUpperCase());
      if (!buffer) return;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(startAt + (i * intervalMs) / 1000);
      sources.push(source);
      timers.push(window.setTimeout(() => cb.onLetter?.(i), LEAD_IN_MS + i * intervalMs));
    });

    const lastLetter = letters[letters.length - 1] ?? 'A';
    const lastDuration = (this.buffers.get(lastLetter.toUpperCase())?.duration ?? 0.5) * 1000;
    const endMs = LEAD_IN_MS + (letters.length - 1) * intervalMs + lastDuration + 250;
    timers.push(
      window.setTimeout(() => {
        this.active = null;
        cb.onEnd?.();
      }, endMs),
    );
    this.active = { sources, timers, cb };
  }

  stop(): void {
    if (!this.active) return;
    const { sources, timers } = this.active;
    this.active = null;
    timers.forEach((t) => clearTimeout(t));
    sources.forEach((s) => {
      try {
        s.stop();
      } catch {
        // Already stopped.
      }
    });
  }

  private interrupt(): void {
    if (!this.active) return;
    const { cb } = this.active;
    this.stop();
    cb.onInterrupted?.();
  }

  /** Short synthesised feedback tones; silent until the context is unlocked. */
  playTone(kind: 'correct' | 'wrong' | 'tick'): void {
    if (!this.soundEffects) return;
    const ctx = this.getContext();
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const note = (freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.07) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, now + start);
      g.gain.exponentialRampToValueAtTime(gain, now + start + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(g).connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.02);
    };
    if (kind === 'correct') {
      note(523.25, 0, 0.14);
      note(783.99, 0.09, 0.22);
    } else if (kind === 'wrong') {
      note(196, 0, 0.26, 'triangle', 0.06);
    } else {
      note(880, 0, 0.05, 'sine', 0.025);
    }
  }
}

function decode(ctx: AudioContext, data: ArrayBuffer): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    // Callback form works everywhere, including older Safari.
    ctx.decodeAudioData(data, resolve, reject)?.catch(() => undefined);
  });
}

export const letterAudio = new LetterAudioEngine();
