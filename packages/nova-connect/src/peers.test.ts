import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

// nova-connect draws through the icon set of nova-core (NovaSetIcon, useNovaIcons, NovaIconsProvider, `still` of the drawn
// marks), first released in nova-core 0.14: a peer range that lets 0.13 in installs a nova-core without them, and the build of
// the app fails on the missing exports
describe('the peer dependencies of nova-connect and nova-transactions', () => {
  it.each(['nova-connect', 'nova-transactions'])('%s asks for the nova-core with the icon set', (name) => {
    const pkg = JSON.parse(readFileSync(path.resolve(__dirname, `../../${name}/package.json`), 'utf8')) as {
      peerDependencies: Record<string, string>;
    };
    expect(pkg.peerDependencies['@tuwaio/nova-core']).toBe('>=0.14');
    const readme = readFileSync(path.resolve(__dirname, `../../${name}/README.md`), 'utf8');
    expect(readme).not.toMatch(/`@tuwaio\/nova-core` \(>=0\.1[0-3]?\)/);
  });
});
