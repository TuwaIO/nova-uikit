import { describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../i18n/en';

// Hooks of one render: the state setters it created and the effects it scheduled, run by the tests when they want
const hooks = vi.hoisted(() => ({
  setters: [] as ReturnType<typeof vi.fn>[],
  effects: [] as (() => void)[],
}));

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useState: (initial: unknown) => {
    const set = vi.fn();
    hooks.setters.push(set);
    return [initial, set];
  },
  useEffect: (effect: () => void) => {
    hooks.effects.push(effect);
  },
  useCallback: (fn: unknown) => fn,
}));

vi.mock('../hooks/useNovaConnectLabels', () => ({
  useNovaConnectLabels: () => defaultLabels,
}));

vi.mock('ethereum-blockies-base64', () => ({
  default: (seed: string) => `blockie:${seed}`,
}));

import { WalletAvatar, type WalletAvatarProps } from './WalletAvatar';

const solanaAddress = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
const otherSolanaAddress = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';

// Renders the forwardRef component once and returns the background color and the image of the blockie
function renderAvatar(address: string) {
  const container = vi.fn(() => '');
  const render = (WalletAvatar as unknown as { render: (props: WalletAvatarProps, ref: null) => unknown }).render;
  const tree = JSON.stringify(render({ address, customization: { classNames: { container } } }, null));
  return { bgColor: (container.mock.calls[0] as unknown as [{ bgColor: string }])[0].bgColor, tree };
}

type Element = { props: { children: Element[]; onLoad: () => void } };

// Renders the avatar of an address with an avatar URL and returns its image element
function renderImage(ensAvatar: string) {
  hooks.setters.length = 0;
  hooks.effects.length = 0;
  const render = (WalletAvatar as unknown as { render: (props: WalletAvatarProps, ref: null) => Element }).render;
  const tree = render({ address: solanaAddress, ensAvatar }, null);
  return tree.props.children[1] as Element;
}

describe('WalletAvatar', () => {
  it('draws a blockie and a color of its own for addresses that are not hexadecimal', () => {
    const first = renderAvatar(solanaAddress);
    const second = renderAvatar(otherSolanaAddress);

    expect(first.tree).toContain(`blockie:${solanaAddress}`);
    expect(first.tree).not.toContain('blockie:0x0000000000000000000000000000000000000000');
    expect(first.bgColor).toMatch(/^#[0-9a-f]{6}$/);
    expect(first.bgColor).not.toBe(second.bgColor);
  });

  it('keeps the blockie and the color of an EVM address', () => {
    const { bgColor, tree } = renderAvatar('0x1234567890123456789012345678901234567890');

    expect(tree).toContain('blockie:0x1234567890123456789012345678901234567890');
    expect(bgColor).toBe('#123456');
  });

  it('keeps an avatar shown when its image loaded before the effects ran, as a cached image does on a remount', () => {
    const image = renderImage('https://api.dicebear.com/7.x/identicon/svg?seed=x');
    image.props.onLoad();
    const loadedAt = hooks.setters.map((set) => set.mock.calls.length);

    hooks.effects.forEach((effect) => effect());

    // Nothing puts the avatar back into its loading state (a transparent image under a pulsing circle)
    const later = hooks.setters.flatMap((set, i) => set.mock.calls.slice(loadedAt[i]).map(([value]) => value));
    expect(later).not.toContain(true);
  });
});
