import { DUCKDUCKGO_THEME_ID } from '../config/general';
import { EXTENDED_PYWAL_COLORS } from '../config/default-themes';
import { THEME_TEMPLATE_DATA, PALETTE_TEMPLATE_DATA } from '../config/template-data';

import { changeLuminance, normalizeLuminance } from '../utils/colors';

import {
  PaletteColors,
  IPalette,
  IPywalColors,
  IBrowserTheme,
  ITemplateItem,
  IThemeTemplate,
  IPaletteTemplate,
  IColorschemeTemplate,
  IDuckDuckGoThemeTemplate,
} from '../definitions';

export function extendPywalColors(pywalColors: IPywalColors) {
  const colors = pywalColors;

  for (const color of EXTENDED_PYWAL_COLORS) {
    const { targetIndex, colorString, colorIndex, modifier, min, max } = color;
    if (color.hasOwnProperty('colorIndex') && color.hasOwnProperty('modifier')) {
      if (color.hasOwnProperty('min') && color.hasOwnProperty('max')) {
        colors.splice(targetIndex, 0, normalizeLuminance(colors[colorIndex], modifier, min, max));
      } else {
        colors.splice(targetIndex, 0, changeLuminance(colors[colorIndex], modifier));
      }
    } else if (color.hasOwnProperty('colorString')) {
      colors.splice(targetIndex, 0, colorString);
    } else {
      console.warn(`Invalid extended pywal color. Missing required properties for targetIndex: ${targetIndex}`);
    }
  }

  return colors;
}

export function generateColorscheme(
  pywalPalette: IPywalColors,
  customColors: Partial<IPalette>,
  template: IColorschemeTemplate
) {
  const originalPalette = createObjectFromTemplateData<IPalette>(PALETTE_TEMPLATE_DATA, pywalPalette, template.palette);

  // Override the templated palette with any custom colors set by the user
  const palette = Object.assign(originalPalette, customColors);

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
  const modifier = template.modifier;

  return {
    'k7':  stripHashSymbol(palette[template.background]),
    'kj':  stripHashSymbol(palette[template.headerBackground]),
    'k9':  stripHashSymbol(palette[template.resultTitle]),
    'k8':  stripHashSymbol(palette[template.resultDescription]),
    'kx':  stripHashSymbol(changeLuminance(palette[template.resultLink], modifier)),
    'kaa': stripHashSymbol(changeLuminance(palette[template.resultLinkVisited], modifier)),
    'k21': stripHashSymbol(palette[template.hover]),
    'kae': DUCKDUCKGO_THEME_ID,
  };
}

export function generateExtensionTheme(palette: IPalette) {
  // String concatenations is used to avoid spaces and escape sequences
  let css: string = 'body,body.light,body.dark{';
  css += `--background: ${palette.background};`;
  css += `--background-light: ${palette.backgroundLight};`;
  css += `--background-extra: ${palette.backgroundExtra};`;
  css += `--text: ${palette.text};`;
  css += `--accent-primary: ${palette.accentPrimary};`;
  css += `--accent-secondary: ${palette.accentSecondary};`;
  css += `--text-focus: ${palette.textFocus};`;
  css += '}';

  return css;
}

/**
 * Creates a palette/browser theme object based on the target keys defined
 * in 'data'. The target key is then used as index in 'template' to get
 * the index of the color in 'values'.
 */
function createObjectFromTemplateData<T>(
  data: ITemplateItem[],
  values: (IPywalColors | IPalette),
  template: (IPaletteTemplate | IThemeTemplate)
) {
  return data.reduce((obj: T, item: ITemplateItem) => {
    obj[<keyof T>item.target] = values[template[item.target]];
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
  colors.sort((a: string, b: string) => (a > b) ? 1 : -1);

  let hash: string = '';
  for (const key of colors) {
    hash += stripHashSymbol(palette[<PaletteColors>key]);
  }

  return hash;
}
