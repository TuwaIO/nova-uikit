import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

// Owner, 2026-11-07: these two screens open with a sound of their own, each time, as the screen mounts
describe('the screens of the connect window', () => {
  it.each([
    ['GetWallet.tsx', 'getWallet'],
    ['AboutWallets.tsx', 'aboutWallets'],
  ])('%s plays %s when it opens', (file, sound) => {
    const source = readFileSync(join(__dirname, file), 'utf8');
    expect(source).toMatch(new RegExp(`useEffect\\(\\(\\) => \\{\\s*play\\('${sound}'\\);\\s*\\}, \\[play\\]\\)`));
  });
});
