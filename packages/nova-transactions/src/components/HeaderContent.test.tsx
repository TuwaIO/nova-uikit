import { isValidElement, type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { HeaderContent } from './HeaderContent';

const children = (element: unknown) => (element as ReactElement<{ children: unknown[] }>).props.children;

describe('HeaderContent', () => {
  it('has a back button with an accessible name only with onBack', () => {
    const onBack = vi.fn();
    const [back] = children(HeaderContent({ title: 'Title', onBack, backLabel: 'Back to history' }));

    expect(isValidElement(back)).toBe(true);
    expect((back as ReactElement<Record<string, unknown>>).props).toMatchObject({ 'aria-label': 'Back to history' });
    (back as ReactElement<{ onClick: () => void }>).props.onClick();
    expect(onBack).toHaveBeenCalledOnce();

    const [withoutBack] = children(HeaderContent({ title: 'Title', backLabel: 'Back to history' }));
    expect(withoutBack).toBeFalsy();
  });
});
