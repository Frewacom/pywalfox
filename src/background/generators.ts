import {
  ThemeModes,
  PaletteColors,
  IPalette,
  IPywalColors,
  ICustomColors,
  IExtendedPywalColor,
  ICustomPywalColor,
  IBrowserTheme,
  ITemplateItem,
  ITemplateThemeMode,
  IThemeTemplate,
  IUserThemeTemplate,
  IPaletteTemplate,
  IBrowserThemeTemplate,
  IDuckDuckGoTheme,
  IDuckDuckGoThemeTemplate,
  IDuckDuckGoThemeTemplateItem,
} from '@definitions';

import { EXTENSION_THEME_SELCTOR } from '@config/general';
import { EXTENDED_PYWAL_COLORS } from '@config/default-themes';
import { THEME_TEMPLATE_DATA, PALETTE_TEMPLATE_DATA } from '@config/template-data';

import { changeLuminance } from '@utils/colors';

import filter from 'just-filter';
import merge from 'deepmerge';

function isCustomColor(color: IExtendedPywalColor): color is ICustomPywalColor {
  return (color as ICustomPywalColor).colorString !== undefined;
}

export function generatePywalPalette(pywalColors: IPywalColors) {
  const colors = [...pywalColors]; // Prevent mutation of the original pywalColors array

  EXTENDED_PYWAL_COLORS.forEach((color: IExtendedPywalColor) => {
    const { targetIndex } = color;

    if (isCustomColor(color)) {
      const { colorString } = color;
      colors.splice(targetIndex, 0, colorString);
    } else {
      const { colorIndex, modifier, min, max } = color;
      colors.splice(targetIndex, 0, changeLuminance(colors[colorIndex], modifier, min, max));
    }
  });

  return colors;
}

export function generateTheme(
  mode: ITemplateThemeMode,
  pywalColors: IPywalColors,
  customColors: ICustomColors,
  globalTemplate: IThemeTemplate,
  savedTemplate: Partial<IUserThemeTemplate>,
) {
  // Merging a saved template containing null as value for some key
  // will simply set that key to null in the merged template.
  let filteredSavedTemplate = {};
  if (savedTemplate !== null && savedTemplate !== undefined) {
    // TODO: Remove 'just-filter' dependency
    filteredSavedTemplate = filter(savedTemplate, (_, value: unknown) => value);
  }

  const template = merge(globalTemplate, filteredSavedTemplate);
  const palette = generatePalette(pywalColors, customColors, template.palette);

  return {
    palette,
    template,
    hash: generatePaletteHash(palette),
    browser: generateBrowserTheme(palette, template.browser),
    extension: generateExtensionTheme(palette),
    duckduckgo: generateDuckduckgoTheme(palette, template.duckduckgo),
    darkreader: generateDarkreaderScheme(palette, mode),
  };
}

// Creates a unique hash based on the colors in the palette,
export function generatePaletteHash(palette: IPalette) {
  const colors = Object.keys(palette);
  let hash: string = '';

  colors.sort((a: string, b: string) => ((a > b) ? 1 : -1));

  colors.forEach((key: string) => {
    hash += stripHashSymbol(palette[<PaletteColors>key]);
  });

  return hash;
}

export function generatePywalHash(colors: IPywalColors) {
  return colors.reduce((acc: string, color: string) => acc += stripHashSymbol(color), '');
}

export function generatePalette(
  pywalColors: IPywalColors,
  customColors: Partial<IPalette>,
  template: IPaletteTemplate,
) {
  const defaultPalette = createObjectFromTemplateData<IPalette>(
    PALETTE_TEMPLATE_DATA,
    pywalColors,
    template,
  );

  return Object.assign(defaultPalette, customColors);
}

export function generateBrowserTheme(palette: IPalette, template: IBrowserThemeTemplate) {
  return createObjectFromTemplateData<IBrowserTheme>(THEME_TEMPLATE_DATA, palette, template);
}

export function generateDuckduckgoTheme(palette: IPalette, template: IDuckDuckGoThemeTemplate) {
  const theme = <IDuckDuckGoTheme>{};

  Object.keys(template).forEach((key) => {
    const item: IDuckDuckGoThemeTemplateItem = template[key];
    let color: string = palette[item.colorKey];

    if (item.hasOwnProperty('modifier')) {
      color = changeLuminance(color, item.modifier);
    }

    theme[key] = stripHashSymbol(color);
  });

  return theme;
}

export function generateExtensionTheme(palette: IPalette) {
  let variables: string = '';

  PALETTE_TEMPLATE_DATA.forEach(({ target, cssVariable }) => {
    variables += `${cssVariable}:${palette[target]};`;
  });

  return `${EXTENSION_THEME_SELCTOR}{${variables}}`;
}

export function generateDarkreaderScheme({ background, text }: IPalette, mode: ITemplateThemeMode) {
  if (mode === ThemeModes.Dark) {
    return {
      darkSchemeTextColor: text,
      darkSchemeBackgroundColor: background,
    };
  }

  return {
    lightSchemeTextColor: text,
    lightSchemeBackgroundColor: background,
  };
}

/**
 * Creates a palette/browser theme object based on the target keys defined
 * in 'data'. The target key is then used as index in 'template' to get
 * the index of the color in 'values'.
 */
function createObjectFromTemplateData<T>(
  data: ITemplateItem[],
  values: (IPywalColors | IPalette),
  template: (IPaletteTemplate | IBrowserThemeTemplate),
) {
  return data.reduce((obj: T, item: ITemplateItem) => {
    obj[<keyof T>item.target] = values[template[item.target]]; // eslint-disable-line
    return obj;
  }, <T>{});
}

function stripHashSymbol(color: string) {
  return color.substring(1);
}

export default {
  hash: generatePaletteHash,
  pywalHash: generatePywalHash,
  theme: generateTheme,
  palette: generatePalette,
  browser: generateBrowserTheme,
  extension: generateExtensionTheme,
  pywalPalette: generatePywalPalette,
  duckduckgo: generateDuckduckgoTheme,
  darkreader: generateDarkreaderScheme,
};
