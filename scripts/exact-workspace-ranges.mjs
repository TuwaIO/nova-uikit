/**
 * @file The packages of an alpha take each other in the very version of that alpha. `workspace:^` publishes a caret range,
 * and a caret range of a prerelease takes every later prerelease of the same version, also one of another branch: the parts
 * of a prerelease are compared as text, so an old `fix-…-alpha.1` comes after a new `feat-…-alpha.3`. Stable releases keep the
 * caret. Runs in the root of the repository (`alpha.release.config.js`) and writes `packages/<name>/package.json`.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

for (const name of readdirSync('packages')) {
  const file = `packages/${name}/package.json`;
  if (!existsSync(file)) continue;
  const manifest = readFileSync(file, 'utf8');
  const exact = manifest.replaceAll('"workspace:^"', '"workspace:*"');
  if (exact !== manifest) writeFileSync(file, exact);
}
