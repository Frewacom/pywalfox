import {
   IPalette,
   IPaletteTemplate,
   IPywalColors,
   IDuckDuckGoTheme,
   IDuckDuckGoThemeTemplate,
} from '@definitions';

import Generators from '@pywalfox/background/generators';
import { EXTENDED_PYWAL_COLORS, DEFAULT_THEME_DARK } from '@config/default-themes';

const pywalColors: IPywalColors = [
  '#000000',
  '#111111',
  '#222222',
  '#333333',
  '#444444',
  '#555555',
  '#666666',
  '#777777',
  '#888888',
  '#999999',
  '#AAAAAA',
  '#BBBBBB',
  '#CCCCCC',
  '#DDDDDD',
  '#EEEEEE',
  '#FFFFFF',
];

const customColors: Partial<IPalette> = {
  backgroundLight: '#XXXXXX',
  textFocus: '#YYYYYY',
};

const paletteA: IPalette = {
  background: '#000000',
  backgroundLight: '#111111',
  backgroundExtra: '#222222',
  accentPrimary: '#555555',
  accentSecondary: '#666666',
  text: '#333333',
  textFocus: '#444444',
};

const paletteB: IPalette = {
  background: '#666666',
  backgroundLight: '#111111',
  backgroundExtra: '#222222',
  accentPrimary: '#555555',
  accentSecondary: '#000000',
  text: '#333333',
  textFocus: '#444444',
};

const pywalPalette: IPywalColors = Generators.pywalPalette(pywalColors);
const paletteTemplate: IPaletteTemplate = DEFAULT_THEME_DARK.palette;
const duckduckgoTemplate: IDuckDuckGoThemeTemplate = DEFAULT_THEME_DARK.duckduckgo;
const defaultPalette: IPalette = Generators.palette(pywalPalette, {}, paletteTemplate);

describe('generatePywalPalette', () => {
  test('creates an extended pywalColors array', () => {
    expect(pywalPalette.length).toBe(pywalColors.length + EXTENDED_PYWAL_COLORS.length);
  });
});

describe('generatePaletteHash', () => {
  test('creates the same hash for identical palettes', () => {
    const hashA: string = Generators.hash(paletteA);
    const hashB: string = Generators.hash(paletteA);

    expect(hashA).toBe(hashB);
  });

  test('creates different hashes for different palettes', () => {
    const hashA: string = Generators.hash(paletteA);
    const hashB: string = Generators.hash(paletteB);

    expect(hashA).not.toBe(hashB);
  });
});

describe('generatePalette', () => {
  test('creates a palette with the same amount of keys as the template', () => {
    const paletteKeys = Object.keys(defaultPalette);
    const templateKeys = Object.keys(paletteTemplate);

    expect(paletteKeys.length).toBe(templateKeys.length);
  });

  test('does not create a palette with colors that are undefined', () => {
    expect(Object.values(defaultPalette)).not.toContain(undefined);
  });

  test('creates a palette based on pywal colors and template', () => {
    Object.keys(defaultPalette).forEach((key) => {
      expect(defaultPalette[key]).toBe(pywalPalette[paletteTemplate[key]]);
    });
  });

  test('custom colors override generated palette', () => {
    const palette: IPalette = Generators.palette(pywalColors, customColors, paletteTemplate);

    Object.keys(customColors).forEach((key) => {
      expect(palette[key]).toBe(customColors[key]);
    });
  });
});

describe('generateDuckduckgoTheme', () => {
  const theme: IDuckDuckGoTheme = Generators.duckduckgo(defaultPalette, duckduckgoTemplate);
  const themeColors: string[] = Object.values(theme);

  test('creates a theme with hex colors of length 6', () => {
    themeColors.forEach((color) => {
      expect(color).toHaveLength(6);
    });
  });

  test('removes the hash symbol from each hex color', () => {
    Object.values(theme).forEach((color: string) => {
      expect(color.charAt(0)).not.toBe('#');
    });
  });
});
