// All audio is synthesized on the fly via the Web Audio API —
// no bundled sound assets, no extra requests, no extra bytes
// in the asset graph. The two effects this module ships:
//
//   blip()     a short triangle-wave tick used per character
//              while the dialogue streams (Animal-Crossing-style
//              voice effect). Pitch is jittered per call so the
//              stream doesn't read as one sustained tone.
//   advance()  a slightly brighter, longer chirp emitted when
//              the dialogue moves to the next line (or fires the
//              advance callback that takes us to the next screen).
//
// Browsers gate AudioContext behind a user gesture, so we lazy-
// create the context and `unlockAudio()` resumes it on the first
// click/tap/key. Mute state is persisted in localStorage under
// `puc:muted` so the player's choice survives reloads.

const STORAGE_KEY = 'puc:muted';

let ctx: AudioContext | null = null;
let muted = loadMuted();
const listeners = new Set<(muted: boolean) => void>();

// Long-running ambient loops (conveyor, etc.) register here so
// `setMuted()` can ramp their gains alongside the one-shots.
interface AmbientHandle {
  setMuted(m: boolean): void;
  stop(): void;
}
const ambientHandles = new Set<AmbientHandle>();

function loadMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function saveMuted(value: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
  } catch {
    /* localStorage unavailable (private mode, quota) — non-fatal */
  }
}

interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const w = window as WindowWithWebkitAudio;
    const Ctor = window.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
  return ctx;
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  if (muted === value) return;
  muted = value;
  saveMuted(value);
  ambientHandles.forEach((h) => h.setMuted(value));
  listeners.forEach((cb) => cb(muted));
}

export function toggleMute(): void {
  setMuted(!muted);
}

export function onMuteChange(cb: (muted: boolean) => void): void {
  listeners.add(cb);
}

// Resume the audio context on first interaction. Browsers will
// otherwise leave it suspended and the first blip you try to
// schedule never sounds.
export function unlockAudio(): void {
  ensureContext();
}

// Low square-wave bleep in the Undertale voice palette — short,
// bit-crunchy, lives around 180–220 Hz so the dialogue reads as
// chunky text rather than a music-box jingle. Small pitch jitter
// keeps repeats from fusing into a sustained tone.
export function playBlip(): void {
  if (muted) return;
  const c = ensureContext();
  if (!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'square';
  osc.frequency.value = 180 + Math.random() * 40;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.1, now + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.04);
  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}

// Three-note ascending square-wave arpeggio for the post-sign
// flourish. Stays in the low/mid register so it matches the rest
// of the audio palette — not a music-box jingle, just a short
// chunky "you did it (you did not)" tag.
export function playCelebrate(): void {
  if (muted) return;
  const c = ensureContext();
  if (!c) return;
  const now = c.currentTime;
  // Roughly G3 → B3 → D4 — a major arpeggio. Notes overlap
  // slightly so the run reads as one flourish.
  const notes = [196, 247, 330];
  notes.forEach((freq, i) => {
    const t = now + i * 0.09;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.13, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.16);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  });
}

// "Denied" thud — a single low square-wave note with a clear
// downward bend. Used when the player taps the top hat and the
// INSUFFICIENT FUNDS flash fires. Lower and longer than the
// advance boop so it reads as rejection rather than progression.
export function playDenied(): void {
  if (muted) return;
  const c = ensureContext();
  if (!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(110, now);
  osc.frequency.linearRampToValueAtTime(80, now + 0.12);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.16, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.18);
  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.2);
}

// Angry under-crow crowd ambience for the news screen. Brown
// noise → bandpass at ~500 Hz (Q=2) with a slow LFO modulating
// the centre frequency so the wash feels like many voices
// rolling, not a static hiss. Wired into `ambientHandles` so
// the mute toggle ramps it alongside everything else.
export function startCrowd(): () => void {
  const c = ensureContext();
  if (!c) return () => {};

  const targetGain = 0.1;

  // Longer buffer than the conveyor (3 s) so the wash doesn't
  // sound obviously looped over the news broadcast.
  const bufferSeconds = 3;
  const buffer = c.createBuffer(
    1,
    Math.floor(c.sampleRate * bufferSeconds),
    c.sampleRate,
  );
  const data = buffer.getChannelData(0);
  let prev = 0;
  for (let i = 0; i < data.length; i += 1) {
    const white = Math.random() * 2 - 1;
    prev = (prev + 0.02 * white) / 1.02;
    data[i] = prev * 3.5;
  }

  const noise = c.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const bandpass = c.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 500;
  bandpass.Q.value = 2;

  // LFO modulating the bandpass centre between ~350 and ~650 Hz.
  // The drift evokes the loose chant/swell of a real crowd rather
  // than a sustained drone.
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 0.45;
  lfoGain.gain.value = 150;
  lfo.connect(lfoGain).connect(bandpass.frequency);

  const gain = c.createGain();
  gain.gain.value = 0;
  noise.connect(bandpass).connect(gain).connect(c.destination);

  noise.start();
  lfo.start();
  gain.gain.linearRampToValueAtTime(
    muted ? 0 : targetGain,
    c.currentTime + 0.9,
  );

  let stopped = false;
  const handle: AmbientHandle = {
    setMuted(m) {
      gain.gain.cancelScheduledValues(c.currentTime);
      gain.gain.linearRampToValueAtTime(
        m ? 0 : targetGain,
        c.currentTime + 0.2,
      );
    },
    stop() {
      if (stopped) return;
      stopped = true;
      gain.gain.cancelScheduledValues(c.currentTime);
      gain.gain.linearRampToValueAtTime(0, c.currentTime + 0.5);
      window.setTimeout(() => {
        try {
          noise.stop();
          lfo.stop();
        } catch {
          /* already stopped */
        }
        noise.disconnect();
        bandpass.disconnect();
        gain.disconnect();
        lfo.disconnect();
        lfoGain.disconnect();
      }, 550);
    },
  };
  ambientHandles.add(handle);

  return () => {
    ambientHandles.delete(handle);
    handle.stop();
  };
}

// Ascending series of short blips that fires alongside the
// post-broadcast NEST WORTH counter. The earlier sustained
// sweep version read as obnoxious; discrete ticks feel more
// like a counter clicking up. Pitch climbs from ~220 to ~440 Hz
// across N evenly-spaced notes. Returns a stop function so the
// screen can bail the remaining scheduled notes if it unmounts
// early.
export function playCounterSweep(durationMs: number): () => void {
  if (muted) return () => {};
  const c = ensureContext();
  if (!c) return () => {};

  const now = c.currentTime;
  const dur = durationMs / 1000;
  const NOTE_COUNT = 8;
  const step = dur / NOTE_COUNT;
  const startHz = 220;
  const endHz = 440;
  const oscs: OscillatorNode[] = [];

  for (let i = 0; i < NOTE_COUNT; i += 1) {
    const t = now + i * step;
    const progress = NOTE_COUNT > 1 ? i / (NOTE_COUNT - 1) : 0;
    const freq = startHz + (endHz - startHz) * progress;

    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.05, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.07);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.08);
    oscs.push(osc);
  }

  let stopped = false;
  return () => {
    if (stopped) return;
    stopped = true;
    oscs.forEach((o) => {
      try {
        o.stop(c.currentTime);
      } catch {
        /* already stopped */
      }
    });
  };
}

// Spaceship interior ambience. Two layered sources — a very
// low brown-noise rumble for hull/engine vibration, plus a deep
// sub-bass sine drone for the engine thrum. A slow tremolo on
// the main gain ("breathing engine") keeps the bed from feeling
// static across the captain's whole speech. Wired into
// `ambientHandles` so the mute toggle ramps it.
export function startSpaceship(): () => void {
  const c = ensureContext();
  if (!c) return () => {};

  const targetGain = 0.09;

  // Brown-noise rumble (hull / engine vibration).
  const bufferSeconds = 3;
  const buffer = c.createBuffer(
    1,
    Math.floor(c.sampleRate * bufferSeconds),
    c.sampleRate,
  );
  const data = buffer.getChannelData(0);
  let prev = 0;
  for (let i = 0; i < data.length; i += 1) {
    const white = Math.random() * 2 - 1;
    prev = (prev + 0.02 * white) / 1.02;
    data[i] = prev * 3.5;
  }
  const noise = c.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const lowpass = c.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 180;
  lowpass.Q.value = 0.7;

  // Sub-bass sine drone (the engine itself).
  const sub = c.createOscillator();
  sub.type = 'sine';
  sub.frequency.value = 55;
  const subGain = c.createGain();
  subGain.gain.value = 0.08;
  sub.connect(subGain);

  // Slow LFO on the master gain so the bed gently swells —
  // sells "pressurised cabin breathing" without modulating
  // anything pitched.
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 0.25;
  lfoGain.gain.value = 0.02;
  lfo.connect(lfoGain);

  const gain = c.createGain();
  gain.gain.value = 0;
  noise.connect(lowpass).connect(gain).connect(c.destination);
  subGain.connect(gain);
  lfoGain.connect(gain.gain);

  noise.start();
  sub.start();
  lfo.start();
  gain.gain.linearRampToValueAtTime(
    muted ? 0 : targetGain,
    c.currentTime + 1.0,
  );

  let stopped = false;
  const handle: AmbientHandle = {
    setMuted(m) {
      gain.gain.cancelScheduledValues(c.currentTime);
      gain.gain.linearRampToValueAtTime(
        m ? 0 : targetGain,
        c.currentTime + 0.2,
      );
    },
    stop() {
      if (stopped) return;
      stopped = true;
      gain.gain.cancelScheduledValues(c.currentTime);
      gain.gain.linearRampToValueAtTime(0, c.currentTime + 0.5);
      window.setTimeout(() => {
        try {
          noise.stop();
          sub.stop();
          lfo.stop();
        } catch {
          /* already stopped */
        }
        noise.disconnect();
        lowpass.disconnect();
        gain.disconnect();
        sub.disconnect();
        subGain.disconnect();
        lfo.disconnect();
        lfoGain.disconnect();
      }, 550);
    },
  };
  ambientHandles.add(handle);

  return () => {
    ambientHandles.delete(handle);
    handle.stop();
  };
}

// Faint conveyor-belt ambience for the factory screen. Brown
// noise → low-pass at ~220 Hz → quiet gain. The lowpass kills
// the hiss so what's left reads as machinery rumble. Returns a
// `stop` function — the caller (factoryScreen) owns the lifetime
// and is responsible for invoking it in its cleanup.
export function startConveyor(): () => void {
  const c = ensureContext();
  if (!c) return () => {};

  const targetGain = 0.07;

  // 2-second looping brown-noise buffer. Brown (red) noise has a
  // -6 dB/octave roll-off vs. white, so even before the lowpass
  // it sits in the rumble register.
  const bufferSeconds = 2;
  const buffer = c.createBuffer(
    1,
    Math.floor(c.sampleRate * bufferSeconds),
    c.sampleRate,
  );
  const data = buffer.getChannelData(0);
  let prev = 0;
  for (let i = 0; i < data.length; i += 1) {
    const white = Math.random() * 2 - 1;
    prev = (prev + 0.02 * white) / 1.02;
    data[i] = prev * 3.5;
  }

  const noise = c.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 220;
  filter.Q.value = 0.6;

  const gain = c.createGain();
  gain.gain.value = 0;

  noise.connect(filter).connect(gain).connect(c.destination);
  noise.start();
  // Fade in so the loop doesn't pop when the player arrives.
  gain.gain.linearRampToValueAtTime(
    muted ? 0 : targetGain,
    c.currentTime + 0.6,
  );

  let stopped = false;
  const handle: AmbientHandle = {
    setMuted(m) {
      gain.gain.cancelScheduledValues(c.currentTime);
      gain.gain.linearRampToValueAtTime(
        m ? 0 : targetGain,
        c.currentTime + 0.2,
      );
    },
    stop() {
      if (stopped) return;
      stopped = true;
      gain.gain.cancelScheduledValues(c.currentTime);
      gain.gain.linearRampToValueAtTime(0, c.currentTime + 0.3);
      window.setTimeout(() => {
        try {
          noise.stop();
        } catch {
          /* already stopped */
        }
        noise.disconnect();
        filter.disconnect();
        gain.disconnect();
      }, 350);
    },
  };
  ambientHandles.add(handle);

  return () => {
    ambientHandles.delete(handle);
    handle.stop();
  };
}

// Low "boop" on advance — a single square-wave note with a small
// downward bend. No upward chirp on purpose; the rising tone read
// too jingly against the rest of the audio.
export function playAdvance(): void {
  if (muted) return;
  const c = ensureContext();
  if (!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(170, now);
  osc.frequency.linearRampToValueAtTime(130, now + 0.08);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.14, now + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.1);
  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.12);
}
