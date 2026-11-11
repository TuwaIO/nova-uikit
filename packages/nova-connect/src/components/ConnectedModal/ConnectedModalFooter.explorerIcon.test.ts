import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const source = readFileSync(join(__dirname, 'ConnectedModalFooter.tsx'), 'utf8');

// The explorer link of the footer had an icon of its own, which did not move as all the others do
describe('the explorer link of the connected modal', () => {
  it('takes the icon of every explorer link, in both of its states', () => {
    expect(source.match(/<ExternalLinkIcon /g)).toHaveLength(2);
    expect(source).not.toMatch(/\bd="M13\.5 6H5\.25|'M13\.5 6H5\.25/);
  });
});
