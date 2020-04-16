import { DEFAULT_PALETTE } from '../config';
import {
  IPalette,
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
    foreground: pywalColors[template.palette.foreground],
    backgroundLight: pywalColors[template.palette.backgroundLight],
    accentPrimary: pywalColors[template.palette.accentPrimary],
    accentSecondary: pywalColors[template.palette.accentSecondary],
    text: pywalColors[template.palette.text],
  }, customColors);

  return {
    palette: palette,
    browser: {
      icons: palette.accentPrimary,
      icons_attention: palette.accentSecondary,
      frame: palette.background,
      tab_text: palette.background,
      tab_loading: palette.accentPrimary,
      tab_background_text: palette.text,
      tab_selected: palette.foreground,
      tab_line: palette.foreground,
      tab_background_separator: palette.background,
      toolbar: palette.background,
      toolbar_field: palette.background,
      toolbar_field_focus: palette.background,
      toolbar_field_text: palette.text,
      toolbar_field_text_focus: palette.text,
      toolbar_field_border: palette.background,
      toolbar_field_border_focus: palette.background,
      toolbar_field_separator: palette.background,
      toolbar_field_highlight: palette.accentPrimary,
      toolbar_field_highlight_text: palette.text,
      toolbar_bottom_separator: palette.background,
      toolbar_top_separator: palette.background,
      toolbar_vertical_separator: palette.backgroundLight,
      ntp_background: palette.background,
      ntp_text: palette.foreground,
      popup: palette.background,
      popup_border: palette.backgroundLight,
      popup_text: palette.foreground,
      popup_highlight: palette.accentSecondary,
      popup_highlight_text: palette.text,
      sidebar: palette.background,
      sidebar_border: palette.backgroundLight,
      sidebar_text: palette.foreground,
      sidebar_highlight: palette.accentPrimary,
      sidebar_highlight_text: palette.text,
      bookmark_text: palette.text,
      button_background_hover: palette.backgroundLight,
      button_background_active: palette.backgroundLight,
    },
  };
}

export function generateExtensionTheme(colorscheme: IColorscheme) {
  return `
    --background: ${colorscheme.palette.background};
    --background-light: ${colorscheme.palette.backgroundLight};
    --foreground: ${colorscheme.palette.foreground};
    --accent-primary: ${colorscheme.palette.accentPrimary};
    --accent-secondary: ${colorscheme.palette.accentSecondary};
    --text: ${colorscheme.palette.text};
  `;
}

export function generateDefaultExtensionTheme() {
  return `
    --background: ${DEFAULT_PALETTE.background};
    --background-light: ${DEFAULT_PALETTE.backgroundLight};
    --foreground: ${DEFAULT_PALETTE.foreground};
    --accent-primary: ${DEFAULT_PALETTE.accentPrimary};
    --accent-secondary: ${DEFAULT_PALETTE.accentSecondary};
    --text: ${DEFAULT_PALETTE.text};
  `;
}

/**
 * Generates the DuckDuckGo theme.
 *
 * @returns {IDuckDuckGoTheme} The cookies used to set the DuckDuckGo theme
 */
export function generateDDGTheme(colorscheme: IColorscheme) {
  return [
    { id: '7',  value: colorscheme.palette.background },        // Background
    { id: 'j',  value: colorscheme.palette.background },        // Header background
    { id: '9',  value: colorscheme.palette.text },              // Result link title
    { id: 'aa', value: colorscheme.palette.accentPrimary },     // Result visited link title
    { id: 'x',  value: colorscheme.palette.accentSecondary },   // Result link url
    { id: '8',  value: 'f8f8f8' },                              // Result description
    { id: '21', value: colorscheme.palette.backgroundLight },   // Result hover, dropdown, etc.
    { id: 'ae', value: 'pywalfox' },                            // The theme name
  ];
}



