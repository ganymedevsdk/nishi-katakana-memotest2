/**
 * Sound engine for Nishi Katakana Memotest
 *
 * Uses Web Audio API to synthesize all sounds — no external files needed.
 * Sounds are designed to be soft, clean, minimal, with a subtle Japanese feel
 * (pentatonic scale, woodblock-like tones, gentle chimes).
 */

let audioCtx: AudioContext | null = null;
let _muted = false;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isMuted(): boolean {
  return _muted;
}

export function setMuted(muted: boolean): void {
  _muted = muted;
}

export function toggleMute(): boolean {
  _muted = !_muted;
  return _muted;
}

// ─── Helpers ──────────────────────────────────────────

function createGain(ctx: AudioContext, volume: number): GainNode {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.connect(ctx.destination);
  return gain;
}

// ─── FLIP: soft whoosh / sweep ───────────────────────
// Short filtered noise burst — like a card sweeping through air

export function playFlip(): void {
  if (_muted) return;
  const ctx = getCtx();
  const duration = 0.12;
  const now = ctx.currentTime;

  // White noise via buffer
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  // Bandpass filter — makes it sound like a soft "fsh"
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(3000, now);
  filter.frequency.exponentialRampToValueAtTime(800, now + duration);
  filter.Q.setValueAtTime(1.5, now);

  const gain = createGain(ctx, 0);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  noise.start(now);
  noise.stop(now + duration);
}

// ─── MATCH: chime / bell ding ────────────────────────
// Two harmonically related sine tones (pentatonic interval) with gentle decay

export function playMatch(): void {
  if (_muted) return;
  const ctx = getCtx();
  const now = ctx.currentTime;

  // D5 and A5 — perfect fifth, very Japanese/koto feel
  const freqs = [587.33, 880.0];
  const duration = 0.5;

  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const gain = createGain(ctx, 0);
    const onset = now + i * 0.06;
    gain.gain.setValueAtTime(0, onset);
    gain.gain.linearRampToValueAtTime(0.18, onset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, onset + duration);

    osc.connect(gain);
    osc.start(onset);
    osc.stop(onset + duration);
  });
}

// ─── FAIL: soft woodblock thud ───────────────────────
// Low-pitched short sine with rapid decay — like a wooden "tok"

export function playFail(): void {
  if (_muted) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  const duration = 0.15;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(120, now + duration);

  const gain = createGain(ctx, 0);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  osc.start(now);
  osc.stop(now + duration);
}

// ─── UNFLIP: softer reverse whoosh ───────────────────
// Similar to flip but lower-pitched and quieter

export function playUnflip(): void {
  if (_muted) return;
  const ctx = getCtx();
  const duration = 0.1;
  const now = ctx.currentTime;

  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, now);
  filter.frequency.exponentialRampToValueAtTime(2000, now + duration);
  filter.Q.setValueAtTime(1.2, now);

  const gain = createGain(ctx, 0);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  noise.start(now);
  noise.stop(now + duration);
}

// ─── WIN: ascending pentatonic melody with shimmer ───
// Short 1.5s jingle: D-E-G-A-D (Japanese pentatonic / yo scale)

export function playWin(): void {
  if (_muted) return;
  const ctx = getCtx();
  const now = ctx.currentTime;

  // D pentatonic yo scale ascending: D5, E5, G5, A5, D6
  const notes = [587.33, 659.25, 783.99, 880.0, 1174.66];
  const noteSpacing = 0.18;
  const noteDuration = 0.4;

  notes.forEach((freq, i) => {
    const onset = now + i * noteSpacing;

    // Main tone
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, onset);

    const gain = createGain(ctx, 0);
    gain.gain.setValueAtTime(0, onset);
    gain.gain.linearRampToValueAtTime(0.15, onset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, onset + noteDuration);

    osc.connect(gain);
    osc.start(onset);
    osc.stop(onset + noteDuration);

    // Shimmer harmonic (octave up, quieter)
    const shimmer = ctx.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(freq * 2, onset);

    const shimmerGain = createGain(ctx, 0);
    shimmerGain.gain.setValueAtTime(0, onset);
    shimmerGain.gain.linearRampToValueAtTime(0.05, onset + 0.02);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, onset + noteDuration * 0.7);

    shimmer.connect(shimmerGain);
    shimmer.start(onset);
    shimmer.stop(onset + noteDuration);
  });

  // Final sustain chord — D5 + A5 together, longer ring
  const chordOnset = now + notes.length * noteSpacing;
  [587.33, 880.0, 1174.66].forEach((freq) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, chordOnset);

    const gain = createGain(ctx, 0);
    gain.gain.setValueAtTime(0, chordOnset);
    gain.gain.linearRampToValueAtTime(0.12, chordOnset + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, chordOnset + 1.0);

    osc.connect(gain);
    osc.start(chordOnset);
    osc.stop(chordOnset + 1.0);
  });
}

// ─── RESET: gentle pop / tap ─────────────────────────
// Very short sine burst — like tapping a ceramic bowl

export function playReset(): void {
  if (_muted) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  const duration = 0.08;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + duration);

  const gain = createGain(ctx, 0);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  osc.start(now);
  osc.stop(now + duration);
}
