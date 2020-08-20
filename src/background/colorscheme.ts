import {
  PaletteColors,
  IPalette,
  IPywalColors,
  IBrowserTheme,
  ITemplateItem,
  IThemeTemplate,
  IPaletteTemplate,
  IDuckDuckGoTheme,
  IColorschemeTemplate,
  IDuckDuckGoThemeTemplate,
  IDuckDuckGoThemeTemplateItem,
} from '@definitions';

import { EXTENSION_THEME_SELCTOR } from '@config/general';
import { EXTENDED_PYWAL_COLORS } from '@config/default-themes';
import { THEME_TEMPLATE_DATA, PALETTE_TEMPLATE_DATA } from '@config/template-data';

import { changeLuminance } from '@utils/colors';

// TODO: Refactor this ugly function
export function extendPywalColors(pywalColors: IPywalColors) {
  const colors = pywalColors;

  EXTENDED_PYWAL_COLORS.forEach((color) => {
    const {
      targetIndex, colorString, colorIndex, modifier, min, max,
    } = color;
    if (color.hasOwnProperty('colorIndex') && color.hasOwnProperty('modifier')) {
      if (color.hasOwnProperty('min') && color.hasOwnProperty('max')) {
        colors.splice(targetIndex, 0, changeLuminance(colors[colorIndex], modifier, min, max));
      } else {
        colors.splice(targetIndex, 0, changeLuminance(colors[colorIndex], modifier));
      }
    } else if (color.hasOwnProperty('colorString')) {
      colors.splice(targetIndex, 0, colorString);
    } else {
      console.warn(`Invalid extended pywal color. Missing required properties for targetIndex: ${targetIndex}`);
    }
  });

  return colors;
}

export function generateColorscheme(
  pywalPalette: IPywalColors,
  customColors: Partial<IPalette>,
  template: IColorschemeTemplate,
) {
  const originalPalette = createObjectFromTemplateData<IPalette>(
    PALETTE_TEMPLATE_DATA,
    pywalPalette,
    template.palette,
  );

  // Override the templated palette with any custom colors set by the user
  const palette = { ...originalPalette, ...customColors };

  return {
    hash: createPaletteHash(palette),
    palette,
    browser: generateBrowserTheme(palette, template.browser),
    duckduckgo: generateDDGTheme(palette, template.duckduckgo),
    extension: generateExtensionTheme(palette),
  };
}

export function generateBrowserTheme(palette: IPalette, template: IThemeTemplate) {
  return createObjectFromTemplateData<IBrowserTheme>(THEME_TEMPLATE_DATA, palette, template);
}

export function generateDDGTheme(palette: IPalette, template: IDuckDuckGoThemeTemplate) {
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

/**
 * Creates a palette/browser theme object based on the target keys defined
 * in 'data'. The target key is then used as index in 'template' to get
 * the index of the color in 'values'.
 */
function createObjectFromTemplateData<T>(
  data: ITemplateItem[],
  values: (IPywalColors | IPalette),
  template: (IPaletteTemplate | IThemeTemplate),
) {
  return data.reduce((obj: T, item: ITemplateItem) => {
    obj[<keyof T>item.target] = values[template[item.target]]; // eslint-disable-line
    return obj;
  }, <T>{});
}

function stripHashSymbol(color: string) {
  return color.substring(1);
}

/**
 * Creates a unique hash based on the colors in the palette,
 * used to detect when the theme has been changed.
 */
function createPaletteHash(palette: IPalette) {
  const colors = Object.keys(palette);
  let hash: string = '';

  colors.sort((a: string, b: string) => ((a > b) ? 1 : -1));

  colors.forEach((key: string) => {
    hash += stripHashSymbol(palette[<PaletteColors>key]);
  });

  return hash;
}
