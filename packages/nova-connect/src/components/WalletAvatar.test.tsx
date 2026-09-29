import { describe, expect, it, vi } from 'vitest';

import { defaultLabels } from '../i18n/en';

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useState: (initial: unknown) => [initial, vi.fn()],
  useEffect: vi.fn(),
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
});
