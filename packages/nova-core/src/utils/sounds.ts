/**
 * @file The sounds of the Nova components: short tones synthesized with the Web Audio API, so no files and no requests.
 */

/** The moments of the Nova components that can have a sound. */
export type NovaSoundName =
  | 'connect'
  | 'disconnect'
  | 'txPending'
  | 'txSuccess'
  | 'txError'
  | 'error'
  | 'networkSwitch'
  | 'copy'
  | 'balanceRefresh';

/** Every {@link NovaSoundName}. */
export const NOVA_SOUND_NAMES: readonly NovaSoundName[] = [
  'connect',
  'disconnect',
  'txPending',
  'txSuccess',
  'txError',
  'error',
  'networkSwitch',
  'copy',
  'balanceRefresh',
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
};

// Up for what began or went well, down for what ended or failed. What happens often, a copy or a refresh, is the quietest
const TONES: Record<NovaSoundName, readonly Tone[]> = {
  connect: [
    { frequency: 659, at: 0, duration: 0.09, gain: 0.9 },
    { frequency: 988, at: 0.07, duration: 0.16, gain: 0.9 },
  ],
  disconnect: [
    { frequency: 494, at: 0, duration: 0.09, gain: 0.8 },
    { frequency: 330, at: 0.07, duration: 0.17, gain: 0.8 },
  ],
  txPending: [{ frequency: 880, at: 0, duration: 0.07, gain: 0.5, wave: 'triangle' }],
  txSuccess: [
    { frequency: 523, at: 0, duration: 0.09, gain: 0.8 },
    { frequency: 659, at: 0.08, duration: 0.09, gain: 0.8 },
    { frequency: 784, at: 0.16, duration: 0.2, gain: 0.9 },
  ],
  txError: [
    { frequency: 220, at: 0, duration: 0.13, gain: 1, wave: 'triangle' },
    { frequency: 175, at: 0.11, duration: 0.22, gain: 1, wave: 'triangle' },
  ],
  error: [{ frequency: 196, glideTo: 165, at: 0, duration: 0.18, gain: 0.9, wave: 'triangle' }],
  networkSwitch: [{ frequency: 520, glideTo: 780, at: 0, duration: 0.13, gain: 0.55 }],
  copy: [{ frequency: 1400, at: 0, duration: 0.04, gain: 0.3 }],
  balanceRefresh: [
    { frequency: 660, at: 0, duration: 0.05, gain: 0.3 },
    { frequency: 880, at: 0.055, duration: 0.06, gain: 0.3 },
  ],
};

const DEFAULT_VOLUME = 0.2;
const SILENCE = 0.0001;
// Two parts of a page that report the same moment, as the balance in the button and in the window, make one sound
const SAME_SOUND_WITHIN_MS = 60;

let context: AudioContext | undefined;
const lastPlayedAt = new Map<NovaSoundName, number>();

function playTone(audio: AudioContext, start: number, volume: number, tone: Tone) {
  const at = start + tone.at;
  const end = at + tone.duration;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.type = tone.wave ?? 'sine';
  oscillator.frequency.setValueAtTime(tone.frequency, at);
  if (tone.glideTo) oscillator.frequency.exponentialRampToValueAtTime(tone.glideTo, end);

  gain.gain.setValueAtTime(SILENCE, at);
  gain.gain.exponentialRampToValueAtTime(Math.max(tone.gain * volume, SILENCE), at + 0.008);
  gain.gain.exponentialRampToValueAtTime(SILENCE, end);

  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(at);
  oscillator.stop(end + 0.02);
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
  lastPlayedAt.set(name, now);

  // A sound is never worth an error in the flow that asked for it
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume().catch(() => undefined);
    const start = context.currentTime + 0.01;
    for (const tone of TONES[name]) playTone(context, start, volume, tone);
  } catch (error) {
    console.warn('[Nova] Could not play a sound:', error);
  }
}
