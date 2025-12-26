import {
  IPalette,
  IPaletteHash,
  IPywalColors,
  IColorscheme,
  IBrowserTheme,
  IExtensionOptions,
  IThemeTemplate,
  IPaletteTemplate,
  IColorschemeTemplate,
  IDuckDuckGoThemeTemplate,
  ITimeIntervalEndpoint,
  IExtensionState,
  IOptionSetData,
  INativeAppError,
  ITemplateThemeMode,
  CSSTargets,
  ThemeModes,
  TemplateTypes,
  ColorschemeTypes,
  PaletteColors,
} from '@definitions';

import { DEFAULT_CSS_FONT_SIZE } from '@config/general';
import { DEFAULT_THEME_DARK, DEFAULT_THEME_LIGHT } from '@config/default-themes';

export default class State {
  private initialState: IExtensionState;
  public currentState: Partial<IExtensionState>;

  constructor() {
    this.initialState = {
      version: 0.0,
      connected: false,
      nativeError: null,
      theme: {
        mode: ThemeModes.Dark,
        isDay: false,
        isApplied: false,
        pywalColors: null,
        colorscheme: null,
        customColors: {
          [ThemeModes.Light]: null,
          [ThemeModes.Dark]: null,
        },
        templates: {
          [ThemeModes.Light]: DEFAULT_THEME_LIGHT,
          [ThemeModes.Dark]: DEFAULT_THEME_DARK,
        },
      },
      options: {
        userChrome: false,
        userContent: false,
        fontSize: DEFAULT_CSS_FONT_SIZE,
        duckduckgo: false,
        darkreader: false,
        fetchOnStartup: true,
        autoTimeStart: { hour: 10, minute: 0, stringFormat: '10:00' },
        autoTimeEnd: { hour: 19, minute: 0, stringFormat: '19:00' },
        updateMuted: false,
        nativeErrorMuted: false,
      },
    };
  }

  private async set(newState: {}) {
    Object.assign(this.currentState, newState);
    await browser.storage.local.set(newState);
  }

  private setIndividualTemplate(key: keyof IColorschemeTemplate, template: TemplateTypes) {
    const currentThemeMode = this.getTemplateThemeMode();

    return this.set({
      theme: {
        ...this.currentState.theme,
        templates: {
          ...this.currentState.theme.templates,
          [currentThemeMode]: {
            ...this.currentState.theme.templates[currentThemeMode],
            [key]: template,
          },
        },
      },
    });
  }

  private setColorschemeProperty(property: keyof IColorscheme, value: ColorschemeTypes) {
    return this.set({
      theme: {
        ...this.currentState.theme,
        colorscheme: {
          ...this.currentState.theme.colorscheme,
          [property]: value,
        },
      },
    });
  }

  private setOption(option: keyof IExtensionOptions, value: any) {
    return this.set({
      options: {
        ...this.currentState.options,
        [option]: value,
      },
    });
  }

  private getProperty(object: { [key: string]: any }, property: string) {
    if (object) {
      if (object.hasOwnProperty(property)) {
        return object[property];
      }
    }

    return null;
  }

  public getInitialData() {
    return {
      isApplied: this.getApplied(),
      pywalColors: this.getPywalColors(),
      template: this.getTemplate(),
      customColors: this.getCustomColors(),
      themeMode: this.getThemeMode(),
      templateThemeMode: this.getTemplateThemeMode() as ITemplateThemeMode,
      debuggingInfo: this.getDebuggingInfo(),
      options: this.getOptionsData(),
      fontSize: this.getCssFontSize(),
      autoTimeInterval: this.getAutoTimeInterval(),
    };
  }

  public getDebuggingInfo() {
    return {
      version: this.getVersion(),
      connected: this.getConnected(),
      nativeError: this.getNativeError(),
    };
  }

  public getApplied() {
    return this.currentState.theme.isApplied;
  }

  public getVersion() {
    return this.currentState.version;
  }

  public getConnected() {
    return this.currentState.connected;
  }

  public getNativeError() {
    return this.currentState.nativeError;
  }

  public getNativeErrorMuted() {
    return this.currentState.options.nativeErrorMuted;
  }

  public getUpdateMuted() {
    return this.currentState.options.updateMuted;
  }

  public getTemplate() {
    return this.getProperty(this.currentState.theme.templates, this.getTemplateThemeMode());
  }

  public getIsDay() {
    return this.currentState.theme.isDay;
  }

  public getThemeMode() {
    return this.currentState.theme.mode;
  }

  public getTemplateThemeMode() {
    const themeMode = this.getThemeMode();

    if (themeMode === ThemeModes.Auto) {
      return this.getIsDay() ? ThemeModes.Light : ThemeModes.Dark;
    }

    return themeMode;
  }

  public getPywalColors() {
    return this.currentState.theme.pywalColors;
  }

  public getCustomColors() {
    return this.currentState.theme.customColors[this.getTemplateThemeMode()];
  }

  public getColorscheme() {
    return this.currentState.theme.colorscheme;
  }

  public getPaletteHash() {
    return this.getProperty(this.getColorscheme(), 'hash');
  }

  public getPalette() {
    return this.getProperty(this.getColorscheme(), 'palette');
  }

  public getBrowserTheme() {
    return this.getProperty(this.getColorscheme(), 'browser');
  }

  public getExtensionTheme() {
    return this.getProperty(this.getColorscheme(), 'extension');
  }

  public getDDGTheme() {
    return this.getProperty(this.getColorscheme(), 'duckduckgo');
  }

  public getDDGThemeEnabled() {
    return this.currentState.options.duckduckgo;
  }

  public getDarkreaderEnabled() {
    return this.currentState.options.darkreader;
  }

  public getFetchOnStartupEnabled() {
    return this.currentState.options.fetchOnStartup;
  }

  public getCssEnabled(target: string) {
    return this.getProperty(this.currentState.options, target);
  }

  public getCssFontSize() {
    return this.currentState.options.fontSize;
  }

  public getAutoTimeInterval() {
    return {
      start: this.currentState.options.autoTimeStart,
      end: this.currentState.options.autoTimeEnd,
    };
  }

  public getOptionsData() {
    const data: IOptionSetData[] = [];

    Object.keys(this.currentState.options).forEach((key) => {
      const value = this.currentState.options[key];

      if (typeof value === 'boolean') {
        data.push({ option: key, enabled: value });
      } else {
        data.push({ option: key, enabled: true, value });
      }
    });

    return data;
  }

  public setVersion(version: number) {
    return this.set({ version });
  }

  public setConnected(connected: boolean) {
    return this.set({ connected });
  }

  public setNativeError(nativeError: INativeAppError) {
    return this.set({ nativeError });
  }

  public setPaletteTemplate(template: IPaletteTemplate) {
    return this.setIndividualTemplate('palette', template);
  }

  public setThemeTemplate(template: IThemeTemplate) {
    return this.setIndividualTemplate('browser', template);
  }

  public setDDGThemeTemplate(template: IDuckDuckGoThemeTemplate) {
    return this.setIndividualTemplate('duckduckgo', template);
  }

  public setPaletteHash(hash: IPaletteHash) {
    return this.setColorschemeProperty('hash', hash);
  }

  public setBrowserTheme(browserTheme: IBrowserTheme) {
    return this.setColorschemeProperty('browser', browserTheme);
  }

  public setUpdateMuted(enabled: boolean) {
    return this.setOption('updateMuted', enabled);
  }

  public setNativeErrorMuted(enabled: boolean) {
    return this.setOption('nativeErrorMuted', enabled);
  }

  public setDDGThemeEnabled(enabled: boolean) {
    return this.setOption('duckduckgo', enabled);
  }

  public setDarkreaderEnabled(enabled: boolean) {
    return this.setOption('darkreader', enabled);
  }

  public setFetchOnStartupEnabled(enabled: boolean) {
    return this.setOption('fetchOnStartup', enabled);
  }

  public setCssEnabled(target: CSSTargets, enabled: boolean) {
    return this.setOption(target, enabled);
  }

  public setCssFontSize(size: number) {
    return this.setOption('fontSize', size);
  }

  public setApplied(isApplied: boolean) {
    return this.set({
      theme: {
        ...this.currentState.theme,
        isApplied,
      },
    });
  }

  public setCustomColors(customColors: Partial<IPalette>) {
    const currentThemeMode = this.getTemplateThemeMode();

    return this.set({
      theme: {
        ...this.currentState.theme,
        customColors: {
          ...this.currentState.theme.customColors,
          [currentThemeMode]: customColors,
        },
      },
    });
  }

  public resetAllCustomColors() {
    return this.set({
      theme: {
        ...this.currentState.theme,
        customColors: this.initialState.theme.customColors,
      },
    });
  }

  public resetVersion() {
    return this.setVersion(0);
  }

  public setColors(pywalColors: IPywalColors, colorscheme: IColorscheme) {
    return this.set({
      theme: {
        ...this.currentState.theme,
        pywalColors,
        colorscheme,
      },
    });
  }

  public setThemeMode(mode: ThemeModes) {
    return this.set({
      theme: {
        ...this.currentState.theme,
        mode,
      },
    });
  }

  public setIsDay(isDay: boolean) {
    return this.set({
      theme: {
        ...this.currentState.theme,
        isDay,
      },
    });
  }

  public setAutoTimeStart(start: ITimeIntervalEndpoint) {
    return this.set({
      options: {
        ...this.currentState.options,
        autoTimeStart: start,
      },
    });
  }

  public setAutoTimeEnd(end: ITimeIntervalEndpoint) {
    return this.set({
      options: {
        ...this.currentState.options,
        autoTimeEnd: end,
      },
    });
  }

  public async load(themeRefreshCallback: () => void) {
    let shouldRefresh = false;
    const browserInfo = await browser.runtime.getBrowserInfo();
    this.currentState = await browser.storage.local.get(this.initialState);

    // Temporary state migration until a real migration system is implemented
    if (this.getTemplate().duckduckgo.hasOwnProperty('modifier')) {
      this.currentState.theme.templates.dark.duckduckgo = DEFAULT_THEME_DARK.duckduckgo;
      this.currentState.theme.templates.light.duckduckgo = DEFAULT_THEME_LIGHT.duckduckgo;
    }

    // Fix for v89 tab border
    if (browserInfo?.version && browserInfo.version.split('.')[0] === '89') {
      const { dark, light } = this.currentState.theme.templates;

      // We make sure to only change this property if it has not been modified by the user
      if (dark.browser.tab_line === PaletteColors.AccentPrimary) {
        this.currentState.theme.templates.dark.browser.tab_line = PaletteColors.BackgroundLight;
        shouldRefresh = true;
      }

      if (light.browser.tab_line === PaletteColors.AccentPrimary) {
        this.currentState.theme.templates.light.browser.tab_line = PaletteColors.BackgroundLight;
        shouldRefresh = true;
      }
    }

    // Add new Theme API properties for existing users
    const { dark, light } = this.currentState.theme.templates;
    if (!dark.browser.hasOwnProperty('frame_inactive')) {
      this.currentState.theme.templates.dark.browser.frame_inactive = DEFAULT_THEME_DARK.browser.frame_inactive;
      this.currentState.theme.templates.dark.browser.toolbar_text = DEFAULT_THEME_DARK.browser.toolbar_text;
      this.currentState.theme.templates.dark.browser.ntp_card_background = DEFAULT_THEME_DARK.browser.ntp_card_background;
      shouldRefresh = true;
    }
    if (!light.browser.hasOwnProperty('frame_inactive')) {
      this.currentState.theme.templates.light.browser.frame_inactive = DEFAULT_THEME_LIGHT.browser.frame_inactive;
      this.currentState.theme.templates.light.browser.toolbar_text = DEFAULT_THEME_LIGHT.browser.toolbar_text;
      this.currentState.theme.templates.light.browser.ntp_card_background = DEFAULT_THEME_LIGHT.browser.ntp_card_background;
      shouldRefresh = true;
    }

    await browser.storage.local.set(this.currentState);

    if (shouldRefresh) {
      themeRefreshCallback();
    }
  }

  public dump() {
    console.log(this.currentState);
  }
}
