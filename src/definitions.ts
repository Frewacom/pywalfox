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

export interface IThemeTemplate {
  palette: IPaletteTemplate;
  browser: IBrowserThemeTemplate;
  duckduckgo: IDuckDuckGoThemeTemplate;
}

export type IGlobalTemplates = Record<ITemplateThemeMode, NonNullable<IThemeTemplate>>;

export interface IUserTheme {
  customColors?: NonNullable<ICustomColors>;
  userTemplate?: NonNullable<Partial<IThemeTemplate>>;
}

export type IUserThemes = Partial<Record<IPywalHash, Record<ITemplateThemeMode, IUserTheme>>>;

export interface ITheme {
  hash: IPaletteHash;
  palette: IPalette;
  browser: IBrowserTheme;
  extension: IExtensionTheme;
  duckduckgo: IDuckDuckGoTheme;
  darkreader: IDarkreaderTheme;
  template: IThemeTemplate;
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

export type IBrowserThemeTemplate = Record<keyof IBrowserTheme, PaletteColors>;

export type IPaletteHash = string;

export type IPywalHash = string;

export type IPalette = Record<PaletteColors, string>;

export type ICustomColors = Partial<IPalette>;

export type IPaletteTemplate = Record<PaletteColors, number>;

export type IExtensionTheme = string;

export type IDuckDuckGoTheme = Record<DuckDuckGoColorKeys, string>;

export type IDuckDuckGoThemeTemplate = Record<DuckDuckGoColorKeys, IDuckDuckGoThemeTemplateItem>;

// TODO: Replace this and the pywal color extension types with a generic type
export interface IDuckDuckGoThemeTemplateItem {
  colorKey: string;
  modifier?: number;
}

export interface IExtensionMessage {
  action: string;
  data?: any;
}

export type IDarkreaderErrorCallback = (message: string) => void;

export interface IDarkreaderDarkTheme {
  darkSchemeBackgroundColor: string;
  darkSchemeTextColor: string;
}

export interface IDarkreaderLightTheme {
  lightSchemeBackgroundColor: string;
  lightSchemeTextColor: string;
}

export type IDarkreaderTheme = IDarkreaderLightTheme | IDarkreaderDarkTheme;

export interface IDarkreaderThemeMode {
  mode: number;
}

export interface IDarkreaderMessage {
  type: string;
  data?: IDarkreaderTheme | IDarkreaderThemeMode;
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
  pywalColorsFetchSuccess: (pywalData: IPywalData) => void,
  pywalColorsFetchFailed: (error: string) => void,
  cssToggleSuccess: (target: CSSTargets) => void,
  cssToggleFailed: (target: CSSTargets, error: string) => void,
  cssFontSizeSetSuccess: (size: number) => void,
  cssFontSizeSetFailed: (error: string) => void,
}

export interface INodeLookup {
  [key: string]: HTMLElement;
}

export interface IInitialData {
  isApplied: boolean;
  pywalColors: IPywalColors;
  template: IThemeTemplate;
  userTheme: IUserTheme;
  themeMode: ThemeModes;
  templateThemeMode: ITemplateThemeMode;
  debuggingInfo: IDebuggingInfoData;
  options: IOptionSetData[];
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

export interface IExtensionOptions {
  [CSSTargets.UserChrome]: boolean;
  [CSSTargets.UserContent]: boolean;
  fontSize: number;
  duckduckgo: boolean;
  darkreader: boolean;
  intervalStart: ITimeIntervalEndpoint;
  intervalEnd: ITimeIntervalEndpoint;
}

export interface IExtensionState {
  version: number,
  connected: boolean;
  updateMuted: boolean;
  mode: ThemeModes;
  isDay: boolean;
  isApplied: boolean;
  pywalColors: IPywalColors;
  pywalHash: IPywalHash;
  generatedTheme: ITheme;
  globalTemplates: IGlobalTemplates;
  userThemes: IUserThemes;
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
