import { describe, expect, it } from 'vitest';

import { cn } from './cn';

describe('cn utility', () => {
  it('combines basic class names', () => {
    const result = cn('btn', 'btn-primary');
    expect(result).toBe('btn btn-primary');
  });

  it('handles conditional classes properly', () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn('base', isActive && 'active', isDisabled && 'disabled', {
      'has-error': true,
      'is-hidden': false,
    });
    expect(result).toBe('base active has-error');
  });

  it('resolves conflicting Tailwind utility classes', () => {
    const result = cn('p-2', 'p-4', 'bg-red-500', 'bg-blue-500');
    expect(result).toBe('p-4 bg-blue-500');
  });

  it('handles falsy values, null, and undefined without errors', () => {
    const isFalse = false;
    const result = cn('px-4', null, undefined, false, isFalse && 'test', '');
    expect(result).toBe('px-4');
  });
});
