export interface IPywalColors extends Array<string> {
  [index: number]: string;
}

export interface IPywalData {
  colors: IPywalColors;
  wallpaper: string;
}

export interface IExtendedPywalColorBase {
  targetIndex: number;
}

export interface ICustomPywalColor extends IExtendedPywalColorBase {
  colorString: string;
}

export interface IModifiedPywalColor extends IExtendedPywalColorBase {
  colorIndex: number;
  modifier: number;
  min?: number;
  max?: number;
}

export type IExtendedPywalColor = IModifiedPywalColor | ICustomPywalColor;
export type IExtendedPywalColors = IExtendedPywalColor[];

export type IPaletteHash = string;

export enum PaletteColors {
  Background = 'background',
  BackgroundLight = 'backgroundLight',
  BackgroundExtra = 'backgroundExtra',
  AccentPrimary = 'accentPrimary',
  AccentSecondary = 'accentSecondary',
  Text = 'text',
  TextFocus = 'textFocus',
}

export enum CSSTargets {
  UserChrome = 'userChrome',
  UserContent = 'userContent',
}

export enum ThemeModes {
  Dark = 'dark',
  Light = 'light',
  Auto = 'auto',
}

export enum DuckDuckGoSettingKeys {
  Background = 'k7',
  HeaderBackground = 'kj',
  ResultTitle = 'k9',
  ResultDescription = 'k8',
  ResultLink = 'kx',
  ResultLinkVisited = 'kaa',
  Hover = 'k21',
  ThemeId = 'kae',
}

export enum DuckDuckGoThemeKeys {
  Dark = 'd',
  Light = 'l',
  Pywalfox = 'pywalfox',
}

export type DuckDuckGoColorKeys = Exclude<DuckDuckGoSettingKeys, DuckDuckGoSettingKeys.ThemeId>;

export type ITemplateThemeMode = Exclude<ThemeModes, ThemeModes.Auto>;

export interface IBrowserTheme {
  icons: string;
  icons_attention: string;
  frame: string;
  tab_text: string;
  tab_loading: string;
  tab_background_text: string;
  tab_selected: string;
  tab_line: string;
  tab_background_separator: string;
  toolbar: string;
  toolbar_field: string;
  toolbar_field_focus: string;
  toolbar_field_text: string;
  toolbar_field_text_focus: string;
  toolbar_field_border: string;
  toolbar_field_border_focus: string;
  toolbar_field_separator: string;
  toolbar_field_highlight: string;
  toolbar_field_highlight_text: string;
  toolbar_bottom_separator: string;
  toolbar_top_separator: string;
  toolbar_vertical_separator: string;
  ntp_background: string;
  ntp_text: string;
  popup: string;
  popup_border: string;
  popup_text: string;
  popup_highlight: string;
  popup_highlight_text: string;
  sidebar: string;
  sidebar_border: string;
  sidebar_text: string;
  sidebar_highlight: string;
  sidebar_highlight_text: string;
  bookmark_text: string;
  button_background_hover: string;
  button_background_active: string;
}

export type IExtensionTheme = string;

export interface IColorscheme {
  hash: IPaletteHash;
  palette: IPalette;
  browser: IBrowserTheme;
  extension: IExtensionTheme;
  duckduckgo: IDuckDuckGoTheme;
  darkreader: IDarkreaderScheme;
}

export interface IThemeTemplate {
  [key: string]: PaletteColors;
}

export type IPalette = Record<PaletteColors, string>;

export type IPaletteTemplate = Record<PaletteColors, number>;

export type IDuckDuckGoTheme = Record<DuckDuckGoColorKeys, string>;

export type IDuckDuckGoThemeTemplate = Record<DuckDuckGoColorKeys, IDuckDuckGoThemeTemplateItem>;

export interface IDuckDuckGoThemeTemplateItem {
  colorKey: string;
  modifier?: number;
}

export interface IColorschemeTemplate {
  palette: IPaletteTemplate;
  browser: IThemeTemplate;
  duckduckgo: IDuckDuckGoThemeTemplate;
}

export type TemplateTypes =
  | IPaletteTemplate
  | IThemeTemplate
  | IDuckDuckGoThemeTemplate;

export type ColorschemeTypes =
  | IPalette
  | IPaletteHash
  | IBrowserTheme
  | IDuckDuckGoTheme
  | IExtensionTheme;

export type ICustomColors = Record<ITemplateThemeMode, Partial<IPalette>>;

export type IColorschemeTemplates = Record<ITemplateThemeMode, IColorschemeTemplate>;

export interface IExtensionOptions {
  [CSSTargets.UserChrome]: boolean;
  [CSSTargets.UserContent]: boolean;
  fontSize: number;
  duckduckgo: boolean;
  darkreader: boolean;
  autoTimeStart: ITimeIntervalEndpoint;
  autoTimeEnd: ITimeIntervalEndpoint;
}

export interface IExtensionMessage {
  action: string;
  data?: any;
}

export type IDarkreaderErrorCallback = (message: string) => void;

export interface IDarkreaderDarkscheme {
  darkSchemeBackgroundColor: string;
  darkSchemeTextColor: string;
}

export interface IDarkreaderLightScheme {
  lightSchemeBackgroundColor: string;
  lightSchemeTextColor: string;
}

export type IDarkreaderScheme = IDarkreaderLightScheme | IDarkreaderDarkscheme

export interface IDarkreaderThemeMode {
  mode: number;
}

export interface IDarkreaderMessage {
  type: string;
  data?: IDarkreaderScheme | IDarkreaderThemeMode;
}

export interface IOptionSetData {
  option: string;
  enabled: boolean;
  value?: any;
}

export interface IThemeModeData {
  mode: ThemeModes;
  templateMode: ITemplateThemeMode;
}

export interface INativeAppMessage {
  action: string;
  success: boolean;
  error?: string;
  data?: any;
}

export interface INativeAppRequest {
  action: string;
  target?: string;
  size?: number;
}

export interface INativeAppMessageCallbacks {
  connected: () => void,
  updateNeeded: () => void,
  disconnected: () => void,
  version: (version: string) => void,
  output: (message: string, error?: boolean) => void,
  pywalColorsFetchSuccess: (pywalColors: IPywalColors) => void,
  pywalColorsFetchFailed: (error: string) => void,
  cssToggleSuccess: (target: string) => void,
  cssToggleFailed: (target: string, error: string) => void,
  cssFontSizeSetSuccess: (size: number) => void,
  cssFontSizeSetFailed: (error: string) => void,
}

export interface INodeLookup {
  [key: string]: HTMLElement;
}

export interface IInitialData {
  isApplied: boolean;
  pywalColors: IPywalColors;
  template: IColorschemeTemplate;
  customColors: Partial<IPalette>;
  themeMode: ThemeModes;
  templateThemeMode: ITemplateThemeMode;
  debuggingInfo: IDebuggingInfoData;
  options: IOptionSetData[];
  fontSize: number;
  autoTimeInterval: ITimeIntervalEndpoints
}

export interface IDebuggingInfoData {
  version: number;
  connected: boolean;
}

export interface INotificationData {
  title: string;
  message: string;
  error: boolean;
}

export interface IDuckDuckGoThemeSetData {
  hash: IPaletteHash;
  theme: IDuckDuckGoTheme;
}

export interface ITemplateItem {
  title: string;
  description: string;
  target: string;
  cssVariable?: string;
}

export interface ITimeIntervalEndpoint {
  hour: number;
  minute: number;
  stringFormat: string;
}

export interface ITimeIntervalEndpoints {
  start: ITimeIntervalEndpoint,
  end: ITimeIntervalEndpoint,
}

export type IAutoModeTriggerCallback = (isDay: boolean) => void;

export interface IExtensionState {
  version: number,
  connected: boolean;
  updateMuted: boolean;
  theme: {
    mode: ThemeModes;
    isDay: boolean;
    isApplied: boolean;
    pywalColors: IPywalColors;
    colorscheme: IColorscheme;
    customColors: ICustomColors;
    templates: IColorschemeTemplates;
  };
  options: IExtensionOptions;
}

/**
 * Expose 'wrappedJSObject' from the 'window' namespace.
 *
 * @remarks
 * The object is used by the DuckDuckGo content script to interface
 * with the DuckDuckGo scripts. It allows us to get and set settings
 * using the built-in functions.
 */
declare global {
  interface Window {
    wrappedJSObject: {
      DDG: {
        settings: {
          get: (key: DuckDuckGoSettingKeys) => unknown,
          set: (key: DuckDuckGoSettingKeys, value: unknown) => void,
          setTheme: (key: DuckDuckGoThemeKeys) => void,
        }
      },
    };
  }
}
