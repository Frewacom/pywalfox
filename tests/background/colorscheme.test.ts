import {
   IPalette,
} from '@definitions';

import { createPaletteHash } from '@pywalfox/background/colorscheme';

const paletteA: IPalette = {
  background: '#FFFFFF',
  backgroundLight: '#FFFFFF',
  backgroundExtra: '#FFFFFF',
  text: '#FFFFFF',
  textFocus: '#000000',
  accentPrimary: '#FFFFFF',
  accentSecondary: '#FFFFFF',
};


const paletteB: IPalette = {
  background: '#FFFFFF',
  backgroundLight: '#FFFFFF',
  backgroundExtra: '#000000',
  text: '#FFFFFF',
  textFocus: '#FFFFFF',
  accentPrimary: '#FFFFFF',
  accentSecondary: '#FFFFFF',
};

const hashA: string = createPaletteHash(paletteA);
const hashB: string = createPaletteHash(paletteB);

describe('createPaletteHash', () => {
  test('creates the same hash for identical palettes', () => {
    expect(hashA).toBe(hashA);
  });

  test('creates different hashes for different palettes', () => {
    expect(hashA).not.toBe(hashB);
  });
});

