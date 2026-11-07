import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const css = readFileSync(join(__dirname, '../styles/icons.css'), 'utf8');

describe('the arrows of the icons', () => {
  it.each(['tuwa-link-arrow', 'tuwa-exit-arrow'])('%s moves on a button only while it can be pressed', (arrow) => {
    expect(css).toContain(`button:not(:disabled):hover .${arrow}`);
    expect(css).not.toContain(`button:hover .${arrow}`);
    expect(css).not.toContain(`button:focus-visible .${arrow}`);
  });
});
