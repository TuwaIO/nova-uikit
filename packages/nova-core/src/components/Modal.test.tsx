import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useState: (initial: unknown) => [initial, vi.fn()],
  useRef: (initial: unknown) => ({ current: initial }),
  useEffect: vi.fn(),
}));

import { watchDialogFrameHeight } from './dialogFrameHeight';
import { DialogContent } from './Modal';

type Element = { type: unknown; props: Record<string, unknown> & { children?: unknown } };

// Every element of a rendered tree (without rendering the child components)
function elements(node: unknown): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== 'object' || !('props' in node)) return [];
  const element = node as Element;
  return [element, ...elements(element.props.children)];
}

describe('DialogContent', () => {
  it('never scales its frame with a layout animation (the scale left an empty band under shrinking content)', () => {
    const render = (DialogContent as unknown as { render: (props: object, ref: null) => unknown }).render;
    const tree = render({ children: 'content' }, null);

    expect(elements(tree).filter((element) => 'layout' in element.props)).toEqual([]);
    expect(elements(tree).some((element) => element.props.children === 'content')).toBe(true);
  });
});

describe('watchDialogFrameHeight', () => {
  type Animation = {
    cancel: ReturnType<typeof vi.fn>;
    keyframes: Keyframe[];
    options: KeyframeAnimationOptions;
    playState: AnimationPlayState;
  };

  const setup = ({ reduceMotion = false } = {}) => {
    let report: () => void = () => undefined;
    const disconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          report = callback;
        }
        observe() {}
        disconnect = disconnect;
      },
    );
    vi.stubGlobal('window', { matchMedia: () => ({ matches: reduceMotion }) });
    const animations: Animation[] = [];
    const frame = {
      offsetHeight: 0,
      animate: vi.fn((keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
        const animation: Animation = { cancel: vi.fn(), keyframes, options, playState: 'running' };
        animations.push(animation);
        return animation;
      }),
    };
    const content = { offsetHeight: 400 };
    const stop = watchDialogFrameHeight({
      frame: frame as unknown as HTMLElement,
      content: content as unknown as HTMLElement,
    });
    // A real observer reports the first size when it starts observing
    report();
    const resize = (height: number) => {
      content.offsetHeight = height;
      report();
    };
    return { frame, animations, resize, stop, disconnect };
  };

  afterEach(() => vi.unstubAllGlobals());

  it('does not animate the first size (the dialog has its own opening animation)', () => {
    const { frame } = setup();
    expect(frame.animate).not.toHaveBeenCalled();
  });

  it('follows shrinking content at once: no frame ever shows a frame taller than its content', () => {
    const { frame, resize } = setup();
    resize(240);
    expect(frame.animate).not.toHaveBeenCalled();
  });

  it('grows the height of the frame, which clips the content until it is fully shown', () => {
    const { animations, resize } = setup();
    resize(520);
    expect(animations).toHaveLength(1);
    expect(animations[0].keyframes).toEqual([{ height: '400px' }, { height: '520px' }]);
    expect(animations[0].options.duration).toBe(200);
  });

  it('continues a growth from the current height, and a shrink during a growth stops it', () => {
    const { frame, animations, resize } = setup();
    resize(520);
    // The frame is 450 px high when the content grows again
    frame.offsetHeight = 450;
    resize(600);
    expect(animations[0].cancel).toHaveBeenCalled();
    expect(animations[1].keyframes).toEqual([{ height: '450px' }, { height: '600px' }]);

    // The frame is 500 px high when the content shrinks to 300 px: the frame takes its height at once
    frame.offsetHeight = 500;
    resize(300);
    expect(animations[1].cancel).toHaveBeenCalled();
    expect(animations).toHaveLength(2);
  });

  it('grows again from the previous height when the last growth has finished but its finish event is not handled yet', () => {
    const { frame, animations, resize } = setup();
    resize(520);
    animations[0].playState = 'finished';
    // Without its animation the frame already has the height of the new content when the observer reports
    frame.offsetHeight = 600;
    resize(600);
    expect(animations).toHaveLength(2);
    expect(animations[1].keyframes).toEqual([{ height: '520px' }, { height: '600px' }]);
  });

  it('does not animate with reduced motion', () => {
    const { frame, resize } = setup({ reduceMotion: true });
    resize(520);
    expect(frame.animate).not.toHaveBeenCalled();
  });

  it('stops observing and cancels a running growth when stopped', () => {
    const { animations, resize, stop, disconnect } = setup();
    resize(520);
    stop();
    expect(disconnect).toHaveBeenCalled();
    expect(animations[0].cancel).toHaveBeenCalled();
  });

  it('does nothing without ResizeObserver', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    const frame = { offsetHeight: 0, animate: vi.fn() };
    expect(() =>
      watchDialogFrameHeight({
        frame: frame as unknown as HTMLElement,
        content: { offsetHeight: 1 } as unknown as HTMLElement,
      })(),
    ).not.toThrow();
  });
});
