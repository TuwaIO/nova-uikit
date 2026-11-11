import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

// The Get a wallet screen opens with a sound of its own, and each picture of About wallets draws itself with one
describe('the sounds of the connect window', () => {
  it('plays when the Get a wallet screen opens', () => {
    const source = readFileSync(join(__dirname, 'GetWallet.tsx'), 'utf8');
    expect(source).toMatch(/useEffect\(\(\) => \{\s*play\('getWallet'\);\s*\}, \[play\]\)/);
  });

  it('plays with every picture that draws itself, and with none when nothing is drawn', () => {
    const source = readFileSync(join(__dirname, 'AboutWalletsArt.tsx'), 'utf8');
    expect(source).toMatch(/if \(!reduce\) play\('aboutWallets'\);\s*\}, \[slideId, reduce, play\]\)/);
  });
});
