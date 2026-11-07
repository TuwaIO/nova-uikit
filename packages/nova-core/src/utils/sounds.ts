/**
 * @file The sounds of the Nova components: short space-like tones synthesized with the Web Audio API, so no files and no
 * requests.
 */

/** The moments of the Nova components that can have a sound. */
export type NovaSoundName =
  | 'connect'
  | 'disconnect'
  | 'txPending'
  | 'txSuccess'
  | 'txError'
  | 'txReplaced'
  | 'error'
  | 'networkSwitch'
  | 'copy'
  | 'balanceRefresh'
  | 'remove'
  | 'modalOpen'
  | 'modalClose'
  | 'externalLink'
  | 'addWallet'
  | 'getWallet'
  | 'aboutWallets'
  | 'checkbox';

/** Every {@link NovaSoundName}. */
export const NOVA_SOUND_NAMES: readonly NovaSoundName[] = [
  'connect',
  'disconnect',
  'txPending',
  'txSuccess',
  'txError',
  'txReplaced',
  'error',
  'networkSwitch',
  'copy',
  'balanceRefresh',
  'remove',
  'modalOpen',
  'modalClose',
  'externalLink',
  'addWallet',
  'getWallet',
  'aboutWallets',
  'checkbox',
];

/**
 * Which sounds play. Sounds are off unless they are asked for: `true` plays all of them, and an object plays all of them
 * except the ones set to `false`, with `volume` from 0 to 1 (default: `0.2`).
 *
 * @example
 * ```ts
 * import type { NovaSoundsConfig } from '@tuwaio/nova-core/utils';
 *
 * export const sounds: NovaSoundsConfig = { copy: false, volume: 0.3 };
 * ```
 */
export type NovaSoundsConfig = boolean | ({ volume?: number } & Partial<Record<NovaSoundName, boolean>>);

type Tone = {
  /** Hertz at the start. */
  frequency: number;
  /** Hertz at the end, for a tone that slides. */
  glideTo?: number;
  /** Seconds after the start of the sound. */
  at: number;
  /** Seconds. */
  duration: number;
  /** Loudness against the other sounds, from 0 to 1. */
  gain: number;
  wave?: OscillatorType;
  /** Cents between two voices of the tone, whose slow beating is what makes it shimmer. */
  shimmer?: number;
};

/** Noise that a moving filter turns into a rush of air. */
type Rush = {
  /** Hertz of the filter at the start. */
  from: number;
  /** Hertz of the filter at the end. */
  to: number;
  /** Seconds after the start of the sound. */
  at: number;
  /** Seconds. */
  duration: number;
  /** Loudness against the other sounds, from 0 to 1. */
  gain: number;
};

type Sound = {
  tones: readonly Tone[];
  rushes?: readonly Rush[];
  /** How many times the tones come back, quieter each time, as from far away. */
  echoes?: number;
};

// The theme of TUWA is space: what begins slides up and rings on, what ends slides down, and the echoes give it the room. What
// happens often, a copy or a refresh, is the shortest and the quietest
const SOUNDS: Record<NovaSoundName, Sound> = {
  // Docking: a glide up that settles on a ringing fifth
  connect: {
    tones: [
      { frequency: 330, glideTo: 660, at: 0, duration: 0.18, gain: 0.55, shimmer: 8 },
      { frequency: 660, at: 0.14, duration: 0.34, gain: 0.7, shimmer: 6 },
      { frequency: 990, at: 0.2, duration: 0.38, gain: 0.4, shimmer: 6 },
    ],
    echoes: 2,
  },
  // Powering down
  disconnect: {
    tones: [
      { frequency: 660, glideTo: 165, at: 0, duration: 0.38, gain: 0.7, shimmer: 10 },
      { frequency: 330, glideTo: 82, at: 0.04, duration: 0.42, gain: 0.35 },
    ],
    echoes: 1,
  },
  // A sonar ping sent out, and its reflections
  txPending: {
    tones: [{ frequency: 1175, at: 0, duration: 0.12, gain: 0.45, shimmer: 5 }],
    echoes: 3,
  },
  // Arrival: a rising chord of open fifths
  txSuccess: {
    tones: [
      { frequency: 523, at: 0, duration: 0.3, gain: 0.6, shimmer: 6 },
      { frequency: 784, at: 0.09, duration: 0.34, gain: 0.6, shimmer: 6 },
      { frequency: 1175, at: 0.18, duration: 0.4, gain: 0.55, shimmer: 6 },
      { frequency: 1568, at: 0.27, duration: 0.5, gain: 0.4, shimmer: 6 },
    ],
    echoes: 2,
  },
  // A signal lost
  txError: {
    tones: [
      { frequency: 311, glideTo: 155, at: 0, duration: 0.34, gain: 0.8, wave: 'triangle', shimmer: 14 },
      { frequency: 233, glideTo: 110, at: 0.12, duration: 0.42, gain: 0.8, wave: 'triangle', shimmer: 14 },
    ],
    echoes: 1,
  },
  // A change of course: down, and up on another line
  txReplaced: {
    tones: [
      { frequency: 784, glideTo: 587, at: 0, duration: 0.14, gain: 0.45, shimmer: 8 },
      { frequency: 587, glideTo: 880, at: 0.12, duration: 0.22, gain: 0.45, shimmer: 8 },
    ],
    echoes: 1,
  },
  // A glitch in the signal
  error: {
    tones: [{ frequency: 247, glideTo: 185, at: 0, duration: 0.22, gain: 0.7, wave: 'triangle', shimmer: 18 }],
    echoes: 1,
  },
  // A jump through hyperspace, in clean tones: noise under it sounded like crumpled paper, which is for the bin alone
  networkSwitch: {
    tones: [
      { frequency: 494, glideTo: 988, at: 0, duration: 0.12, gain: 0.4, shimmer: 12 },
      { frequency: 988, at: 0.1, duration: 0.2, gain: 0.28, shimmer: 8 },
    ],
    echoes: 2,
  },
  // A star that twinkles
  copy: {
    tones: [
      { frequency: 1760, at: 0, duration: 0.06, gain: 0.25 },
      { frequency: 2637, at: 0.045, duration: 0.09, gain: 0.2 },
    ],
  },
  // A short scan
  balanceRefresh: {
    tones: [
      { frequency: 880, glideTo: 1320, at: 0, duration: 0.1, gain: 0.22 },
      { frequency: 1320, at: 0.09, duration: 0.12, gain: 0.2, shimmer: 5 },
    ],
  },
  // Out through the airlock and into the bin: the rush of the fall, the thud of the landing and the lid
  remove: {
    tones: [
      { frequency: 520, glideTo: 110, at: 0.02, duration: 0.26, gain: 0.4, wave: 'triangle' },
      { frequency: 90, glideTo: 55, at: 0.26, duration: 0.14, gain: 0.9 },
      { frequency: 1400, at: 0.3, duration: 0.05, gain: 0.12, wave: 'triangle' },
    ],
    rushes: [{ from: 2400, to: 300, at: 0, duration: 0.28, gain: 0.6 }],
  },
  // Muffled, as a copy is: a hatch that opens
  modalOpen: {
    tones: [{ frequency: 587, glideTo: 784, at: 0, duration: 0.07, gain: 0.22 }],
  },
  // And that closes
  modalClose: {
    tones: [{ frequency: 784, glideTo: 587, at: 0, duration: 0.07, gain: 0.18 }],
  },
  // It flies away: up and further off with each echo
  externalLink: {
    tones: [
      { frequency: 440, glideTo: 1760, at: 0, duration: 0.22, gain: 0.35, shimmer: 10 },
      { frequency: 880, glideTo: 3520, at: 0.03, duration: 0.2, gain: 0.14 },
    ],
    echoes: 2,
  },
  // Another signal joins
  addWallet: {
    tones: [
      { frequency: 659, at: 0, duration: 0.09, gain: 0.4, shimmer: 6 },
      { frequency: 880, at: 0.07, duration: 0.09, gain: 0.4, shimmer: 6 },
      { frequency: 1319, at: 0.14, duration: 0.2, gain: 0.35, shimmer: 6 },
    ],
    echoes: 1,
  },
  // The start of a voyage: open fifths that go on ringing, for the screen that sends a person to get a wallet
  getWallet: {
    tones: [
      { frequency: 392, at: 0, duration: 0.18, gain: 0.45, shimmer: 8 },
      { frequency: 587, at: 0.08, duration: 0.22, gain: 0.45, shimmer: 8 },
      { frequency: 880, at: 0.16, duration: 0.3, gain: 0.4, shimmer: 6 },
    ],
    echoes: 2,
  },
  // A key that turns in a lock, and what it opens, for the screen whose picture is that key
  aboutWallets: {
    tones: [
      { frequency: 1047, at: 0, duration: 0.05, gain: 0.3, wave: 'triangle' },
      { frequency: 1319, at: 0.06, duration: 0.05, gain: 0.3, wave: 'triangle' },
      { frequency: 1568, glideTo: 1760, at: 0.12, duration: 0.28, gain: 0.35, shimmer: 6 },
    ],
    echoes: 1,
  },
  // A small switch, muffled as a copy is
  checkbox: {
    tones: [{ frequency: 1200, glideTo: 900, at: 0, duration: 0.035, gain: 0.28, wave: 'triangle' }],
  },
};

// They come with something else: a dialog that opens from a button that has its own sound, or that replaces another dialog
const GIVES_WAY: readonly NovaSoundName[] = ['modalOpen', 'modalClose'];
const GIVES_WAY_WITHIN_MS = 150;

const DEFAULT_VOLUME = 0.2;
const SILENCE = 0.0001;
const ATTACK_SECONDS = 0.012;
const ECHO_SECONDS = 0.14;
const ECHO_LEVEL = 0.35;
// Room for the tones that overlap: measured, the loudest sound stays below clipping at full volume. Two voices share it
const TONE_LEVEL = 0.8;
// Two parts of a page that report the same moment, as the balance in the button and in the window, make one sound
const SAME_SOUND_WITHIN_MS = 60;

let context: AudioContext | undefined;
let noise: AudioBuffer | undefined;
const lastPlayedAt = new Map<NovaSoundName, number>();
let lastSoundAt = 0;

function envelopeOf(audio: AudioContext, at: number, end: number, peak: number) {
  const gain = audio.createGain();
  gain.gain.setValueAtTime(SILENCE, at);
  gain.gain.exponentialRampToValueAtTime(Math.max(peak, SILENCE), at + ATTACK_SECONDS);
  gain.gain.exponentialRampToValueAtTime(SILENCE, end);
  gain.connect(audio.destination);
  return gain;
}

function playTone(audio: AudioContext, start: number, level: number, tone: Tone) {
  const at = start + tone.at;
  const end = at + tone.duration;
  const voices = tone.shimmer ? [tone.shimmer, -tone.shimmer] : [0];
  const gain = envelopeOf(audio, at, end, (tone.gain * level * TONE_LEVEL) / voices.length);

  for (const cents of voices) {
    const oscillator = audio.createOscillator();
    oscillator.type = tone.wave ?? 'sine';
    oscillator.detune.setValueAtTime(cents, at);
    oscillator.frequency.setValueAtTime(tone.frequency, at);
    if (tone.glideTo) oscillator.frequency.exponentialRampToValueAtTime(tone.glideTo, end);
    oscillator.connect(gain);
    oscillator.start(at);
    oscillator.stop(end + 0.02);
  }
}

function playRush(audio: AudioContext, start: number, level: number, rush: Rush) {
  const at = start + rush.at;
  const end = at + rush.duration;

  if (!noise) {
    noise = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
    const samples = noise.getChannelData(0);
    for (let i = 0; i < samples.length; i += 1) samples[i] = Math.random() * 2 - 1;
  }

  const source = audio.createBufferSource();
  source.buffer = noise;
  const filter = audio.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.setValueAtTime(1.2, at);
  filter.frequency.setValueAtTime(rush.from, at);
  filter.frequency.exponentialRampToValueAtTime(rush.to, end);
  source.connect(filter);
  filter.connect(envelopeOf(audio, at, end, rush.gain * level));
  source.start(at);
  source.stop(end + 0.02);
}

/**
 * Plays a sound, if `config` asks for it. It plays nothing on a server, in a tab that is not visible (with two tabs open it
 * would play twice), and before the person has used the page, as browsers do not start audio earlier. It never throws.
 *
 * Side effects: creates one `AudioContext` on the first sound, and uses the audio output of the device. No files and no
 * network requests.
 *
 * @param name - The sound.
 * @param config - See {@link NovaSoundsConfig}. Without it, nothing plays.
 */
export function playNovaSound(name: NovaSoundName, config: NovaSoundsConfig | undefined): void {
  if (!config || (typeof config === 'object' && config[name] === false)) return;
  if (typeof window === 'undefined' || typeof AudioContext === 'undefined') return;
  if (document.visibilityState !== 'visible') return;
  // Asked earlier, the browser refuses and logs a warning
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;

  const volume = Math.min(Math.max((typeof config === 'object' ? config.volume : undefined) ?? DEFAULT_VOLUME, 0), 1);
  if (volume === 0) return;

  const now = Date.now();
  if (now - (lastPlayedAt.get(name) ?? 0) < SAME_SOUND_WITHIN_MS) return;
  if (GIVES_WAY.includes(name) && now - lastSoundAt < GIVES_WAY_WITHIN_MS) return;
  lastPlayedAt.set(name, now);
  lastSoundAt = now;

  // A sound is never worth an error in the flow that asked for it
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume().catch(() => undefined);
    const start = context.currentTime + 0.01;
    const { tones, rushes = [], echoes = 0 } = SOUNDS[name];

    for (let echo = 0; echo <= echoes; echo += 1) {
      for (const tone of tones) playTone(context, start + echo * ECHO_SECONDS, volume * ECHO_LEVEL ** echo, tone);
    }
    for (const rush of rushes) playRush(context, start, volume, rush);
  } catch (error) {
    console.warn('[Nova] Could not play a sound:', error);
  }
}
