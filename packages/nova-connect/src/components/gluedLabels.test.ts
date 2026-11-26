import { globSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const SRC = path.resolve(__dirname, '..');

// Two labels put one after another are a sentence in English alone: "Активний Конектори (1)", "Wird geladen transaktionen in der
// app...". A text of two parts is one label, or two sentences with a colon or a period between them
const GLUED = /\{labels\.[\w.]+(?:\(\))?\}\s*(?:\$?\{labels\.)/;

describe('the labels of Nova Connect', () => {
  it('are never put together into a phrase', () => {
    const glued = globSync('**/*.tsx', { cwd: SRC })
      .filter((file) => !file.endsWith('.test.tsx'))
      .flatMap((file) =>
        readFileSync(path.join(SRC, file), 'utf8')
          .split('\n')
          .flatMap((line, index) => (GLUED.test(line) ? [`${file}:${index + 1} ${line.trim()}`] : [])),
      );

    expect(glued).toEqual([]);
  });
});
