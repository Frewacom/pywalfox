import {
  PaletteColors,
  DuckDuckGoSettingKeys,
  IThemeTemplate,
  IPaletteTemplate,
  IColorschemeTemplate,
  IDuckDuckGoThemeTemplate,
  IExtendedPywalColors,
} from '@definitions';

export const EXTENDED_PYWAL_COLORS: IExtendedPywalColors = [
  {
    targetIndex: 16,
    colorIndex: 0,
    modifier: 1.25,
  },
  {
    targetIndex: 17,
    colorString: '#ffffff',
  },
  {
    targetIndex: 18,
    colorIndex: 0,
    modifier: 1.85,
  },
  {
    targetIndex: 19,
    colorIndex: 7,
    modifier: 0.1,
    min: 205,
    max: 220,
  },
];

export const DEFAULT_PALETTE_TEMPLATE_DARK: IPaletteTemplate = {
  background: 0,
  backgroundLight: 16,
  backgroundExtra: 18,
  accentPrimary: 10,
  accentSecondary: 13,
  text: 15,
  textFocus: 17,
};

export const DEFAULT_PALETTE_TEMPLATE_LIGHT: IPaletteTemplate = {
  background: 19,
  backgroundLight: 17,
  backgroundExtra: 7,
  accentPrimary: 3,
  accentSecondary: 5,
  text: 16,
  textFocus: 0,
};

export const BASE_BROWSER_TEMPLATE = {
  icons: PaletteColors.AccentPrimary,
  icons_attention: PaletteColors.AccentSecondary,
  frame: PaletteColors.Background,
  frame_inactive: PaletteColors.Background,
  tab_text: PaletteColors.TextFocus,
  tab_loading: PaletteColors.AccentPrimary,
  tab_background_text: PaletteColors.Text,
  tab_selected: PaletteColors.BackgroundLight,
  tab_line: PaletteColors.BackgroundLight,
  toolbar: PaletteColors.BackgroundLight,
  toolbar_text: PaletteColors.TextFocus,
  toolbar_field_text: PaletteColors.Text,
  toolbar_field_text_focus: PaletteColors.TextFocus,
  toolbar_field_border_focus: PaletteColors.BackgroundLight,
  toolbar_field_highlight: PaletteColors.AccentPrimary,
  toolbar_top_separator: PaletteColors.Background,
  toolbar_vertical_separator: PaletteColors.BackgroundLight,
  ntp_background: PaletteColors.Background,
  ntp_text: PaletteColors.Text,
  ntp_card_background: PaletteColors.BackgroundLight,
  popup: PaletteColors.BackgroundLight,
  popup_border: PaletteColors.BackgroundLight,
  popup_text: PaletteColors.Text,
  popup_highlight: PaletteColors.AccentPrimary,
  popup_highlight_text: PaletteColors.Background,
  sidebar: PaletteColors.BackgroundLight,
  sidebar_text: PaletteColors.Text,
  sidebar_highlight: PaletteColors.AccentPrimary,
  sidebar_highlight_text: PaletteColors.TextFocus,
  button_background_hover: PaletteColors.BackgroundExtra,
  button_background_active: PaletteColors.BackgroundExtra,
};

export const DEFAULT_BROWSER_TEMPLATE_DARK: IThemeTemplate = {
  tab_background_separator: PaletteColors.BackgroundLight,
  toolbar_field: PaletteColors.BackgroundExtra,
  toolbar_field_focus: PaletteColors.BackgroundExtra,
  toolbar_field_border: PaletteColors.BackgroundLight,
  toolbar_field_separator: PaletteColors.BackgroundLight,
  toolbar_field_highlight_text: PaletteColors.Background,
  toolbar_bottom_separator: PaletteColors.BackgroundLight,
  sidebar_border: PaletteColors.BackgroundLight,
  ...BASE_BROWSER_TEMPLATE,
};

export const DEFAULT_BROWSER_TEMPLATE_LIGHT: IThemeTemplate = {
  tab_background_separator: PaletteColors.Background,
  toolbar_field: PaletteColors.BackgroundLight,
  toolbar_field_focus: PaletteColors.BackgroundLight,
  toolbar_field_border: PaletteColors.Background,
  toolbar_field_separator: PaletteColors.Background,
  toolbar_field_highlight_text: PaletteColors.BackgroundLight,
  toolbar_bottom_separator: PaletteColors.Background,
  sidebar_border: PaletteColors.Background,
  ...BASE_BROWSER_TEMPLATE,
};

const BASE_DDG_THEME = (mainBackground: PaletteColors) => ({
  [DuckDuckGoSettingKeys.Background]: {
    colorKey: mainBackground,
  },
  [DuckDuckGoSettingKeys.HeaderBackground]: {
    colorKey: mainBackground,
  },
  [DuckDuckGoSettingKeys.ResultTitle]: {
    colorKey: PaletteColors.TextFocus,
  },
  [DuckDuckGoSettingKeys.ResultDescription]: {
    colorKey: PaletteColors.Text,
  },
  [DuckDuckGoSettingKeys.Hover]: {
    colorKey: PaletteColors.BackgroundLight,
  },
});

export const DEFAULT_DDG_TEMPLATE_DARK: IDuckDuckGoThemeTemplate = {
  [DuckDuckGoSettingKeys.ResultLink]: {
    colorKey: PaletteColors.AccentSecondary,
    modifier: 0.2,
  },
  [DuckDuckGoSettingKeys.ResultLinkVisited]: {
    colorKey: PaletteColors.AccentPrimary,
    modifier: 0.2,
  },
  ...BASE_DDG_THEME(PaletteColors.Background),
};

export const DEFAULT_DDG_TEMPLATE_LIGHT: IDuckDuckGoThemeTemplate = {
  [DuckDuckGoSettingKeys.ResultLink]: {
    colorKey: PaletteColors.AccentSecondary,
    modifier: -0.3,
  },
  [DuckDuckGoSettingKeys.ResultLinkVisited]: {
    colorKey: PaletteColors.AccentPrimary,
    modifier: -0.3,
  },
  ...BASE_DDG_THEME(PaletteColors.BackgroundLight),
};

export const DEFAULT_THEME_DARK: IColorschemeTemplate = {
  palette: DEFAULT_PALETTE_TEMPLATE_DARK,
  browser: DEFAULT_BROWSER_TEMPLATE_DARK,
  duckduckgo: DEFAULT_DDG_TEMPLATE_DARK,
};

export const DEFAULT_THEME_LIGHT: IColorschemeTemplate = {
  palette: DEFAULT_PALETTE_TEMPLATE_LIGHT,
  browser: DEFAULT_BROWSER_TEMPLATE_LIGHT,
  duckduckgo: DEFAULT_DDG_TEMPLATE_LIGHT,
};
