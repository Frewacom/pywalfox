import { DEFAULT_CSS_FONT_SIZE } from '../config/general';
import { DEFAULT_THEME_DARK, DEFAULT_THEME_LIGHT } from '../config/default-themes';

import {
  IPalette,
  IPaletteHash,
  IPywalColors,
  IColorscheme,
  IBrowserTheme,
  ICustomColors,
  IExtensionOptions,
  IThemeTemplate,
  IPaletteTemplate,
  IColorschemeTemplate,
  IColorschemeTemplates,
  IDuckDuckGoThemeTemplate,
  ITimeIntervalEndpoint,
  IOptionSetData,
  CSSTargets,
  ThemeModes,
  TemplateTypes,
  ColorschemeTypes,
} from '../definitions';

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

export class State {
  private initialState: IExtensionState;
  public currentState: { [key: string]: any };

  constructor() {
    this.initialState = {
      version: 0.0,
      connected: false,
      updateMuted: false,
      theme: {
        mode: ThemeModes.Dark,
        isDay: false,
        isApplied: false,
        pywalColors: null,
        colorscheme: null,
        customColors: {
          [ThemeModes.Light]: {},
          [ThemeModes.Dark]: {},
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
        autoTimeStart: { hour: 10, minute: 0, stringFormat: '10:00' },
        autoTimeEnd: { hour: 19, minute: 0, stringFormat: '19:00' },
      }
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
      templateThemeMode: this.getTemplateThemeMode(),
      debuggingInfo: this.getDebuggingInfo(),
      options: this.getOptionsData(),
      fontSize: this.getCssFontSize(),
      autoTimeInterval: this.getAutoTimeInterval(),
    };
  }

  public getDebuggingInfo() {
    return {
      connected: this.getVersion(),
      version: this.getConnected(),
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

  public getUpdateMuted() {
    return this.currentState.updateMuted;
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

  public getCssEnabled(target: string) {
    return this.getProperty(this.currentState.options, target);
  }

  public getCssFontSize() {
    return this.currentState.options.fontSize;
  }

  public getAutoTimeInterval() {
    return {
      start: this.currentState.options.autoTimeStart,
      end: this.currentState.options.autoTimeEnd
    };
  }

  public getOptionsData() {
    let data: IOptionSetData[] = [];
    for (const key in this.currentState.options) {
      const value = this.currentState.options[key];
      if (typeof value === 'boolean') {
        data.push({ option: key, enabled: value });
      } else {
        data.push({ option: key, enabled: true, value });
      }
    }

    return data;
  }

  public setVersion(version: number) {
    return this.set({ version });
  }

  public setConnected(connected: boolean) {
    return this.set({ connected });
  }

  public setUpdateMuted(muted: boolean) {
    return this.set({ updateMuted: muted });
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

  public setDDGThemeEnabled(enabled: boolean) {
    return this.setOption('duckduckgo', enabled);
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

  public setColors(pywalColors: IPywalColors, colorscheme: IColorscheme) {
    return this.set({
      theme: {
        ...this.currentState.theme,
        pywalColors: pywalColors,
        colorscheme: colorscheme,
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

  public async load() {
    this.currentState = await browser.storage.local.get(this.initialState);
}

  public dump() {
    console.log(this.currentState);
  }
}
