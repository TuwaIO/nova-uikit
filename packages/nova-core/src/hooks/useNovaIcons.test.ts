import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import * as heroOutline from '@heroicons/react/24/outline';
import * as heroSolid from '@heroicons/react/24/solid';
import * as pixelOutline from '@tuwaio/nova-icons/24/outline';
import * as pixelSolid from '@tuwaio/nova-icons/24/solid';
import { isValidElement, type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

const { given } = vi.hoisted(() => ({ given: { value: undefined as unknown } }));

// Without a renderer: useContext gives what a test puts in `given`, or the default of the context
vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  return {
    ...react,
    useContext: (context: { _currentValue: unknown }) => given.value ?? context._currentValue,
  };
});

import { NovaIconsProvider } from '../components/NovaIconsProvider';
import { NovaSetIcon } from '../components/NovaSetIcon';
import { heroicons } from '../heroicons';
import {
  NOVA_EXTRA_OUTLINE_ICONS,
  NOVA_OUTLINE_ICONS,
  NOVA_SOLID_ICONS,
  type NovaIconSet,
  pixelIcons,
  useNovaIcons,
} from './useNovaIcons';

describe('the icons of Nova', () => {
  // Nova is pixel by default, and returns to its look of today when heroicons are given
  it('are the pixel ones of @tuwaio/nova-icons without a provider', () => {
    given.value = undefined;
    const icons = useNovaIcons();
    expect(icons.look).toBe('pixel');
    expect(icons.outline.ArrowPathIcon).toBe(pixelOutline.ArrowPathIcon);
    expect(icons.solid.ExclamationTriangleIcon).toBe(pixelSolid.ExclamationTriangleIcon);
  });

  it('are those of the closest provider', () => {
    given.value = heroicons;
    expect(useNovaIcons()).toBe(heroicons);
    given.value = undefined;
  });

  it('have every icon Nova draws, in the pixel set and in the heroicons one', () => {
    for (const name of NOVA_OUTLINE_ICONS) {
      expect(pixelIcons.outline[name], name).toBe(pixelOutline[name]);
      expect(heroicons.outline[name], name).toBe(heroOutline[name]);
    }
    for (const name of NOVA_SOLID_ICONS) {
      expect(pixelIcons.solid[name], name).toBe(pixelSolid[name]);
      expect(heroicons.solid[name], name).toBe(heroSolid[name]);
    }
    expect(heroicons.look).toBe('classic');
  });

  // With the Heroicons set, a package built on Nova (the checkout of Nova Payments) kept its pixel lock, QR code and
  // download beside the thin icons of Nova: the set had no place for an icon Nova does not draw itself
  it('may have the icons that packages built on Nova draw, and the heroicons set has them all', () => {
    for (const name of NOVA_EXTRA_OUTLINE_ICONS) {
      expect(heroicons.outline[name], name).toBe(heroOutline[name]);
      // What such a package falls back to without a set that has the icon
      expect(pixelOutline[name], name).toBeTypeOf('function');
    }
    // None of them is an icon Nova draws: the two lists do not overlap
    expect(NOVA_EXTRA_OUTLINE_ICONS.filter((name) => (NOVA_OUTLINE_ICONS as readonly string[]).includes(name))).toEqual(
      [],
    );
  });

  it('are whole without those icons: a set made before them, and the default one, which loads nothing more', () => {
    // A set of an app, with the icons Nova draws and nothing else, is still a set (this line is checked by the compiler)
    const ownSet: NovaIconSet = { look: 'classic', outline: { ...pixelIcons.outline }, solid: { ...pixelIcons.solid } };
    for (const name of NOVA_EXTRA_OUTLINE_ICONS) {
      expect(ownSet.outline[name], name).toBeUndefined();
      expect(pixelIcons.outline[name], name).toBeUndefined();
    }
    expect(Object.keys(pixelIcons.outline).sort()).toEqual([...NOVA_OUTLINE_ICONS].sort());
  });
});

describe('NovaSetIcon', () => {
  // The Nova components draw their icons through it, so that one switch of the set changes all of them
  it('draws the icon of the set by its name, with the props it is given', () => {
    given.value = heroicons;
    const outline = NovaSetIcon({
      outline: 'InformationCircleIcon',
      className: 'h-4 w-4',
      'aria-hidden': true,
    }) as ReactElement<Record<string, unknown>>;
    expect(outline.type).toBe(heroOutline.InformationCircleIcon);
    expect(outline.props).toEqual({ className: 'h-4 w-4', 'aria-hidden': true });
    const solid = NovaSetIcon({ solid: 'ArrowPathIcon', width: 16 }) as ReactElement<Record<string, unknown>>;
    expect(solid.type).toBe(heroSolid.ArrowPathIcon);
    expect(solid.props).toEqual({ width: 16 });
    given.value = undefined;
    expect((NovaSetIcon({ solid: 'ArrowPathIcon' }) as ReactElement).type).toBe(pixelSolid.ArrowPathIcon);
  });
});

describe('NovaIconsProvider', () => {
  it('sets its icons for the components under it', () => {
    const children = 'the components';
    const element = NovaIconsProvider({ icons: heroicons, children }) as ReactElement<{
      value: unknown;
      children: unknown;
    }>;
    expect(isValidElement(element)).toBe(true);
    expect(element.props.value).toBe(heroicons);
    expect(element.props.children).toBe(children);
  });

  // NovaConnectProvider and NovaTransactionsProvider render it with their `icons` prop: without one they must keep the
  // icons that an outer provider set, not put the pixel ones back
  it('leaves the icons of an outer provider without icons of its own', () => {
    const children = 'the components';
    expect(NovaIconsProvider({ children })).toBe(children);
  });
});

// Only the heroicons entry may import @heroicons/react: the components take their icons from useNovaIcons, so that an
// app on the pixel look never loads Heroicons
describe('the imports of Heroicons', () => {
  const packages = path.resolve(__dirname, '../../..');
  const sources = (dir: string): string[] =>
    readdirSync(dir).flatMap((entry) => {
      const file = path.join(dir, entry);
      if (statSync(file).isDirectory()) return entry === 'node_modules' || entry === 'dist' ? [] : sources(file);
      return /\.tsx?$/.test(entry) && !/\.(test|stories)\.tsx?$/.test(entry) ? [file] : [];
    });

  it('are in the heroicons entry of nova-core alone', () => {
    const importing = readdirSync(packages)
      .flatMap((name) => {
        const src = path.join(packages, name, 'src');
        try {
          return sources(src);
        } catch {
          return [];
        }
      })
      .filter((file) => /from\s+'@heroicons\/react/.test(readFileSync(file, 'utf8')))
      .map((file) => path.relative(packages, file));
    expect(importing).toEqual([path.join('nova-core', 'src', 'heroicons.ts')]);
  });
});
