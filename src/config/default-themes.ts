import {
  PaletteColors,
  IThemeTemplate,
  IPaletteTemplate,
  IColorschemeTemplate,
  IDuckDuckGoThemeTemplate,
  IExtendedPywalColors,
} from '../definitions';

export const EXTENDED_PYWAL_COLORS: IExtendedPywalColors = [
  { targetIndex: 16, colorIndex: 0, modifier: 1.4 },
  { targetIndex: 17, colorString: '#ffffff' },
  { targetIndex: 18, colorIndex: 0, modifier: 2.5 },
  { targetIndex: 19, colorIndex: 7, modifier: 0.15 },
];

export const DEFAULT_PALETTE_TEMPLATE_DARK: IPaletteTemplate = {
  background: 0,
  backgroundLight: 16,
  backgroundExtra: 18,
  accentPrimary: 10,
  accentSecondary: 5,
  text: 15,
  textFocus: 17,
};

export const DEFAULT_PALETTE_TEMPLATE_LIGHT: IPaletteTemplate = {
  background: 7,
  backgroundLight: 17,
  backgroundExtra: 19,
  accentPrimary: 4,
  accentSecondary: 5,
  text: 16,
  textFocus: 0,
};

export const DEFAULT_BROWSER_TEMPLATE_DARK: IThemeTemplate = {
  icons: PaletteColors.AccentPrimary,
  icons_attention: PaletteColors.AccentSecondary,
  frame: PaletteColors.Background,
  tab_text: PaletteColors.TextFocus,
  tab_loading: PaletteColors.AccentPrimary,
  tab_background_text: PaletteColors.Text,
  tab_selected: PaletteColors.BackgroundLight,
  tab_line: PaletteColors.AccentPrimary,
  tab_background_separator: PaletteColors.BackgroundLight,
  toolbar: PaletteColors.BackgroundLight,
  toolbar_field: PaletteColors.BackgroundExtra,
  toolbar_field_focus: PaletteColors.BackgroundExtra,
  toolbar_field_text: PaletteColors.Text,
  toolbar_field_text_focus: PaletteColors.TextFocus,
  toolbar_field_border: PaletteColors.BackgroundLight,
  toolbar_field_border_focus: PaletteColors.BackgroundLight,
  toolbar_field_separator: PaletteColors.BackgroundLight,
  toolbar_field_highlight: PaletteColors.AccentPrimary,
  toolbar_field_highlight_text: PaletteColors.Background,
  toolbar_bottom_separator: PaletteColors.BackgroundLight,
  toolbar_top_separator: PaletteColors.Background,
  toolbar_vertical_separator: PaletteColors.BackgroundLight,
  ntp_background: PaletteColors.Background,
  ntp_text: PaletteColors.Text,
  popup: PaletteColors.BackgroundLight,
  popup_border: PaletteColors.BackgroundLight,
  popup_text: PaletteColors.Text,
  popup_highlight: PaletteColors.AccentPrimary,
  popup_highlight_text: PaletteColors.Background,
  sidebar: PaletteColors.BackgroundLight,
  sidebar_border: PaletteColors.BackgroundLight,
  sidebar_text: PaletteColors.Text,
  sidebar_highlight: PaletteColors.AccentPrimary,
  sidebar_highlight_text: PaletteColors.TextFocus,
  bookmark_text: PaletteColors.TextFocus,
  button_background_hover: PaletteColors.BackgroundExtra,
  button_background_active: PaletteColors.BackgroundExtra,
};

export const DEFAULT_BROWSER_TEMPLATE_LIGHT: IThemeTemplate = {
  icons: PaletteColors.AccentPrimary,
  icons_attention: PaletteColors.AccentSecondary,
  frame: PaletteColors.Background,
  tab_text: PaletteColors.TextFocus,
  tab_loading: PaletteColors.AccentPrimary,
  tab_background_text: PaletteColors.Text,
  tab_selected: PaletteColors.BackgroundLight,
  tab_line: PaletteColors.AccentPrimary,
  tab_background_separator: PaletteColors.Background,
  toolbar: PaletteColors.BackgroundLight,
  toolbar_field: PaletteColors.BackgroundLight,
  toolbar_field_focus: PaletteColors.BackgroundLight,
  toolbar_field_text: PaletteColors.Text,
  toolbar_field_text_focus: PaletteColors.TextFocus,
  toolbar_field_border: PaletteColors.Background,
  toolbar_field_border_focus: PaletteColors.BackgroundLight,
  toolbar_field_separator: PaletteColors.Background,
  toolbar_field_highlight: PaletteColors.AccentPrimary,
  toolbar_field_highlight_text: PaletteColors.BackgroundLight,
  toolbar_bottom_separator: PaletteColors.Background,
  toolbar_top_separator: PaletteColors.Background,
  toolbar_vertical_separator: PaletteColors.BackgroundLight,
  ntp_background: PaletteColors.Background,
  ntp_text: PaletteColors.Text,
  popup: PaletteColors.BackgroundLight,
  popup_border: PaletteColors.BackgroundLight,
  popup_text: PaletteColors.Text,
  popup_highlight: PaletteColors.AccentPrimary,
  popup_highlight_text: PaletteColors.Background,
  sidebar: PaletteColors.Background,
  sidebar_border: PaletteColors.BackgroundLight,
  sidebar_text: PaletteColors.Text,
  sidebar_highlight: PaletteColors.AccentPrimary,
  sidebar_highlight_text: PaletteColors.TextFocus,
  bookmark_text: PaletteColors.TextFocus,
  button_background_hover: PaletteColors.BackgroundExtra,
  button_background_active: PaletteColors.BackgroundExtra,
};

export const DEFAULT_DDG_THEME_DARK: IDuckDuckGoThemeTemplate = {
  background: PaletteColors.Background,
  headerBackground: PaletteColors.Background,
  resultTitle: PaletteColors.TextFocus,
  resultDescription: PaletteColors.Text,
  resultLink: PaletteColors.AccentSecondary,
  resultLinkVisited: PaletteColors.AccentPrimary,
  hover: PaletteColors.BackgroundLight,
  modifier: 0.2,
};

export const DEFAULT_DDG_THEME_LIGHT: IDuckDuckGoThemeTemplate = {
  background: PaletteColors.BackgroundLight,
  headerBackground: PaletteColors.BackgroundLight,
  resultTitle: PaletteColors.TextFocus,
  resultDescription: PaletteColors.Text,
  resultLink: PaletteColors.AccentSecondary,
  resultLinkVisited: PaletteColors.AccentPrimary,
  hover: PaletteColors.BackgroundLight,
  modifier: -0.3,
};

export const DEFAULT_THEME_DARK: IColorschemeTemplate = {
  palette: DEFAULT_PALETTE_TEMPLATE_DARK,
  browser: DEFAULT_BROWSER_TEMPLATE_DARK,
  duckduckgo: DEFAULT_DDG_THEME_DARK,
};

export const DEFAULT_THEME_LIGHT: IColorschemeTemplate = {
  palette: DEFAULT_PALETTE_TEMPLATE_LIGHT,
  browser: DEFAULT_BROWSER_TEMPLATE_LIGHT,
  duckduckgo: DEFAULT_DDG_THEME_LIGHT,
};
