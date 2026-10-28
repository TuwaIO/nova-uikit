/**
 * @file Animates the height of the dialog frame when its content changes size. Kept apart from `Modal.tsx` so that it
 * can be tested without a DOM.
 */

/**
 * Parameters of {@link watchDialogFrameHeight}.
 *
 * @internal
 */
export type WatchDialogFrameHeightParams = {
  /** The element that clips the content (`overflow: hidden`, no padding or border); its height is animated */
  frame: HTMLElement;
  /** The content of the frame, whose height is observed */
  content: HTMLElement;
  /** Duration of a growth, in milliseconds (default: `200`) */
  duration?: number;
  /** CSS easing of a growth (default: `cubic-bezier(0.1, 0.1, 0.2, 1)`) */
  easing?: string;
};

/**
 * Makes the frame of a dialog follow the height of its content without ever showing a frame taller than the content.
 *
 * - When the content shrinks, the frame takes its height at once. An animated shrink (the former `layout` animation of
 *   `framer-motion`, which scaled the frame) shows the frame taller than the content for the time of the animation:
 *   an empty band under the footer, which stays on screen while the page renders no frames, as when a wallet opens its
 *   window.
 * - When the content grows, the height of the frame grows from the height it has on screen to the new one (Web
 *   Animations API, no fill: the frame takes the height of its content again at the end). The frame clips the content
 *   until it is fully shown.
 * - No animation when the user prefers reduced motion (`prefers-reduced-motion: reduce`), or without the Web Animations
 *   API.
 *
 * Side effects: observes `content` with a `ResizeObserver` and runs animations on `frame` until the returned function
 * is called. Does nothing without `ResizeObserver` (server rendering, old browsers).
 *
 * @param params - The frame and its content.
 * @param params.frame - The element that clips the content; its height is animated.
 * @param params.content - The content, whose height is observed.
 * @param params.duration - Duration of a growth, in milliseconds (default: `200`).
 * @param params.easing - CSS easing of a growth (default: `cubic-bezier(0.1, 0.1, 0.2, 1)`).
 * @returns A function that stops observing and cancels a running growth.
 *
 * @internal
 */
export function watchDialogFrameHeight({
  frame,
  content,
  duration = 200,
  easing = 'cubic-bezier(0.1, 0.1, 0.2, 1)',
}: WatchDialogFrameHeightParams): () => void {
  if (typeof ResizeObserver === 'undefined') return () => undefined;

  let height: number | undefined;
  let growth: Animation | undefined;

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = new ResizeObserver(() => {
    // `offsetHeight` is the height of the layout, without the scale of the opening animation of the dialog
    const next = content.offsetHeight;
    const previous = height;
    height = next;
    if (previous === undefined || next === previous) return;

    // The height on screen: during a growth, the animated height of the frame
    const current = growth ? frame.offsetHeight : previous;
    growth?.cancel();
    growth = undefined;
    if (next <= current || prefersReducedMotion() || typeof frame.animate !== 'function') return;

    const animation = frame.animate([{ height: `${current}px` }, { height: `${next}px` }], { duration, easing });
    growth = animation;
    animation.onfinish = () => {
      if (growth === animation) growth = undefined;
    };
  });
  observer.observe(content);

  return () => {
    observer.disconnect();
    growth?.cancel();
    growth = undefined;
  };
}
