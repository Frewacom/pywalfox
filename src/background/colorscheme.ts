import { DEFAULT_PALETTE, DUCKDUCKGO_THEME_ID } from '../config';
import {
  IPalette,
  IPaletteHash,
  IPywalColors,
  IColorscheme,
  IColorschemeTemplate,
  IBrowserTheme,
  IExtensionTheme,
  IDuckDuckGoTheme,
} from '../definitions';

export function generateColorscheme(
  pywalColors: IPywalColors,
  customColors: IPalette,
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
      icons: palette.accentPrimary,
      icons_attention: palette.accentSecondary,
      frame: palette.background,
      tab_text: palette.textFocus,
      tab_loading: palette.accentPrimary,
      tab_background_text: palette.text,
      tab_selected: palette.backgroundLight,
      tab_line: palette.accentPrimary,
      tab_background_separator: palette.background,
      toolbar: palette.backgroundLight,
      toolbar_field: palette.backgroundLight,
      toolbar_field_focus: palette.background,
      toolbar_field_text: palette.text,
      toolbar_field_text_focus: palette.text,
      toolbar_field_border: palette.background,
      toolbar_field_border_focus: palette.background,
      toolbar_field_separator: palette.background,
      toolbar_field_highlight: palette.accentPrimary,
      toolbar_field_highlight_text: palette.textFocus,
      toolbar_bottom_separator: palette.background,
      toolbar_top_separator: palette.background,
      toolbar_vertical_separator: palette.backgroundLight,
      ntp_background: palette.background,
      ntp_text: palette.text,
      popup: palette.background,
      popup_border: palette.backgroundLight,
      popup_text: palette.text,
      popup_highlight: palette.accentSecondary,
      popup_highlight_text: palette.textFocus,
      sidebar: palette.background,
      sidebar_border: palette.backgroundLight,
      sidebar_text: palette.text,
      sidebar_highlight: palette.accentPrimary,
      sidebar_highlight_text: palette.textFocus,
      bookmark_text: palette.textFocus,
      button_background_hover: palette.backgroundLight,
      button_background_active: palette.backgroundLight,
    },
  };
}

export function generateExtensionTheme(colorscheme: IColorscheme) {
  return `
    body.light, body.dark {
      --background: ${colorscheme.palette.background};
      --background-light: ${colorscheme.palette.backgroundLight};
      --text: ${colorscheme.palette.text};
      --accent-primary: ${colorscheme.palette.accentPrimary};
      --accent-secondary: ${colorscheme.palette.accentSecondary};
      --textFocus: ${colorscheme.palette.textFocus};
    }
  `;
}

/**
 * Generates the DuckDuckGo theme.
 *
 * @returns {IDuckDuckGoTheme} The cookies used to set the DuckDuckGo theme
 */
export function generateDDGTheme(colorscheme: IColorscheme) {
  return {
    hash: colorscheme.hash,
    colors: [
      { id: 'k7',  value: stripHashSymbol(colorscheme.palette.background) },        // Background
      { id: 'kj',  value: stripHashSymbol(colorscheme.palette.background) },        // Header background
      { id: 'k9',  value: stripHashSymbol(colorscheme.palette.text) },              // Result link title
      { id: 'kaa', value: stripHashSymbol(colorscheme.palette.accentPrimary) },     // Result visited link title
      { id: 'kx',  value: stripHashSymbol(colorscheme.palette.accentSecondary) },   // Result link url
      { id: 'k8',  value: 'f8f8f8' },                                               // Result description
      { id: 'k21', value: stripHashSymbol(colorscheme.palette.backgroundLight) },   // Result hover, dropdown, etc.
      { id: 'kae', value: DUCKDUCKGO_THEME_ID },                                    // The theme name
    ],
  };
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
    hash += stripHashSymbol(palette[key]);
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


