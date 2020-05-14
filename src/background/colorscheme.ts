import { DUCKDUCKGO_THEME_ID } from '../config/general';
import { changeColorBrightness } from '../utils/colors';

import {
  PaletteColors,
  IPalette,
  IPywalColors,
  IColorscheme,
  IColorschemeTemplate,
} from '../definitions';


export function generateColorscheme(
  pywalColors: IPywalColors,
  customColors: Partial<IPalette>,
  template: IColorschemeTemplate
) {
  // Override the templated palette with any custom colors set by the user
  const palette = Object.assign({
    background: pywalColors[template.palette.background],
    text: pywalColors[template.palette.text],
    textFocus: pywalColors[template.palette.textFocus],
    backgroundLight: pywalColors[template.palette.backgroundLight],
    accentPrimary: pywalColors[template.palette.accentPrimary],
    accentSecondary: pywalColors[template.palette.accentSecondary],
  }, customColors);

  return {
    hash: createPaletteHash(palette),
    palette: palette,
    browser: {
      icons: palette[template.browser.icons],
      icons_attention: palette[template.browser.icons_attention],
      frame: palette[template.browser.frame],
      tab_text: palette[template.browser.tab_text],
      tab_loading: palette[template.browser.tab_loading],
      tab_background_text: palette[template.browser.tab_background_text],
      tab_selected: palette[template.browser.tab_selected],
      tab_line: palette[template.browser.tab_line],
      tab_background_separator: palette[template.browser.tab_background_separator],
      toolbar: palette[template.browser.toolbar],
      toolbar_field: palette[template.browser.toolbar_field],
      toolbar_field_focus: palette[template.browser.toolbar_field_focus],
      toolbar_field_text: palette[template.browser.toolbar_field_text],
      toolbar_field_text_focus: palette[template.browser.toolbar_field_text_focus],
      toolbar_field_border: palette[template.browser.toolbar_field_border],
      toolbar_field_border_focus: palette[template.browser.toolbar_field_border_focus],
      toolbar_field_separator: palette[template.browser.toolbar_field_separator],
      toolbar_field_highlight: palette[template.browser.toolbar_field_highlight],
      toolbar_field_highlight_text: palette[template.browser.toolbar_field_highlight_text],
      toolbar_bottom_separator: palette[template.browser.toolbar_bottom_separator],
      toolbar_top_separator: palette[template.browser.toolbar_top_separator],
      toolbar_vertical_separator: palette[template.browser.toolbar_vertical_separator],
      ntp_background: palette[template.browser.ntp_background],
      ntp_text: palette[template.browser.ntp_text],
      popup: palette[template.browser.popup],
      popup_border: palette[template.browser.popup_border],
      popup_text: palette[template.browser.popup_text],
      popup_highlight: palette[template.browser.popup_highlight],
      popup_highlight_text: palette[template.browser.popup_highlight_text],
      sidebar: palette[template.browser.sidebar],
      sidebar_border: palette[template.browser.sidebar_border],
      sidebar_text: palette[template.browser.sidebar_text],
      sidebar_highlight: palette[template.browser.sidebar_highlight],
      sidebar_highlight_text: palette[template.browser.sidebar_highlight_text],
      bookmark_text: palette[template.browser.bookmark_text],
      button_background_hover: palette[template.browser.button_background_hover],
      button_background_active: palette[template.browser.button_background_active],
    },
  };
}

export function generateExtensionTheme(colorscheme: IColorscheme) {
  let css: string = 'body, body.light, body.dark {';
  css += `--background: ${colorscheme.palette.background};`;
  css += `--background-light: ${colorscheme.palette.backgroundLight};`;
  css += `--text: ${colorscheme.palette.text};`;
  css += `--accent-primary: ${colorscheme.palette.accentPrimary};`;
  css += `--accent-secondary: ${colorscheme.palette.accentSecondary};`;
  css += `--text-focus: ${colorscheme.palette.textFocus};`;
  css += '}';

  return css;
}

/**
 * Generates the DuckDuckGo theme.
 *
 * @returns {IDuckDuckGoTheme} The cookies used to set the DuckDuckGo theme
 */
export function generateDDGTheme(colorscheme: IColorscheme) {
  const linkColor = changeColorBrightness(colorscheme.palette.accentSecondary, 0.2);
  const visitedLinkColor = changeColorBrightness(colorscheme.palette.accentPrimary, 0.2);

  return {
    hash: colorscheme.hash,
    colors: [
      { id: 'k7',  value: stripHashSymbol(colorscheme.palette.background) },      // Background
      { id: 'kj',  value: stripHashSymbol(colorscheme.palette.background) },      // Header background
      { id: 'k9',  value: stripHashSymbol(colorscheme.palette.textFocus) },       // Result link title
      { id: 'kx',  value: stripHashSymbol(linkColor) },                           // Result link url
      { id: 'kaa', value: stripHashSymbol(visitedLinkColor) },                    // Result visited link title
      { id: 'k8',  value: stripHashSymbol(colorscheme.palette.text) },            // Result description
      { id: 'k21', value: stripHashSymbol(colorscheme.palette.backgroundLight) }, // Result hover, dropdown, etc.
      { id: 'kae', value: DUCKDUCKGO_THEME_ID },                                  // The theme name
    ],
  };
}

/**
 * Creates a unique hash based on the colors in the palette,
 * used to detect when the theme has been changed.
 *
 * @param {IPalette} palette
 * @returns {IPaletteHash} the hash based on palette
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

/**
 * Removes the '#' symbol from a color.
 * This is used because DDG does not support colors starting with '#'.
 *
 * @param {string} color
 * @returns {string} color with the first '#' removed
 */
function stripHashSymbol(color: string) {
  return color.substring(1);
}


