import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NOVA_SOUND_NAMES, type NovaSoundName, playNovaSound } from './sounds';

const started = vi.fn();
const rushed = vi.fn();
const ramps = vi.fn();
const param = (ramp = vi.fn()) => ({ setValueAtTime: vi.fn(), exponentialRampToValueAtTime: ramp });
let state = 'running';
const resume = vi.fn(async () => undefined);
const created = vi.fn();

class FakeAudioContext {
  currentTime = 0;
  sampleRate = 8000;
  destination = {};
  resume = resume;
  get state() {
    return state;
  }
  constructor() {
    created();
  }
  createOscillator() {
    return { type: 'sine', frequency: param(), detune: param(), connect: vi.fn(), start: started, stop: vi.fn() };
  }
  createGain() {
    return { gain: param(ramps), connect: vi.fn() };
  }
  createBuffer(_channels: number, length: number) {
    return { getChannelData: () => new Float32Array(length) };
  }
  createBufferSource() {
    return { buffer: null, connect: vi.fn(), start: rushed, stop: vi.fn() };
  }
  createBiquadFilter() {
    return { type: 'lowpass', Q: param(), frequency: param(), connect: vi.fn() };
  }
}

// Time moves on between tests: a sound of a test is not taken for a repeat of the one before
let clock = 1_000_000;
const stubPage = (visibilityState = 'visible', hasBeenActive = true) => {
  vi.stubGlobal('window', {});
  vi.stubGlobal('document', { visibilityState });
  vi.stubGlobal('navigator', { userActivation: { hasBeenActive } });
  vi.stubGlobal('AudioContext', FakeAudioContext);
};

describe('playNovaSound', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state = 'running';
    clock += 10_000;
    vi.spyOn(Date, 'now').mockImplementation(() => clock);
    stubPage();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // The owner's decision: an update of the package must not make somebody else's site start making noise
  it.each([undefined, false])('stays silent unless it is asked: %s', (config) => {
    playNovaSound('connect', config);
    expect(started).not.toHaveBeenCalled();
  });

  it.each(NOVA_SOUND_NAMES)('%s has a tone when asked', (name: NovaSoundName) => {
    playNovaSound(name, true);
    expect(started).toHaveBeenCalled();
  });

  it('leaves out a sound set to false, and plays the others', () => {
    playNovaSound('copy', { copy: false });
    expect(started).not.toHaveBeenCalled();

    playNovaSound('connect', { copy: false });
    expect(started).toHaveBeenCalled();
  });

  it('plays nothing at no volume, and keeps a volume above 1 at 1', () => {
    playNovaSound('connect', { volume: 0 });
    expect(started).not.toHaveBeenCalled();

    playNovaSound('txError', { volume: 5 });
    expect(Math.max(...ramps.mock.calls.map(([value]) => value as number))).toBeLessThanOrEqual(1);
  });

  // With two tabs open, each tracks the same transaction
  it('plays nothing in a tab that is not visible', () => {
    stubPage('hidden');
    playNovaSound('txSuccess', true);
    expect(started).not.toHaveBeenCalled();
  });

  it('asks nothing of the browser before the person has used the page: it would log a warning', () => {
    stubPage('visible', false);
    playNovaSound('txSuccess', true);
    expect(started).not.toHaveBeenCalled();
    expect(created).not.toHaveBeenCalled();
  });

  it('plays nothing on a server', () => {
    vi.stubGlobal('window', undefined);
    playNovaSound('connect', true);
    expect(started).not.toHaveBeenCalled();
  });

  // Owner, 2026-11-07: a wallet thrown away sounds like one
  it('gives a removed wallet the rush of its fall as well as its tones', () => {
    playNovaSound('remove', true);
    expect(rushed).toHaveBeenCalledOnce();
    expect(started).toHaveBeenCalled();
  });

  // Owner, 2026-11-07: noise under them sounded like crumpled paper. The rush is for the bin alone
  it.each(NOVA_SOUND_NAMES.filter((name) => name !== 'remove'))('%s has no rush of noise', (name: NovaSoundName) => {
    playNovaSound(name, true);
    expect(rushed).not.toHaveBeenCalled();
  });

  // Owner, 2026-11-07: muffled, and no chord of them when one dialog replaces another
  it('lets a dialog that opens give way to the sound that came with it', () => {
    playNovaSound('addWallet', true);
    const before = started.mock.calls.length;

    clock += 20;
    playNovaSound('modalClose', true);
    playNovaSound('modalOpen', true);
    expect(started).toHaveBeenCalledTimes(before);

    clock += 200;
    playNovaSound('modalOpen', true);
    expect(started).toHaveBeenCalledTimes(before + 1);

    clock += 20;
    playNovaSound('modalClose', true);
    expect(started).toHaveBeenCalledTimes(before + 1);
  });

  it('makes one sound of two parts that report the same moment', () => {
    playNovaSound('balanceRefresh', true);
    const once = started.mock.calls.length;
    playNovaSound('balanceRefresh', true);
    expect(started).toHaveBeenCalledTimes(once);

    clock += 100;
    playNovaSound('balanceRefresh', true);
    expect(started).toHaveBeenCalledTimes(once * 2);
  });

  it('wakes a context that the browser has suspended', () => {
    state = 'suspended';
    playNovaSound('connect', true);
    expect(resume).toHaveBeenCalled();
  });

  it('never throws into the flow that asked for the sound', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    started.mockImplementationOnce(() => {
      throw new Error('No audio device');
    });

    expect(() => playNovaSound('disconnect', true)).not.toThrow();
    expect(warn).toHaveBeenCalled();
  });
});
