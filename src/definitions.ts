export interface IPywalColors extends Array<string> {
  [index: number]: string;
}

export interface IExtendedPywalColorBase {
  targetIndex: number;
  colorString?: string;
  colorIndex?: number;
  modifier?: number;
  min?: number;
  max?: number;
}

export interface ICustomPywalColor extends IExtendedPywalColorBase {}
export interface IModifiedPywalColor extends IExtendedPywalColorBase {}

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

export enum DuckDuckGoThemeKeys {
  Background = 'k7',
  HeaderBackground = 'kj',
  ResultTitle = 'k9',
  ResultDescription = 'k8',
  ResultLink = 'kx',
  ResultLinkVisited = 'kaa',
  Hover = 'k21',
}

export type IPalette = {
  [key in PaletteColors]: string;
}

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

export type IDuckDuckGoTheme = {
  [key in DuckDuckGoThemeKeys]: string;
}

export interface IColorscheme {
  hash: IPaletteHash;
  palette: IPalette;
  browser: IBrowserTheme;
  duckduckgo: IDuckDuckGoTheme;
  extension: IExtensionTheme;
}

export type IPaletteTemplate = {
  [key in PaletteColors]: number;
}

export interface IThemeTemplate {
  [key: string]: PaletteColors;
}

export interface IDuckDuckGoThemeTemplateItem {
  colorKey: string;
  modifier?: number;
}

export type IDuckDuckGoThemeTemplate = {
  [key in DuckDuckGoThemeKeys]: IDuckDuckGoThemeTemplateItem;
}

export interface IColorschemeTemplate {
  palette: IPaletteTemplate;
  browser: IThemeTemplate;
  duckduckgo: IDuckDuckGoThemeTemplate;
}

export type TemplateTypes = IPaletteTemplate | IThemeTemplate | IDuckDuckGoThemeTemplate;
export type ColorschemeTypes = IPalette | IPaletteHash | IBrowserTheme | IDuckDuckGoTheme | IExtensionTheme;

export interface ICustomColors {
  [ThemeModes.Dark]: Partial<IPalette>;
  [ThemeModes.Light]: Partial<IPalette>;
}

export interface IColorschemeTemplates {
  [ThemeModes.Light]: IColorschemeTemplate;
  [ThemeModes.Dark]: IColorschemeTemplate;
}

export interface IExtensionOptions {
  [CSSTargets.UserChrome]: boolean;
  [CSSTargets.UserContent]: boolean;
  fontSize: number;
  duckduckgo: boolean;
  autoTimeStart: ITimeIntervalEndpoint;
  autoTimeEnd: ITimeIntervalEndpoint;
}

export interface IExtensionMessage {
  action: string;
  data?: any;
};

export interface IOptionSetData {
  option: string;
  enabled: boolean;
  value?: any;
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
  templateThemeMode: ThemeModes;
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
    wrappedJSObject: { DDG: any; };
  }
}
