import { DEFAULT_COLORSCHEME } from '../config';
import { IColorscheme, IBrowserTheme, IExtensionTheme, IDuckDuckGoTheme } from '../definitions';

export function generateColorscheme() {
  // TODO: Implement
}

/**
 * Generates the browser theme.
 *
 * @returns {IBrowserTheme};
 */
export function generateBrowserTheme(colorscheme: IColorscheme) {
  return {
    icons: colorscheme.icons,
    icons_attention: colorscheme.icons_attention,
    frame: colorscheme.frame,
    tab_text: colorscheme.tab_text,
    tab_loading: colorscheme.tab_loading,
    tab_background_text: colorscheme.tab_background_text,
    tab_selected: colorscheme.tab_selected,
    tab_line: colorscheme.tab_line,
    tab_background_separator: colorscheme.tab_background_separator,
    toolbar: colorscheme.toolbar,
    toolbar_field: colorscheme.toolbar_field,
    toolbar_field_focus: colorscheme.toolbar_field_focus,
    toolbar_field_text: colorscheme.toolbar_field_text,
    toolbar_field_text_focus: colorscheme.toolbar_field_text_focus,
    toolbar_field_border: colorscheme.toolbar_field_border,
    toolbar_field_border_focus: colorscheme.toolbar_field_border_focus,
    toolbar_field_separator: colorscheme.toolbar_field_separator,
    toolbar_field_highlight: colorscheme.toolbar_field_highlight,
    toolbar_field_highlight_text: colorscheme.toolbar_field_highlight_text,
    toolbar_bottom_separator: colorscheme.toolbar_bottom_separator,
    toolbar_top_separator: colorscheme.toolbar_top_separator,
    toolbar_vertical_separator: colorscheme.toolbar_vertical_separator,
    ntp_background: colorscheme.ntp_background,
    ntp_text: colorscheme.ntp_text,
    popup: colorscheme.popup,
    popup_border: colorscheme.popup_border,
    popup_text: colorscheme.popup_text,
    popup_highlight: colorscheme.popup_highlight,
    popup_highlight_text: colorscheme.popup_highlight_text,
    sidebar: colorscheme.sidebar,
    sidebar_border: colorscheme.sidebar_border,
    sidebar_text: colorscheme.sidebar_text,
    sidebar_highlight: colorscheme.sidebar_highlight,
    sidebar_highlight_text: colorscheme.sidebar_highlight_text,
    bookmark_text: colorscheme.bookmark_text,
    button_background_hover: colorscheme.button_background_hover,
    button_background_active: colorscheme.button_background_active,
  };
}

export function generateExtensionTheme(colorscheme: IColorscheme) {
  return {
    background: colorscheme.background,
    backgroundLight: colorscheme.backgroundLight,
    foreground: colorscheme.foreground,
    accentPrimary: colorscheme.accentPrimary,
    accentSecondary: colorscheme.accentSecondary,
    text: colorscheme.text,
  };
}

export function generateDefaultExtensionTheme() {
  return {
    background: DEFAULT_COLORSCHEME.background,
    backgroundLight: DEFAULT_COLORSCHEME.backgroundLight,
    foreground: DEFAULT_COLORSCHEME.foreground,
    accentPrimary: DEFAULT_COLORSCHEME.accentPrimary,
    accentSecondary: DEFAULT_COLORSCHEME.accentSecondary,
    text: DEFAULT_COLORSCHEME.text,
  }
}

/**
 * Generates the DuckDuckGo theme.
 *
 * @returns {IDuckDuckGoTheme} The cookies used to set the DuckDuckGo theme
 */
export function generateDDGTheme(colorscheme: IColorscheme) {
  return [
    { id: '7',  value: colorscheme.background },        // Background
    { id: 'j',  value: colorscheme.background },        // Header background
    { id: '9',  value: colorscheme.text },              // Result link title
    { id: 'aa', value: colorscheme.accentPrimary },     // Result visited link title
    { id: 'x',  value: colorscheme.accentSecondary },   // Result link url
    { id: '8',  value: 'f8f8f8' },                      // Result description
    { id: '21', value: colorscheme.backgroundLight },   // Result hover, dropdown, etc.
    { id: 'ae', value: 'pywalfox' },                    // The theme name
  ];
}



