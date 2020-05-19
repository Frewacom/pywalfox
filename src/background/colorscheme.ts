import { changeLuminance } from '../utils/colors';
import { DUCKDUCKGO_THEME_ID } from '../config/general';
import { EXTENDED_PYWAL_COLORS } from '../config/default-themes';

import {
  PaletteColors,
  IPalette,
  IPywalColors,
  IThemeTemplate,
  IColorschemeTemplate,
  IDuckDuckGoThemeTemplate,
} from '../definitions';

export function extendPywalColors(pywalColors: IPywalColors) {
  const colors = pywalColors;

  for (const color of EXTENDED_PYWAL_COLORS) {
    const { targetIndex, colorString, colorIndex, modifier } = color;
    if (color.hasOwnProperty('colorIndex') && color.hasOwnProperty('modifier')) {
      colors.splice(targetIndex, 0, changeLuminance(colors[colorIndex], modifier));
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
  // Override the templated palette with any custom colors set by the user
  const palette = Object.assign({
    background: pywalPalette[template.palette.background],
    text: pywalPalette[template.palette.text],
    textFocus: pywalPalette[template.palette.textFocus],
    backgroundLight: pywalPalette[template.palette.backgroundLight],
    accentPrimary: pywalPalette[template.palette.accentPrimary],
    accentSecondary: pywalPalette[template.palette.accentSecondary],
  }, customColors);

  return {
    hash: createPaletteHash(palette),
    palette,
    browser: generateBrowserTheme(palette, template.browser),
    duckduckgo: generateDDGTheme(palette, template.duckduckgo),
    extension: generateExtensionTheme(palette),
  };
}

export function generateBrowserTheme(palette: IPalette, template: IThemeTemplate) {
  return {
    icons: palette[template.icons],
    icons_attention: palette[template.icons_attention],
    frame: palette[template.frame],
    tab_text: palette[template.tab_text],
    tab_loading: palette[template.tab_loading],
    tab_background_text: palette[template.tab_background_text],
    tab_selected: palette[template.tab_selected],
    tab_line: palette[template.tab_line],
    tab_background_separator: palette[template.tab_background_separator],
    toolbar: palette[template.toolbar],
    toolbar_field: palette[template.toolbar_field],
    toolbar_field_focus: palette[template.toolbar_field_focus],
    toolbar_field_text: palette[template.toolbar_field_text],
    toolbar_field_text_focus: palette[template.toolbar_field_text_focus],
    toolbar_field_border: palette[template.toolbar_field_border],
    toolbar_field_border_focus: palette[template.toolbar_field_border_focus],
    toolbar_field_separator: palette[template.toolbar_field_separator],
    toolbar_field_highlight: palette[template.toolbar_field_highlight],
    toolbar_field_highlight_text: palette[template.toolbar_field_highlight_text],
    toolbar_bottom_separator: palette[template.toolbar_bottom_separator],
    toolbar_top_separator: palette[template.toolbar_top_separator],
    toolbar_vertical_separator: palette[template.toolbar_vertical_separator],
    ntp_background: palette[template.ntp_background],
    ntp_text: palette[template.ntp_text],
    popup: palette[template.popup],
    popup_border: palette[template.popup_border],
    popup_text: palette[template.popup_text],
    popup_highlight: palette[template.popup_highlight],
    popup_highlight_text: palette[template.popup_highlight_text],
    sidebar: palette[template.sidebar],
    sidebar_border: palette[template.sidebar_border],
    sidebar_text: palette[template.sidebar_text],
    sidebar_highlight: palette[template.sidebar_highlight],
    sidebar_highlight_text: palette[template.sidebar_highlight_text],
    bookmark_text: palette[template.bookmark_text],
    button_background_hover: palette[template.button_background_hover],
    button_background_active: palette[template.button_background_active],
  };
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
  css += `--text: ${palette.text};`;
  css += `--accent-primary: ${palette.accentPrimary};`;
  css += `--accent-secondary: ${palette.accentSecondary};`;
  css += `--text-focus: ${palette.textFocus};`;
  css += '}';

  return css;
}

function stripHashSymbol(color: string) {
  return color.substring(1);
}

/**
 * Creates a unique hash based on the colors in the palette,
 * used to detect when the theme has been changed.
 *
 * @param {IPalette} palette
 * @returns {string} the hash based on palette
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


