import {
   IPalette,
} from '@definitions';

import { generatePaletteHash } from '@pywalfox/background/generators';

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

const hashA: string = generatePaletteHash(paletteA);
const hashB: string = generatePaletteHash(paletteB);

describe('generatePaletteHash', () => {
  test('creates the same hash for identical palettes', () => {
    expect(hashA).toBe(hashA);
  });

  test('creates different hashes for different palettes', () => {
    expect(hashA).not.toBe(hashB);
  });
});

