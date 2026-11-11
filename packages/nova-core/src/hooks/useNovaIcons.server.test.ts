import { describe, expect, it, vi } from 'vitest';

// React Server Components: the `react-server` build of React has no createContext and no useContext. The loader, the link,
// exit, bin and close icons and the close button of a toast rendered on the server with 0.13; they must still load and render
// there, in the default pixel look
vi.mock('react', async (importOriginal) => {
  const server: Record<string, unknown> = { ...(await importOriginal<typeof import('react')>()) };
  delete server.createContext;
  delete server.useContext;
  // useId is in the react-server build; called here without a renderer, it needs a stand-in
  return { ...server, useId: () => ':r1:' };
});

describe('the icon set in a React Server Component', () => {
  it('loads without context and gives the pixel set', async () => {
    const { pixelIcons, useNovaIcons } = await import('./useNovaIcons');
    expect(useNovaIcons()).toBe(pixelIcons);
  });

  it('lets the components that read it render on the server', async () => {
    const { QuasarLoader } = await import('../components/QuasarLoader');
    const { ExternalLinkIcon } = await import('../components/ExternalLinkIcon');
    const tree = QuasarLoader({ size: 40 }) as unknown as { props: { className: string } };
    expect(tree.props.className).toContain('tuwa-quasar-loader--pixel');
    expect(ExternalLinkIcon({})).toBeTruthy();
  });
});
